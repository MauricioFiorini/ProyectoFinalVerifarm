"use client";

import { useCallback, useEffect, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Modal } from "@/components/ui/Modal";
import { formatearFecha } from "@/lib/fechas";
import { useUsuarioSimulado } from "@/context/UsuarioSimuladoContext";

// Modal de dispensación con FEFO (tareas 4.14 y 4.15).
//
// SE ELIGE CANTIDAD, NO LOTE. Es el punto del proyecto: quien dispensa dice
// cuánto necesita y el sistema decide de qué lote sale, empezando por el que
// vence antes. Si eligiera el lote a mano, FEFO no serviría de nada.
//
// El plan se pide al servidor mientras se escribe la cantidad, con
// `ejecutar: false`, que previsualiza sin escribir nada. Recién al confirmar se
// vuelve a pedir con `ejecutar: true`.
//
// El plan NO se calcula en el cliente: la misma lógica que lo propone es la que
// después lo ejecuta, y así no pueden discrepar.

type Props = {
  medicamentoId: string;
  nombreMedicamento: string;
  alCerrar: () => void;
  alDispensar: () => void;
};

type LineaDelPlan = {
  loteId: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidad: number;
};

type Plan = {
  lineas: LineaDelPlan[];
  cantidadPedida: number;
  cantidadCubierta: number;
  faltante: number;
};

type Previsualizacion =
  | { estado: "vacio" }
  | { estado: "pidiendo" }
  | { estado: "listo"; plan: Plan }
  | { estado: "insuficiente"; mensaje: string }
  | { estado: "error"; mensaje: string };

export function ModalDispensar({
  medicamentoId,
  nombreMedicamento,
  alCerrar,
  alDispensar,
}: Props) {
  const { usuario } = useUsuarioSimulado();
  const [cantidad, setCantidad] = useState("");
  const [previa, setPrevia] = useState<Previsualizacion>({ estado: "vacio" });
  const [confirmando, setConfirmando] = useState(false);

  const previsualizar = useCallback(
    async (texto: string) => {
      const numero = Number(texto);

      if (texto === "" || !Number.isInteger(numero) || numero <= 0) {
        setPrevia({ estado: "vacio" });
        return;
      }

      setPrevia({ estado: "pidiendo" });

      try {
        const r = await fetch("/api/dispensaciones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicamentoId, cantidad: numero }),
        });

        const cuerpo = await r.json();

        if (r.ok) {
          setPrevia({ estado: "listo", plan: cuerpo.plan as Plan });
          return;
        }

        // 422 es "no hay existencia suficiente", y el mensaje del servidor ya
        // trae cuánto hay. Es la tarea 4.15.
        setPrevia({
          estado: r.status === 422 ? "insuficiente" : "error",
          mensaje: (cuerpo.error as string) ?? "No se pudo calcular el plan.",
        });
      } catch {
        setPrevia({
          estado: "error",
          mensaje: "No se pudo contactar al servidor.",
        });
      }
    },
    [medicamentoId],
  );

  // Se espera a que deje de tipear. Ver la nota de TablaDeStock.tsx sobre por
  // qué la llamada va dentro de un callback.
  useEffect(() => {
    const t = setTimeout(() => void previsualizar(cantidad), 300);
    return () => clearTimeout(t);
  }, [cantidad, previsualizar]);

  async function confirmar() {
    setConfirmando(true);

    try {
      const r = await fetch("/api/dispensaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicamentoId,
          cantidad: Number(cantidad),
          ejecutar: true,
          usuarioId: usuario.id,
        }),
      });

      if (r.ok) {
        alDispensar();
        alCerrar();
        return;
      }

      const cuerpo = await r.json();
      // Puede fallar acá aunque la previsualización haya dado bien: entre una
      // cosa y la otra pudo entrar otro egreso. El servidor replanifica dentro
      // de la transacción, así que este mensaje es el estado real.
      setPrevia({
        estado: r.status === 422 ? "insuficiente" : "error",
        mensaje: (cuerpo.error as string) ?? "No se pudo dispensar.",
      });
    } catch {
      setPrevia({
        estado: "error",
        mensaje: "No se pudo contactar al servidor.",
      });
    } finally {
      setConfirmando(false);
    }
  }

  const puedeConfirmar = previa.estado === "listo" && !confirmando;

  return (
    <Modal
      abierto
      titulo={`Dispensar · ${nombreMedicamento}`}
      alCerrar={alCerrar}
      acciones={
        <>
          <Boton onClick={alCerrar} disabled={confirmando}>
            Cancelar
          </Boton>
          <Boton
            variante="primario"
            onClick={() => void confirmar()}
            disabled={!puedeConfirmar}
          >
            {confirmando ? "Confirmando…" : "Confirmar egreso"}
          </Boton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Campo
          etiqueta="Cantidad a dispensar"
          type="number"
          min={1}
          step={1}
          placeholder="0"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          ayuda="El sistema elige los lotes: sale primero el que vence antes."
          autoFocus
        />

        {previa.estado === "pidiendo" ? (
          <p className="text-sm text-texto-tenue">Calculando el plan…</p>
        ) : null}

        {previa.estado === "insuficiente" ? (
          <p
            role="alert"
            className="rounded-md border border-critico-borde bg-critico-fondo px-3 py-2 text-sm text-critico-texto"
          >
            {previa.mensaje}
          </p>
        ) : null}

        {previa.estado === "error" ? (
          <p
            role="alert"
            className="rounded-md border border-critico-borde bg-critico-fondo px-3 py-2 text-sm text-critico-texto"
          >
            {previa.mensaje}
          </p>
        ) : null}

        {previa.estado === "listo" ? (
          <div className="rounded-md border border-info-borde bg-info-fondo px-4 py-3">
            <p className="text-sm font-medium text-info-texto">
              Plan de egreso
            </p>

            <ul className="mt-2 flex flex-col gap-1.5">
              {previa.plan.lineas.map((l) => (
                <li key={l.loteId} className="text-sm text-texto">
                  <span className="font-medium">{l.cantidad}</span> del lote{" "}
                  <span className="font-mono">{l.numeroLote}</span>
                  <span className="text-texto-tenue">
                    , vence {formatearFecha(l.fechaVencimiento)}
                  </span>
                </li>
              ))}
            </ul>

            {previa.plan.lineas.length > 1 ? (
              <p className="mt-3 text-xs text-texto-tenue">
                Se reparte entre {previa.plan.lineas.length} lotes porque el
                primero no alcanza.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
