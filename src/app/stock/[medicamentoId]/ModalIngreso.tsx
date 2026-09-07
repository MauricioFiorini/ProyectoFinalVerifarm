"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Modal } from "@/components/ui/Modal";
import { hoyComoTexto } from "@/lib/fechas";

// Modal de registro de ingreso (tarea 4.13).
//
// Da de alta el lote Y su cantidad en un solo pedido: el endpoint los mete en la
// misma transaccion. Si fueran dos llamadas y la segunda fallara, quedaria un
// lote en cero que parece existir y no tiene nada.
//
// Como en el alta de medicamento, aca NO se revalidan las reglas: se manda lo
// que la persona escribio y se pinta lo que el servidor conteste. Que el
// vencimiento tenga que ser posterior al ingreso lo decide el servicio.

type Props = {
  medicamentoId: string;
  nombreMedicamento: string;
  alCerrar: () => void;
  alRegistrar: () => void;
};

type RespuestaDeError = { error?: string; campos?: Record<string, string> };

export function ModalIngreso({
  medicamentoId,
  nombreMedicamento,
  alCerrar,
  alRegistrar,
}: Props) {
  // La fecha de ingreso viene con hoy puesto: es lo que va a ser casi siempre, y
  // se puede cambiar si el lote llego antes y se carga con retraso.
  const [valores, setValores] = useState({
    numeroLote: "",
    fechaIngreso: hoyComoTexto(),
    fechaVencimiento: "",
    cantidad: "",
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo: keyof typeof valores) => (valor: string) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErrores(({ [campo]: _descartado, ...resto }) => resto);
  };

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErrores({});
    setErrorGeneral(null);

    try {
      const respuesta = await fetch("/api/lotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicamentoId,
          numeroLote: valores.numeroLote,
          fechaIngreso: valores.fechaIngreso,
          fechaVencimiento: valores.fechaVencimiento,
          cantidad:
            valores.cantidad === "" ? undefined : Number(valores.cantidad),
        }),
      });

      if (respuesta.ok) {
        alRegistrar();
        alCerrar();
        return;
      }

      const cuerpo = (await respuesta.json()) as RespuestaDeError;
      setErrores(cuerpo.campos ?? {});
      if (!cuerpo.campos) {
        setErrorGeneral(cuerpo.error ?? "No se pudo registrar el ingreso.");
      }
    } catch {
      setErrorGeneral(
        "No se pudo contactar al servidor. Revisá tu conexión y volvé a intentar.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      abierto
      titulo={`Registrar ingreso · ${nombreMedicamento}`}
      alCerrar={alCerrar}
      acciones={
        <>
          <Boton onClick={alCerrar} disabled={enviando}>
            Cancelar
          </Boton>
          <Boton
            variante="primario"
            type="submit"
            form="form-ingreso"
            disabled={enviando}
          >
            {enviando ? "Registrando…" : "Registrar"}
          </Boton>
        </>
      }
    >
      <form
        id="form-ingreso"
        onSubmit={enviar}
        noValidate
        className="flex flex-col gap-4"
      >
        {errorGeneral ? (
          <p
            role="alert"
            className="rounded-md border border-critico-borde bg-critico-fondo px-3 py-2 text-sm text-critico-texto"
          >
            {errorGeneral}
          </p>
        ) : null}

        <Campo
          etiqueta="Número de lote"
          placeholder="Ej: L-9021-A"
          value={valores.numeroLote}
          onChange={(e) => cambiar("numeroLote")(e.target.value)}
          error={errores.numeroLote}
          ayuda="El que trae el fabricante."
          autoComplete="off"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            etiqueta="Fecha de ingreso"
            type="date"
            value={valores.fechaIngreso}
            onChange={(e) => cambiar("fechaIngreso")(e.target.value)}
            error={errores.fechaIngreso}
            ayuda="Cuándo entró a farmacia."
          />

          <Campo
            etiqueta="Vencimiento"
            type="date"
            value={valores.fechaVencimiento}
            onChange={(e) => cambiar("fechaVencimiento")(e.target.value)}
            error={errores.fechaVencimiento}
          />
        </div>

        <Campo
          etiqueta="Cantidad"
          type="number"
          min={1}
          step={1}
          placeholder="0"
          value={valores.cantidad}
          onChange={(e) => cambiar("cantidad")(e.target.value)}
          error={errores.cantidad}
          ayuda="Se registra como movimiento de ingreso, junto con el lote."
        />
      </form>
    </Modal>
  );
}
