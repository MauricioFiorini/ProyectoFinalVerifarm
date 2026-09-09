"use client";

import { useCallback, useEffect, useState } from "react";
import type { Severidad } from "@prisma/client";
import { AvisoClinico } from "@/components/ui/AvisoClinico";
import { Chip } from "@/components/ui/Chip";
import { ErrorSeccion } from "@/components/ui/ErrorSeccion";
import { formatearFechaHora } from "@/lib/fechas";
import type { Evaluabilidad } from "@/services/interacciones";

// Pantalla de resultado de una consulta (tarea 5.18).
//
// LA REGLA QUE ORGANIZA TODA ESTA PANTALLA
//
// **"Sin interacciones" y "sin datos" no se pueden ver igual.** Son dos cosas
// distintas y confundirlas es el peor error que este sistema puede cometer:
//
//   - "No se encontraron interacciones" significa que se cruzaron las drogas
//     contra la fuente y no habia ningun par cargado.
//   - "Sin datos en la fuente" significa que esa droga NUNCA ENTRO al cruce.
//     No se reviso. No se sabe.
//
// Por eso el bloque de drogas sin cobertura **aparece siempre que haya alguna**,
// no solo cuando el resultado viene vacio. Un resultado con tres interacciones y
// una droga sin datos tampoco esta completo, y eso hay que decirlo igual.
//
// Decision 0012.
//
// SOBRE EL COLOR POR SEVERIDAD
//
// Esta escrito para las tres, pero hoy todas las filas de la fuente entran como
// ALTA: ONCHigh no publica una escala y graduarla seria inventarla (decision
// 0011). O sea que en la practica se va a ver un solo color. **No es un defecto
// de esta pantalla**, es una limitacion declarada de la fuente.

type MedicamentoDeLaConsulta = {
  id: string;
  nombre: string;
  rxcui: string | null;
  evaluabilidad: Evaluabilidad;
};

type ObservacionDeLaConsulta = {
  id: string;
  medicamento1: { id: string; nombre: string };
  medicamento2: { id: string; nombre: string };
  severidad: Severidad;
  descripcion: string;
};

type ConsultaDeApi = {
  consultaId: string;
  fecha: string;
  pacienteId: string | null;
  seudonimo: string | null;
  medicamentos: MedicamentoDeLaConsulta[];
  observaciones: ObservacionDeLaConsulta[];
};

type Estado = "cargando" | "listo" | "noEncontrada" | "error";

const SEVERIDAD: Record<
  Severidad,
  { tono: "critico" | "advertencia" | "neutro"; texto: string; borde: string }
> = {
  ALTA: {
    tono: "critico",
    texto: "Severidad alta",
    borde: "border-l-critico-texto",
  },
  MEDIA: {
    tono: "advertencia",
    texto: "Severidad media",
    borde: "border-l-advertencia-texto",
  },
  // Neutro y no "ok": una interaccion de severidad baja sigue siendo una
  // interaccion. Verde diria "esto esta bien", que no es lo que dice.
  BAJA: { tono: "neutro", texto: "Severidad baja", borde: "border-l-borde" },
};

const SIN_COBERTURA: Record<Evaluabilidad, string | null> = {
  EVALUADO: null,
  SIN_COBERTURA: "la fuente no tiene datos de esta droga",
  SIN_RXCUI: "no tiene RxCUI cargado, no hay por dónde cruzarla",
};

