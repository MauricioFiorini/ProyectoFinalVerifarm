"use client";

import { useCallback, useEffect, useState } from "react";
import type { UnidadMedida } from "@prisma/client";
import { Boton } from "@/components/ui/Boton";
import { Tabla, type Columna } from "@/components/ui/Tabla";
import { NOMBRE_DE_UNIDAD } from "@/lib/unidades";

// Lotes de un medicamento (tarea 4.12).
//
// Consume GET /api/lotes?medicamentoId=…, que devuelve el medicamento y sus
// lotes con el disponible ya calculado, ordenados por vencimiento mas proximo
// primero: el mismo orden en el que FEFO los va a consumir.

export type LoteDeApi = {
  id: string;
  numeroLote: string;
  fechaIngreso: string;
  fechaVencimiento: string;
  disponible: number;
};

export type MedicamentoDeApi = {
  id: string;
  nombre: string;
  unidad: UnidadMedida;
  stockMinimo: number;
  rxcui: string | null;
};

type Respuesta = { medicamento: MedicamentoDeApi; lotes: LoteDeApi[] };
type Estado = "cargando" | "listo" | "error";

/** Fecha en formato local corto. Las que llegan por JSON son texto ISO. */
export function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const COLUMNAS: Columna<LoteDeApi>[] = [
  {
    clave: "numero",
    encabezado: "Lote",
    celda: (l) => <span className="font-mono font-medium">{l.numeroLote}</span>,
  },
  {
    clave: "ingreso",
    encabezado: "Ingreso",
    celda: (l) => (
      <span className="text-texto-tenue">{fecha(l.fechaIngreso)}</span>
    ),
  },
  {
    clave: "vencimiento",
    encabezado: "Vencimiento",
    celda: (l) => fecha(l.fechaVencimiento),
  },
  {
    clave: "disponible",
    encabezado: "Disponible",
    alineacion: "derecha",
    celda: (l) => <span className="font-medium">{l.disponible}</span>,
  },
];

export function LotesDelMedicamento({
  medicamentoId,
}: {
  medicamentoId: string;
}) {
  const [datos, setDatos] = useState<Respuesta | null>(null);
  const [estado, setEstado] = useState<Estado>("cargando");

  const cargar = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/lotes?medicamentoId=${encodeURIComponent(medicamentoId)}`,
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      setDatos((await r.json()) as Respuesta);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }, [medicamentoId]);

  // Ver la nota de src/app/stock/TablaDeStock.tsx sobre por que la carga va en
  // un callback y no en el cuerpo del efecto.
  useEffect(() => {
    const t = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(t);
  }, [cargar]);

  if (estado === "cargando") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center gap-3 rounded-lg border border-borde bg-superficie px-4 py-12 text-sm text-texto-tenue"
      >
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-borde border-t-marca-600"
        />
        Cargando lotes…
      </div>
    );
  }

  if (estado === "error" || !datos) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-lg border border-critico-borde bg-critico-fondo px-4 py-12 text-center"
      >
        <p className="text-sm text-critico-texto">
          No se pudieron cargar los lotes de este medicamento.
        </p>
        <Boton onClick={() => void cargar()}>Reintentar</Boton>
      </div>
    );
  }

  const { medicamento, lotes } = datos;
  const total = lotes.reduce((a, l) => a + l.disponible, 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-texto">
            {medicamento.nombre}
          </h1>
          <p className="mt-1 text-sm text-texto-tenue">
            {NOMBRE_DE_UNIDAD[medicamento.unidad]} · mínimo{" "}
            {medicamento.stockMinimo} · {total} en total entre todos los lotes
          </p>
        </div>

        {/* El ingreso lo conecta la tarea 4.13 y la dispensacion la 4.14. */}
        <div className="flex gap-3">
          <Boton>Registrar ingreso</Boton>
          <Boton variante="primario">Dispensar</Boton>
        </div>
      </header>

      <Tabla
        columnas={COLUMNAS}
        filas={lotes}
        claveDeFila={(l) => l.id}
        descripcion={`Lotes de ${medicamento.nombre}`}
        mensajeVacio="Este medicamento todavía no tiene lotes cargados"
      />
    </div>
  );
}
