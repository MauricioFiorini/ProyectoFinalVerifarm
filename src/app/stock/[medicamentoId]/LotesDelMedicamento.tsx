"use client";

import { useCallback, useEffect, useState } from "react";
import type { UnidadMedida } from "@prisma/client";
import type { EstadoDeVencimiento } from "@/services/stock";
import { Boton } from "@/components/ui/Boton";
import { ErrorSeccion } from "@/components/ui/ErrorSeccion";
import { Tabla, type Columna } from "@/components/ui/Tabla";
import { NOMBRE_DE_UNIDAD } from "@/lib/unidades";
import { formatearFecha } from "@/lib/fechas";
import { ChipDeVencimiento } from "../indicadores";
import { ModalIngreso } from "./ModalIngreso";
import { ModalDispensar } from "./ModalDispensar";
import { ModalHistorial } from "./ModalHistorial";

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
  estadoVencimiento: EstadoDeVencimiento;
  diasParaVencer: number;
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

/**
 * Las columnas se arman con una funcion porque la ultima necesita un callback
 * del componente. Definirlas como constante obligaria a meter el estado del
 * modal en un contexto o a duplicar la tabla.
 */
const columnas = (
  verMovimientos: (lote: LoteDeApi) => void,
): Columna<LoteDeApi>[] => [
  {
    clave: "numero",
    encabezado: "Lote",
    celda: (l) => <span className="font-mono font-medium">{l.numeroLote}</span>,
  },
  {
    clave: "ingreso",
    encabezado: "Ingreso",
    celda: (l) => (
      <span className="text-texto-tenue">{formatearFecha(l.fechaIngreso)}</span>
    ),
  },
  {
    clave: "vencimiento",
    encabezado: "Vencimiento",
    celda: (l) => (
      <div className="flex flex-wrap items-center gap-2">
        <span>{formatearFecha(l.fechaVencimiento)}</span>
        <ChipDeVencimiento
          estado={l.estadoVencimiento}
          diasParaVencer={l.diasParaVencer}
        />
      </div>
    ),
  },
  {
    clave: "disponible",
    encabezado: "Disponible",
    alineacion: "derecha",
    celda: (l) => <span className="font-medium">{l.disponible}</span>,
  },
  {
    clave: "acciones",
    encabezado: <span className="sr-only">Acciones</span>,
    alineacion: "derecha",
    // Solo consultar. No hay editar ni borrar: el historial es un libro mayor.
    celda: (l) => (
      <button
        type="button"
        onClick={() => verMovimientos(l)}
        className="rounded-md border border-borde bg-superficie px-3 py-1.5 text-sm font-medium text-texto hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      >
        Movimientos
      </button>
    ),
  },
];

export function LotesDelMedicamento({
  medicamentoId,
}: {
  medicamentoId: string;
}) {
  const [datos, setDatos] = useState<Respuesta | null>(null);
  const [estado, setEstado] = useState<Estado>("cargando");
  const [modal, setModal] = useState<"ingreso" | "dispensar" | null>(null);
  const [loteDelHistorial, setLoteDelHistorial] = useState<LoteDeApi | null>(
    null,
  );

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
      <ErrorSeccion
        mensaje="No se pudieron cargar los lotes de este medicamento."
        alReintentar={() => void cargar()}
      />
    );
  }

  const { medicamento, lotes } = datos;

  // El total NO suma los lotes vencidos. Sumarlos daria un numero mayor que el
  // de la pantalla de stock, que si los excluye, y el mismo dato con dos
  // valores distintos es peor que no mostrarlo. Lo vencido se informa aparte,
  // porque hay que darlo de baja.
  const disponible = lotes
    .filter((l) => l.estadoVencimiento !== "VENCIDO")
    .reduce((a, l) => a + l.disponible, 0);

  const enVencidos = lotes
    .filter((l) => l.estadoVencimiento === "VENCIDO")
    .reduce((a, l) => a + l.disponible, 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-texto">
            {medicamento.nombre}
          </h1>
          <p className="mt-1 text-sm text-texto-tenue">
            {NOMBRE_DE_UNIDAD[medicamento.unidad]} · mínimo{" "}
            {medicamento.stockMinimo} · {disponible} disponibles en lotes
            vigentes
            {enVencidos > 0 ? (
              <span className="text-critico-texto">
                {" "}
                · {enVencidos} en lotes vencidos
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Boton onClick={() => setModal("ingreso")}>Registrar ingreso</Boton>
          <Boton
            variante="primario"
            onClick={() => setModal("dispensar")}
            // Sin nada disponible no hay nada que dispensar, y abrir el modal
            // solo para que diga que no alcanza es hacerle perder un clic.
            disabled={disponible === 0}
          >
            Dispensar
          </Boton>
        </div>
      </header>

      <Tabla
        columnas={columnas(setLoteDelHistorial)}
        filas={lotes}
        claveDeFila={(l) => l.id}
        descripcion={`Lotes de ${medicamento.nombre}`}
        mensajeVacio="Este medicamento todavía no tiene lotes cargados"
      />

      {modal === "ingreso" ? (
        <ModalIngreso
          medicamentoId={medicamento.id}
          nombreMedicamento={medicamento.nombre}
          alCerrar={() => setModal(null)}
          alRegistrar={() => void cargar()}
        />
      ) : null}

      {modal === "dispensar" ? (
        <ModalDispensar
          medicamentoId={medicamento.id}
          nombreMedicamento={medicamento.nombre}
          alCerrar={() => setModal(null)}
          alDispensar={() => void cargar()}
        />
      ) : null}

      {loteDelHistorial ? (
        <ModalHistorial
          loteId={loteDelHistorial.id}
          numeroLote={loteDelHistorial.numeroLote}
          alCerrar={() => setLoteDelHistorial(null)}
        />
      ) : null}
    </div>
  );
}
