"use client";

import { useCallback, useEffect, useState } from "react";
import type { UnidadMedida } from "@prisma/client";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Tabla, type Columna } from "@/components/ui/Tabla";
import { NOMBRE_DE_UNIDAD } from "./unidades";

// Listado de medicamentos (tarea 3.06).
//
// Es un componente de cliente porque tiene buscador y va a tener el modal de
// alta (3.07). Consume la API en /api/medicamentos, no importa el servicio: la
// pantalla no habla con la base. Ver docs/ARQUITECTURA.md seccion 3.

/**
 * Medicamento tal como llega del endpoint. NO es el tipo de Prisma: al pasar por
 * JSON las fechas vienen como texto, y de esta pantalla no se usan.
 */
export type MedicamentoDeApi = {
  id: string;
  nombre: string;
  rxcui: string | null;
  unidad: UnidadMedida;
  stockMinimo: number;
};

const COLUMNAS: Columna<MedicamentoDeApi>[] = [
  {
    clave: "nombre",
    encabezado: "Droga",
    celda: (m) => <span className="font-medium">{m.nombre}</span>,
  },
  {
    clave: "rxcui",
    encabezado: "RxCUI",
    celda: (m) =>
      m.rxcui ? (
        <span className="font-mono">{m.rxcui}</span>
      ) : (
        // Se dice que falta, no se deja la celda vacia. Un medicamento sin
        // rxcui no participa del cruce de interacciones, y eso el usuario lo
        // tiene que poder ver. Ver docs/decisiones/0005.
        <span className="text-texto-sutil italic">sin cargar</span>
      ),
  },
  {
    clave: "unidad",
    encabezado: "Unidad",
    celda: (m) => NOMBRE_DE_UNIDAD[m.unidad],
  },
  {
    clave: "stockMinimo",
    encabezado: "Stock mínimo",
    alineacion: "derecha",
    celda: (m) => m.stockMinimo,
  },
];

export function ListaMedicamentos() {
  const [medicamentos, setMedicamentos] = useState<MedicamentoDeApi[]>([]);
  const [buscar, setBuscar] = useState("");

  const cargar = useCallback(async (texto: string) => {
    const url = texto.trim()
      ? `/api/medicamentos?buscar=${encodeURIComponent(texto.trim())}`
      : "/api/medicamentos";

    const respuesta = await fetch(url);
    if (!respuesta.ok) return;

    setMedicamentos((await respuesta.json()) as MedicamentoDeApi[]);
  }, []);

  // Se espera a que la persona deje de tipear antes de pedir. Sin esto, escribir
  // "clonazepam" dispara diez consultas y las respuestas pueden llegar
  // desordenadas, dejando en pantalla el resultado de un texto viejo.
  useEffect(() => {
    const t = setTimeout(() => void cargar(buscar), 250);
    return () => clearTimeout(t);
  }, [buscar, cargar]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-sm">
          <Campo
            etiqueta="Buscar"
            type="search"
            placeholder="Nombre de la droga…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>

        {/* El alta la conecta la tarea 3.07, que trae el modal. */}
        <Boton variante="primario">Nuevo medicamento</Boton>
      </div>

      <Tabla
        columnas={COLUMNAS}
        filas={medicamentos}
        claveDeFila={(m) => m.id}
        descripcion="Catálogo de medicamentos"
      />
    </div>
  );
}
