"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AvisoClinico } from "@/components/ui/AvisoClinico";
import { Chip } from "@/components/ui/Chip";
import { ErrorSeccion } from "@/components/ui/ErrorSeccion";
import { Tabla, type Columna } from "@/components/ui/Tabla";
import { formatearFechaHora } from "@/lib/fechas";

// Listado de consultas (tarea 5.20).
//
// SIN FILTROS, Y ES A PROPOSITO
//
// La tarea lo pide asi. En el prototipo el volumen es chico, y un filtro que
// nadie uso todavia es una decision tomada sin datos: primero conviene ver como
// se usa la pantalla.
//
// LAS DOS CUENTAS NO SON ADORNO
//
// "4 medicamentos · sin interacciones" y una fila vacia se ven parecido si solo
// se muestra el resultado. Con la cantidad de evaluados a la vista, una consulta
// sin hallazgos se lee como lo que es —se revisaron cuatro drogas y no salio
// nada— y no como una fila rota.
//
// Es la misma idea que atraviesa el modulo: que no se pueda confundir "no hay
// nada" con "no se sabe".

type ConsultaDeApi = {
  id: string;
  fecha: string;
  seudonimo: string | null;
  cantidadDeMedicamentos: number;
  cantidadDeObservaciones: number;
};

type Estado = "cargando" | "listo" | "error";

const COLUMNAS: Columna<ConsultaDeApi>[] = [
  {
    clave: "fecha",
    encabezado: "Fecha",
    celda: (c) => (
      <span className="text-texto-tenue">{formatearFechaHora(c.fecha)}</span>
    ),
  },
  {
    clave: "paciente",
    encabezado: "Paciente",
    celda: (c) =>
      c.seudonimo ? (
        <span className="font-mono font-medium">{c.seudonimo}</span>
      ) : (
        // No se deja la celda vacia: una consulta sin paciente no es un dato
        // que falte, es el caso del medico de guardia evaluando un esquema
        // suelto. El esquema lo contempla desde la 2.02.
        <span className="text-sm text-texto-sutil italic">Consulta suelta</span>
      ),
  },
  {
    clave: "medicamentos",
    encabezado: "Evaluados",
    alineacion: "derecha",
    celda: (c) => c.cantidadDeMedicamentos,
  },
  {
    clave: "resultado",
    encabezado: "Resultado",
    celda: (c) =>
      c.cantidadDeObservaciones === 0 ? (
        <span className="text-sm text-texto-tenue">Sin interacciones</span>
      ) : (
        <Chip tono="critico">
          {c.cantidadDeObservaciones === 1
            ? "1 interacción"
            : `${c.cantidadDeObservaciones} interacciones`}
        </Chip>
      ),
  },
  {
    clave: "ver",
    encabezado: "",
    alineacion: "derecha",
    // Un enlace y no un boton: lleva a otra pagina. Mismo criterio que
    // "Ver ficha" y "Ver lotes".
    celda: (c) => (
      <Link
        href={`/consultas/${c.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-borde bg-superficie px-4 py-2 text-sm font-medium text-texto transition-colors hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
      >
        Ver
      </Link>
    ),
  },
];

export function ListaConsultas() {
  const [consultas, setConsultas] = useState<ConsultaDeApi[]>([]);
  const [estado, setEstado] = useState<Estado>("cargando");

  const cargar = useCallback(async () => {
    try {
      const r = await fetch("/api/consultas");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setConsultas((await r.json()) as ConsultaDeApi[]);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }, []);

  // Ver la nota de TablaDeStock.tsx sobre por que va dentro de un callback.
  useEffect(() => {
    const t = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(t);
  }, [cargar]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Link
          href="/consultas/nueva"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-marca-600 bg-marca-600 px-4 py-2 text-sm font-medium text-superficie transition-colors hover:border-marca-700 hover:bg-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        >
          Nueva consulta
        </Link>
      </div>

      {estado === "cargando" ? (
        <div
          className="flex items-center justify-center gap-3 rounded-lg border border-borde bg-superficie px-4 py-12 text-sm text-texto-tenue"
          role="status"
          aria-live="polite"
        >
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-borde border-t-marca-600"
          />
          Cargando consultas…
        </div>
      ) : estado === "error" ? (
        <ErrorSeccion
          mensaje="No se pudo cargar el listado de consultas."
          alReintentar={() => void cargar()}
        />
      ) : (
        <Tabla
          columnas={COLUMNAS}
          filas={consultas}
          claveDeFila={(c) => c.id}
          descripcion="Consultas de interacciones"
          mensajeVacio="Todavía no se hizo ninguna consulta"
        />
      )}

      <AvisoClinico />
    </div>
  );
}
