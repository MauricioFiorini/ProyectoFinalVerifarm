"use client";

import { useCallback, useEffect, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Chip } from "@/components/ui/Chip";
import { Tabla, type Columna } from "@/components/ui/Tabla";
import { formatearFecha } from "@/lib/fechas";
import type { EstadoDeMedicacion } from "@/services/medicacion";
import type { Evaluabilidad } from "@/services/interacciones";

// Ficha del paciente (tarea 5.13).
//
// LA COLUMNA "INTERACCIONES" ES EL PUNTO DE ESTA PANTALLA
//
// Una lista de medicacion vigente, a secas, **parece revisada y no lo esta**. Si
// una de las drogas no figura en la fuente de interacciones, el paciente puede
// tener una interaccion que el sistema nunca va a ver, y nada en la pantalla lo
// diria.
//
// Por eso cada fila dice si esa droga se puede cruzar o no, y por que no:
//
//   - "Se evalua"              -> tiene RxCUI y la fuente la cubre.
//   - "Sin datos en la fuente" -> tiene RxCUI, pero ONCHigh no la trae. Le pasa
//                                 al clonazepam, que es de los psicofarmacos mas
//                                 usados en la institucion.
//   - "Sin RxCUI cargado"      -> no tiene codigo, no hay por donde cruzarla.
//
// Los tres casos vienen resueltos del servidor, en el campo `evaluabilidad`. La
// pantalla no los calcula. Ver la decision 0012.

type MedicacionDeApi = {
  id: string;
  fechaInicio: string;
  fechaFin: string | null;
  motivoSuspension: string | null;
  estado: EstadoDeMedicacion;
  evaluabilidad: Evaluabilidad;
  medicamento: { id: string; nombre: string; rxcui: string | null };
};

type PacienteDeApi = { id: string; seudonimo: string };

type Estado = "cargando" | "listo" | "noEncontrado" | "error";

const ESTADO: Record<
  EstadoDeMedicacion,
  { tono: "ok" | "advertencia" | "critico" | "neutro"; texto: string }
> = {
  VIGENTE: { tono: "ok", texto: "Vigente" },
  // Critico y no advertencia: que una droga se haya cortado por una razon es lo
  // que mas conviene que salte a la vista al leer una ficha.
  SUSPENDIDA: { tono: "critico", texto: "Suspendida" },
  FINALIZADA: { tono: "neutro", texto: "Finalizada" },
};

const EVALUABILIDAD: Record<
  Evaluabilidad,
  { tono: "ok" | "advertencia" | "critico" | "neutro"; texto: string } | null
> = {
  // El caso corriente no lleva chip: si todo lleva etiqueta, ninguna se lee.
  EVALUADO: null,
  SIN_COBERTURA: { tono: "advertencia", texto: "Sin datos en la fuente" },
  SIN_RXCUI: { tono: "advertencia", texto: "Sin RxCUI cargado" },
};

const COLUMNAS: Columna<MedicacionDeApi>[] = [
  {
    clave: "droga",
    encabezado: "Droga",
    celda: (m) => <span className="font-medium">{m.medicamento.nombre}</span>,
  },
  {
    clave: "fechaInicio",
    encabezado: "Desde",
    celda: (m) => (
      <span className="text-texto-tenue">{formatearFecha(m.fechaInicio)}</span>
    ),
  },
  {
    clave: "estado",
    encabezado: "Estado",
    celda: (m) => {
      const { tono, texto } = ESTADO[m.estado];
      return (
        <div className="flex flex-col items-start gap-1">
          <Chip tono={tono}>{texto}</Chip>
          {/* El motivo va junto al estado y no en una columna aparte: solo lo
              tienen las suspendidas, y una columna vacia en casi todas las filas
              es peor que un renglon de mas en las pocas que la usan. */}
          {m.motivoSuspension ? (
            <span className="text-xs text-texto-tenue">
              {m.motivoSuspension}
              {m.fechaFin ? ` · ${formatearFecha(m.fechaFin)}` : null}
            </span>
          ) : null}
        </div>
      );
    },
  },
  {
    clave: "evaluabilidad",
    encabezado: "Interacciones",
    celda: (m) => {
      const marca = EVALUABILIDAD[m.evaluabilidad];
      return marca ? (
        <Chip tono={marca.tono}>{marca.texto}</Chip>
      ) : (
        <span className="text-xs text-texto-sutil">Se evalúa</span>
      );
    },
  },
];

