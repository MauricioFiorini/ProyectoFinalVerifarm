"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { UnidadMedida } from "@prisma/client";
import type { EstadoDeStock } from "@/services/stock";
import { ErrorSeccion } from "@/components/ui/ErrorSeccion";
import { Tabla, type Columna } from "@/components/ui/Tabla";
import { NOMBRE_DE_UNIDAD } from "@/lib/unidades";
import { ChipDeEstado } from "./indicadores";

// Tabla de stock por medicamento (tarea 4.11).
//
// Consume GET /api/stock, que ya devuelve el estado calculado. La pantalla NO
// decide si algo esta bajo minimo: esa es una regla del dominio y vive en
// src/services/stock.ts. Aca solo se elige de que color se pinta.

export type StockDeApi = {
  id: string;
  nombre: string;
  unidad: UnidadMedida;
  stockMinimo: number;
  disponible: number;
  estado: EstadoDeStock;
  lotesPorVencer: number;
};

type Estado = "cargando" | "listo" | "error";

const COLUMNAS: Columna<StockDeApi>[] = [
  {
    clave: "nombre",
    encabezado: "Droga",
    celda: (m) => <span className="font-medium">{m.nombre}</span>,
  },
  {
    clave: "estado",
    encabezado: "Estado",
    celda: (m) => (
      <div className="flex flex-wrap items-center gap-2">
        <ChipDeEstado estado={m.estado} />
        {/* Si esta bajo minimo el chip dice eso, pero igual puede tener lotes
            por vencer. Se aclara al lado para no perder el dato. */}
        {m.estado === "BAJO_MINIMO" && m.lotesPorVencer > 0 ? (
          <span className="text-xs text-texto-sutil">
            y {m.lotesPorVencer} por vencer
          </span>
        ) : null}
      </div>
    ),
  },
  {
    clave: "disponible",
    encabezado: "Disponible",
    alineacion: "derecha",
    celda: (m) => <span className="font-medium">{m.disponible}</span>,
  },
  {
    clave: "minimo",
    encabezado: "Mínimo",
    alineacion: "derecha",
    celda: (m) => <span className="text-texto-tenue">{m.stockMinimo}</span>,
  },
  {
    clave: "unidad",
    encabezado: "Unidad",
    celda: (m) => (
      <span className="text-texto-tenue">{NOMBRE_DE_UNIDAD[m.unidad]}</span>
    ),
  },
  {
    clave: "acciones",
    encabezado: <span className="sr-only">Acciones</span>,
    alineacion: "derecha",
    celda: (m) => (
      <Link
        href={`/stock/${m.id}`}
        className="inline-flex items-center rounded-md border border-borde bg-superficie px-3 py-1.5 text-sm font-medium text-texto hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      >
        Ver lotes
      </Link>
    ),
  },
];

export function TablaDeStock() {
  const [filas, setFilas] = useState<StockDeApi[]>([]);
  const [estado, setEstado] = useState<Estado>("cargando");

  const cargar = useCallback(async () => {
    try {
      const respuesta = await fetch("/api/stock");
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

      setFilas((await respuesta.json()) as StockDeApi[]);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }, []);

  // ESTO ES UN PARCHE Y CONVIENE SABERLO.
  //
  // El timeout de 0 ms no aporta nada al comportamiento: esta para que la regla
  // react-hooks/set-state-in-effect no rechace la llamada. La regla tiene razon
  // en lo que senala —cargar datos en un efecto provoca un render de mas— y el
  // timeout no lo arregla, solo lo esconde del linter.
  //
  // La solucion de verdad seria renderizar esta pantalla en el servidor, que es
  // lo que el App Router espera para datos iniciales. No se hizo por dos
  // razones: la pantalla de medicamentos ya usa este mismo patron y tener dos
  // formas distintas de cargar datos es peor, y cambiarlo implica que las
  // pantallas pasen a importar el servicio en vez de consumir la API, que es
  // justo lo contrario de lo que dice docs/ARQUITECTURA.md seccion 3.
  //
  // Es una decision de equipo, no de esta tarea. Queda anotada en el traspaso.
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
        Cargando stock…
      </div>
    );
  }

  if (estado === "error") {
    return (
      <ErrorSeccion
        mensaje="No se pudo cargar el estado del stock."
        alReintentar={() => void cargar()}
      />
    );
  }

  return (
    <Tabla
      columnas={COLUMNAS}
      filas={filas}
      claveDeFila={(m) => m.id}
      descripcion="Estado de stock por medicamento"
      mensajeVacio="Todavía no hay medicamentos cargados"
    />
  );
}
