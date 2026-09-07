"use client";

import { useCallback, useEffect, useState } from "react";
import type { UnidadMedida } from "@prisma/client";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Tabla, type Columna } from "@/components/ui/Tabla";
import { NOMBRE_DE_UNIDAD } from "./unidades";
import { ModalNuevoMedicamento } from "./ModalNuevoMedicamento";

// Listado de medicamentos (tareas 3.06 y 3.08).
//
// Es un componente de cliente porque tiene buscador y modal de alta. Consume la
// API en /api/medicamentos, no importa el servicio: la pantalla no habla con la
// base. Ver docs/ARQUITECTURA.md seccion 3.
//
// LOS TRES ESTADOS VIVEN ACA, NO EN <Tabla>
//
// "Cargando", "vacio" y "error" son estados de la PANTALLA, no de la tabla: la
// tabla no sabe que existe una peticion HTTP y no tiene por que enterarse. Aca
// se decide que se dibuja en cada caso.

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

type Estado = "cargando" | "listo" | "error";

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
  const [estado, setEstado] = useState<Estado>("cargando");
  const [buscar, setBuscar] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  // Se guarda el texto con el que se trajo lo que hay en pantalla, para poder
  // distinguir "no hay nada cargado" de "no hay resultados para esta busqueda".
  const [textoBuscado, setTextoBuscado] = useState("");

  const cargar = useCallback(async (texto: string) => {
    const limpio = texto.trim();
    const url = limpio
      ? `/api/medicamentos?buscar=${encodeURIComponent(limpio)}`
      : "/api/medicamentos";

    try {
      const respuesta = await fetch(url);
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

      setMedicamentos((await respuesta.json()) as MedicamentoDeApi[]);
      setTextoBuscado(limpio);
      setEstado("listo");
    } catch {
      // No se distingue "el servidor contesto mal" de "no hay red": para quien
      // esta del otro lado las dos cosas se arreglan igual, reintentando.
      setEstado("error");
    }
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

        <Boton variante="primario" onClick={() => setModalAbierto(true)}>
          Nuevo medicamento
        </Boton>
      </div>

      {estado === "cargando" ? (
        <EstadoCargando />
      ) : estado === "error" ? (
        <EstadoError alReintentar={() => void cargar(buscar)} />
      ) : (
        <Tabla
          columnas={COLUMNAS}
          filas={medicamentos}
          claveDeFila={(m) => m.id}
          descripcion="Catálogo de medicamentos"
          mensajeVacio={
            textoBuscado
              ? `No se encontraron medicamentos que coincidan con «${textoBuscado}».`
              : "Todavía no hay medicamentos cargados"
          }
        />
      )}

      {modalAbierto ? (
        <ModalNuevoMedicamento
          alCerrar={() => setModalAbierto(false)}
          // Se recarga con el texto que haya en el buscador, para no perder
          // el filtro que la persona tenia puesto.
          alCrear={() => void cargar(buscar)}
        />
      ) : null}
    </div>
  );
}

function EstadoCargando() {
  return (
    <div
      className="flex items-center justify-center gap-3 rounded-lg border border-borde bg-superficie px-4 py-12 text-sm text-texto-tenue"
      // `polite` y no `assertive`: es una espera, no una alarma. Un lector de
      // pantalla lo anuncia cuando termina lo que estaba diciendo.
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-borde border-t-marca-600"
      />
      Cargando medicamentos…
    </div>
  );
}

function EstadoError({ alReintentar }: { alReintentar: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-lg border border-critico-borde bg-critico-fondo px-4 py-12 text-center"
    >
      <p className="text-sm text-critico-texto">
        No se pudo cargar el listado de medicamentos.
      </p>
      <Boton onClick={alReintentar}>Reintentar</Boton>
    </div>
  );
}