export function MedicacionDelPaciente({ pacienteId }: { pacienteId: string }) {
  const [paciente, setPaciente] = useState<PacienteDeApi | null>(null);
  const [medicacion, setMedicacion] = useState<MedicacionDeApi[]>([]);
  const [estado, setEstado] = useState<Estado>("cargando");

  const cargar = useCallback(async () => {
    try {
      // `incluirNoVigentes=true`: la ficha muestra tambien lo suspendido y lo
      // finalizado, con su motivo. Es informacion clinica, no basura para
      // esconder. El resto del sistema usa el defecto, que trae solo lo vigente.
      const respuesta = await fetch(
        `/api/medicacion?pacienteId=${encodeURIComponent(pacienteId)}&incluirNoVigentes=true`,
      );

      if (respuesta.status === 404) {
        setEstado("noEncontrado");
        return;
      }
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

      const cuerpo = (await respuesta.json()) as {
        paciente: PacienteDeApi;
        medicacion: MedicacionDeApi[];
      };

      setPaciente(cuerpo.paciente);
      setMedicacion(cuerpo.medicacion);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }, [pacienteId]);

  // Ver la nota de TablaDeStock.tsx sobre por que va dentro de un callback.
  useEffect(() => {
    const t = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(t);
  }, [cargar]);

  if (estado === "cargando") {
    return (
      <div
        className="flex items-center justify-center gap-3 rounded-lg border border-borde bg-superficie px-4 py-12 text-sm text-texto-tenue"
        role="status"
        aria-live="polite"
      >
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-borde border-t-marca-600"
        />
        Cargando la ficha…
      </div>
    );
  }

  if (estado === "noEncontrado") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-borde bg-superficie px-4 py-12 text-center"
      >
        <p className="text-sm text-texto">Ese paciente no existe.</p>
        <p className="mt-1 text-sm text-texto-tenue">
          Puede haber sido dado de baja, o el enlace estar mal.
        </p>
      </div>
    );
  }

  if (estado === "error") {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-lg border border-critico-borde bg-critico-fondo px-4 py-12 text-center"
      >
        <p className="text-sm text-critico-texto">
          No se pudo cargar la ficha del paciente.
        </p>
        <Boton onClick={() => void cargar()}>Reintentar</Boton>
      </div>
    );
  }

  const vigentes = medicacion.filter((m) => m.estado === "VIGENTE").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-semibold text-texto">
            {paciente?.seudonimo}
          </h1>
          <p className="mt-1 text-sm text-texto-tenue">
            {vigentes === 0
              ? "Sin medicación vigente"
              : `${vigentes} ${vigentes === 1 ? "droga vigente" : "drogas vigentes"}`}
            {medicacion.length > vigentes
              ? ` · ${medicacion.length - vigentes} en el historial`
              : null}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Las dos son tareas que todavia no existen: el modal de alta es la
              5.14 y la pantalla de consulta la 5.16. Van deshabilitados en vez
              de no estar, para que la ficha ya muestre que se puede hacer desde
              aca y un clic no se quede sin respuesta. Mismo criterio que el
              boton "Nuevo paciente" en la 5.11. */}
          <Boton disabled title="Todavía no implementado (tarea 5.14)">
            Agregar medicamento
          </Boton>
          <Boton
            variante="primario"
            disabled
            title="Todavía no implementado (tarea 5.16)"
          >
            Evaluar interacciones
          </Boton>
        </div>
      </header>

      <Tabla
        columnas={COLUMNAS}
        filas={medicacion}
        claveDeFila={(m) => m.id}
        descripcion={`Medicación de ${paciente?.seudonimo ?? "el paciente"}`}
        mensajeVacio="Este paciente todavía no tiene medicación cargada"
      />

      <p className="text-xs text-texto-sutil">
        La evaluación de interacciones se hace solo sobre la medicación vigente.
        El sistema informa; no reemplaza el criterio profesional.
      </p>
    </div>
  );
}