export function ResultadoDeConsulta({ consultaId }: { consultaId: string }) {
  const [consulta, setConsulta] = useState<ConsultaDeApi | null>(null);
  const [estado, setEstado] = useState<Estado>("cargando");

  const cargar = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/consultas?id=${encodeURIComponent(consultaId)}`,
      );

      if (r.status === 404) {
        setEstado("noEncontrada");
        return;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);

      setConsulta((await r.json()) as ConsultaDeApi);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }, [consultaId]);

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
        Cargando el resultado…
      </div>
    );
  }

  if (estado === "noEncontrada") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-borde bg-superficie px-4 py-12 text-center"
      >
        <p className="text-sm text-texto">Esa consulta no existe.</p>
        <p className="mt-1 text-sm text-texto-tenue">
          El enlace puede estar mal.
        </p>
      </div>
    );
  }

  if (estado === "error" || !consulta) {
    return (
      <ErrorSeccion
        mensaje="No se pudo cargar el resultado de la consulta."
        alReintentar={() => void cargar()}
      />
    );
  }

  const sinCobertura = consulta.medicamentos.filter(
    (m) => m.evaluabilidad !== "EVALUADO",
  );
  const evaluados = consulta.medicamentos.filter(
    (m) => m.evaluabilidad === "EVALUADO",
  );

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold text-texto">
          Resultado de la consulta
        </h1>
        <p className="mt-1 text-sm text-texto-tenue">
          {formatearFechaHora(consulta.fecha)} · {consulta.medicamentos.length}{" "}
          medicamentos evaluados
          {/* De quien era la consulta. Se agrego con el listado (5.20): desde
              ahi se entra a una consulta, y sin esto la pantalla no decia a que
              paciente correspondia. */}
          {consulta.seudonimo ? (
            <>
              {" · "}
              <span className="font-mono">{consulta.seudonimo}</span>
            </>
          ) : (
            " · consulta suelta"
          )}
        </p>
      </header>

      {/* --- Las observaciones, o el estado vacio ------------------------- */}
      {consulta.observaciones.length === 0 ? (
        <div className="rounded-lg border border-borde bg-superficie px-6 py-8 text-center">
          <p className="text-sm font-medium text-texto">
            No se encontraron interacciones registradas entre los medicamentos
            evaluados
          </p>
          {evaluados.length < 2 ? (
            // Con menos de dos drogas cruzables no hubo ningun par que mirar, y
            // decir solamente "no se encontraron interacciones" seria enganoso.
            <p className="mt-2 text-sm text-texto-tenue">
              {evaluados.length === 0
                ? "Ninguno de los medicamentos evaluados se pudo cruzar contra la fuente."
                : "Solo uno de los medicamentos evaluados se pudo cruzar contra la fuente, así que no hubo ningún par que revisar."}
            </p>
          ) : null}
        </div>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-texto">
            {consulta.observaciones.length === 1
              ? "1 interacción encontrada"
              : `${consulta.observaciones.length} interacciones encontradas`}
          </h2>

          <ul className="flex flex-col gap-3">
            {consulta.observaciones.map((o) => {
              const s = SEVERIDAD[o.severidad];
              return (
                <li
                  key={o.id}
                  className={`rounded-lg border border-borde border-l-4 bg-superficie px-5 py-4 ${s.borde}`}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-medium text-texto">
                      {o.medicamento1.nombre} + {o.medicamento2.nombre}
                    </span>
                    <Chip tono={s.tono}>{s.texto}</Chip>
                  </div>

                  {/* El texto viene compuesto y GUARDADO desde la 5.09: es lo
                      que se leyo el dia de la consulta, no lo que el sistema
                      diria hoy. Las lineas se separan como vinieron. */}
                  {o.descripcion.split("\n").map((linea, i) => (
                    <p
                      key={i}
                      className={
                        i === 0
                          ? "text-sm text-texto"
                          : "mt-1 text-sm text-texto-tenue"
                      }
                    >
                      {linea}
                    </p>
                  ))}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* --- Lo que NO se pudo revisar -----------------------------------
          Aparece SIEMPRE que haya alguna, tambien cuando si hubo
          interacciones: un resultado con tres hallazgos y una droga sin datos
          tampoco esta completo. */}
      {sinCobertura.length > 0 ? (
        <section
          className="rounded-lg border border-advertencia-borde bg-advertencia-fondo px-5 py-4"
          // `alert` y no una seccion cualquiera: es lo que le falta al
          // resultado, y quien use un lector de pantalla tiene que enterarse
          // sin ir a buscarlo.
          role="alert"
        >
          <h2 className="text-sm font-medium text-advertencia-texto">
            Sin datos en la fuente: no se pudo revisar esta droga
          </h2>

          <ul className="mt-2 flex flex-col gap-1.5">
            {sinCobertura.map((m) => (
              <li key={m.id} className="text-sm text-texto">
                <span className="font-medium">{m.nombre}</span>
                <span className="text-texto-tenue">
                  {" "}
                  — {SIN_COBERTURA[m.evaluabilidad]}
                </span>
              </li>
            ))}
          </ul>

          {/* La frase concuerda en numero de punta a punta. Con una sola droga
              decia "esta droga: no que esten bien... no se revisaron", que se
              lee como escrito a las apuradas justo donde mas importa que se
              entienda. */}
          <p className="mt-3 text-xs text-texto-tenue">
            {sinCobertura.length === 1
              ? "El resultado de arriba no dice nada sobre esta droga: no que esté bien, sino que no se revisó."
              : "El resultado de arriba no dice nada sobre estas drogas: no que estén bien, sino que no se revisaron."}
          </p>
        </section>
      ) : null}

      {/* --- Qué se evaluó ------------------------------------------------ */}
      <section className="rounded-lg border border-borde bg-superficie px-5 py-4">
        <h2 className="text-sm font-medium text-texto">
          Medicamentos evaluados
        </h2>
        <p className="mt-2 text-sm text-texto-tenue">
          {consulta.medicamentos.map((m) => m.nombre).join(" · ")}
        </p>
      </section>

      <AvisoClinico />
    </div>
  );
}
