"use client";

import { useCallback, useEffect, useState } from "react";
import type { TipoMovimiento } from "@prisma/client";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";
import { Tabla, type Columna } from "@/components/ui/Tabla";
import { formatearFechaHora } from "@/lib/fechas";

// Historial de movimientos de un lote (tarea 4.16).
//
// **No hay botones de editar ni de borrar, y no es un olvido.** El historial de
// movimientos es un libro mayor: un asiento no se corrige reescribiendolo, se
// corrige con un asiento nuevo. Ver docs/CONVENCIONES.md seccion 7.
//
// Si alguna vez aparece la necesidad de "arreglar" un movimiento, la respuesta
// es registrar el movimiento inverso, no agregar un boton aca.

type Movimiento = {
  id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  fecha: string;
  nombreUsuario: string;
};

type Estado = "cargando" | "listo" | "error";

const COLUMNAS: Columna<Movimiento>[] = [
  {
    clave: "fecha",
    encabezado: "Fecha",
    celda: (m) => (
      <span className="text-texto-tenue">{formatearFechaHora(m.fecha)}</span>
    ),
  },
  {
    clave: "tipo",
    encabezado: "Tipo",
    celda: (m) => (
      <span
        className={
          m.tipo === "INGRESO"
            ? "font-medium text-ok-texto"
            : "font-medium text-critico-texto"
        }
      >
        {m.tipo === "INGRESO" ? "Ingreso" : "Egreso"}
      </span>
    ),
  },
  {
    clave: "cantidad",
    encabezado: "Cantidad",
    alineacion: "derecha",
    // El signo hace legible el saldo de un vistazo: la columna se puede sumar
    // con la vista y da el disponible.
    celda: (m) => (
      <span className="font-medium">
        {m.tipo === "INGRESO" ? "+" : "−"}
        {m.cantidad}
      </span>
    ),
  },
  {
    clave: "usuario",
    encabezado: "Usuario",
    celda: (m) => <span className="text-texto-tenue">{m.nombreUsuario}</span>,
  },
];

export function ModalHistorial({
  loteId,
  numeroLote,
  alCerrar,
}: {
  loteId: string;
  numeroLote: string;
  alCerrar: () => void;
}) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [estado, setEstado] = useState<Estado>("cargando");

  const cargar = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/movimientos?loteId=${encodeURIComponent(loteId)}`,
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      setMovimientos((await r.json()) as Movimiento[]);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }, [loteId]);

  // Ver la nota de TablaDeStock.tsx sobre por que va dentro de un callback.
  useEffect(() => {
    const t = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(t);
  }, [cargar]);

  return (
    <Modal
      abierto
      titulo={`Movimientos del lote ${numeroLote}`}
      alCerrar={alCerrar}
      acciones={<Boton onClick={alCerrar}>Cerrar</Boton>}
    >
      {estado === "cargando" ? (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-texto-tenue"
        >
          Cargando movimientos…
        </p>
      ) : estado === "error" ? (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p className="text-sm text-critico-texto">
            No se pudo cargar el historial.
          </p>
          <Boton onClick={() => void cargar()}>Reintentar</Boton>
        </div>
      ) : (
        <>
          <Tabla
            columnas={COLUMNAS}
            filas={movimientos}
            claveDeFila={(m) => m.id}
            descripcion={`Movimientos del lote ${numeroLote}`}
            mensajeVacio="Este lote todavía no tiene movimientos"
          />

          <p className="mt-4 text-xs text-texto-sutil">
            El historial no se edita ni se borra. Un error se corrige con un
            movimiento nuevo.
          </p>
        </>
      )}
    </Modal>
  );
}
