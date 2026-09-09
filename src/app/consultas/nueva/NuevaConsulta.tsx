"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Chip } from "@/components/ui/Chip";
import type { Evaluabilidad } from "@/services/interacciones";

// Pantalla de consulta de interacciones (tarea 5.16).
//
// LA MARCA DE COBERTURA VA ANTES DE EVALUAR, NO DESPUES
//
// Cada droga elegida dice, en la misma lista, si el sistema la va a poder
// cruzar. Si eso apareciera recien en el resultado, alguien podria leer "no se
// encontraron interacciones" creyendo que se reviso todo, cuando en realidad una
// de las drogas nunca entro al cruce.
//
// Los tres casos vienen resueltos del servidor, en `evaluabilidad`, pidiendo
// `?conCobertura=true`. La pantalla no los calcula. Decision 0012.
//
// POR QUE ESTE BUSCADOR NO ES EL MISMO COMPONENTE QUE EL DE LA 5.14
//
// Aquel elige UNA droga y la deja fija con un boton "Cambiar"; este agrega a una
// lista, excluye las ya elegidas y muestra la cobertura. Lo unico que comparten
// de verdad es el pedido con espera —unas quince lineas—, y un componente cuyas
// props tuvieran que cubrir los dos comportamientos seria mas dificil de leer
// que los dos por separado.
//
// La regla sigue en pie: algo sube a `src/components/ui/` cuando dos rutas
// necesitan LO MISMO. Estas necesitan cosas parecidas, que no es igual.

type MedicamentoDeApi = {
  id: string;
  nombre: string;
  rxcui: string | null;
  evaluabilidad: Evaluabilidad;
};

type PacienteDeApi = { id: string; seudonimo: string };

/** Los textos los fija el roadmap en la fila de la 5.16. */
const AVISO: Record<Evaluabilidad, { texto: string } | null> = {
  EVALUADO: null,
  SIN_COBERTURA: { texto: "la fuente no tiene datos de esta droga" },
  SIN_RXCUI: { texto: "no se puede evaluar: falta el código" },
};

const MINIMO = 2;
const MAXIMO_DE_RESULTADOS = 6;

export function NuevaConsulta() {
  const router = useRouter();

  const [paciente, setPaciente] = useState<PacienteDeApi | null>(null);
  const [buscarPaciente, setBuscarPaciente] = useState("");
  const [pacientes, setPacientes] = useState<PacienteDeApi[]>([]);

  const [elegidos, setElegidos] = useState<MedicamentoDeApi[]>([]);
  const [buscarMed, setBuscarMed] = useState("");
  const [resultados, setResultados] = useState<MedicamentoDeApi[]>([]);
  const [buscando, setBuscando] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [evaluando, setEvaluando] = useState(false);

  // --- Buscadores ----------------------------------------------------------

  const pedirPacientes = useCallback(async (texto: string) => {
    const limpio = texto.trim();
    if (limpio === "") {
      setPacientes([]);
      return;
    }
    try {
      const r = await fetch(
        `/api/pacientes?buscar=${encodeURIComponent(limpio)}`,
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setPacientes((await r.json()) as PacienteDeApi[]);
    } catch {
      setPacientes([]);
    }
  }, []);

  const pedirMedicamentos = useCallback(async (texto: string) => {
    const limpio = texto.trim();
    if (limpio === "") {
      setResultados([]);
      return;
    }
    setBuscando(true);
    try {
      // `conCobertura=true`: es lo que permite avisar antes de evaluar.
      const r = await fetch(
        `/api/medicamentos?buscar=${encodeURIComponent(limpio)}&conCobertura=true`,
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setResultados((await r.json()) as MedicamentoDeApi[]);
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  }, []);

  useEffect(() => {
    if (paciente) return;
    const t = setTimeout(() => void pedirPacientes(buscarPaciente), 250);
    return () => clearTimeout(t);
  }, [buscarPaciente, paciente, pedirPacientes]);

  useEffect(() => {
    const t = setTimeout(() => void pedirMedicamentos(buscarMed), 250);
    return () => clearTimeout(t);
  }, [buscarMed, pedirMedicamentos]);

  // --- Acciones ------------------------------------------------------------

  const yaElegido = (id: string) => elegidos.some((m) => m.id === id);

  function agregar(m: MedicamentoDeApi) {
    if (yaElegido(m.id)) return;
    setElegidos((previos) => [...previos, m]);
    setBuscarMed("");
    setResultados([]);
    setError(null);
  }

  function quitar(id: string) {
    setElegidos((previos) => previos.filter((m) => m.id !== id));
    setError(null);
  }

  async function evaluar() {
    setEvaluando(true);
    setError(null);

    try {
      const respuesta = await fetch("/api/consultas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicamentoIds: elegidos.map((m) => m.id),
          pacienteId: paciente?.id,
        }),
      });

      const cuerpo = await respuesta.json();

      if (respuesta.ok) {
        // El resultado es una pantalla aparte porque la consulta queda
        // guardada: se puede volver a abrir despues por su direccion.
        router.push(`/consultas/${cuerpo.consultaId as string}`);
        return;
      }

      setError((cuerpo.error as string) ?? "No se pudo evaluar.");
    } catch {
      setError(
        "No se pudo contactar al servidor. Revisá tu conexión y volvé a intentar.",
      );
    } finally {
      setEvaluando(false);
    }
  }

  const sinDatos = elegidos.filter((m) => m.evaluabilidad !== "EVALUADO");
  const puedeEvaluar = elegidos.length >= MINIMO && !evaluando;

  return (
    <div className="flex flex-col gap-8">
      {/* --- Paciente ------------------------------------------------------ */}
      <section>
        <h2 className="mb-1 text-sm font-medium text-texto">
          Paciente <span className="text-texto-tenue">(opcional)</span>
        </h2>
        <p className="mb-3 text-sm text-texto-tenue">
          Sin paciente, la consulta queda registrada igual. Es lo que necesita
          el médico de guardia para evaluar un esquema suelto.
        </p>

        {paciente ? (
          <div className="flex items-center justify-between gap-3 rounded-md border border-borde bg-superficie-tenue px-3 py-2">
            <span className="font-mono text-sm font-medium">
              {paciente.seudonimo}
            </span>
            <Boton
              onClick={() => {
                setPaciente(null);
                setBuscarPaciente("");
              }}
            >
              Quitar
            </Boton>
          </div>
        ) : (
          <div className="max-w-sm">
            <Campo
              etiqueta="Buscar paciente"
              type="search"
              placeholder="Seudónimo…"
              value={buscarPaciente}
              onChange={(e) => setBuscarPaciente(e.target.value)}
              autoComplete="off"
            />
            {buscarPaciente.trim() !== "" && pacientes.length > 0 ? (
              <ul className="mt-2 overflow-hidden rounded-md border border-borde">
                {pacientes.slice(0, MAXIMO_DE_RESULTADOS).map((p) => (
                  <li
                    key={p.id}
                    className="border-b border-borde last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => setPaciente(p)}
                      className="w-full px-3 py-2.5 text-left font-mono text-sm transition-colors hover:bg-superficie-tenue focus-visible:bg-superficie-tenue focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-marca-600"
                    >
                      {p.seudonimo}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </section>

      {/* --- Medicamentos -------------------------------------------------- */}
      <section>
        <h2 className="mb-1 text-sm font-medium text-texto">
          Medicamentos a evaluar
        </h2>
        <p className="mb-3 text-sm text-texto-tenue">
          Hacen falta al menos {MINIMO}: una interacción es entre dos drogas.
        </p>

        <div className="max-w-sm">
          <Campo
            etiqueta="Agregar medicamento"
            type="search"
            placeholder="Buscar por nombre de droga…"
            value={buscarMed}
            onChange={(e) => setBuscarMed(e.target.value)}
            autoComplete="off"
          />

          {buscarMed.trim() !== "" ? (
            <div className="mt-2 overflow-hidden rounded-md border border-borde">
              {buscando ? (
                <p
                  className="px-3 py-2.5 text-sm text-texto-tenue"
                  role="status"
                  aria-live="polite"
                >
                  Buscando…
                </p>
              ) : resultados.length === 0 ? (
                <p className="px-3 py-2.5 text-sm text-texto-tenue">
                  No hay medicamentos que coincidan con «{buscarMed.trim()}».
                </p>
              ) : (
                <ul className="max-h-56 overflow-y-auto">
                  {resultados.slice(0, MAXIMO_DE_RESULTADOS).map((m) => (
                    <li
                      key={m.id}
                      className="border-b border-borde last:border-b-0"
                    >
                      <button
                        type="button"
                        onClick={() => agregar(m)}
                        // Ya elegido: se muestra igual pero no se puede agregar
                        // dos veces. Ocultarlo haria pensar que no esta en el
                        // catalogo.
                        disabled={yaElegido(m.id)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-superficie-tenue focus-visible:bg-superficie-tenue focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-not-allowed disabled:bg-superficie-tenue disabled:text-texto-sutil"
                      >
                        <span className="font-medium">{m.nombre}</span>
                        {yaElegido(m.id) ? (
                          <span className="text-xs">Ya está en la lista</span>
                        ) : m.evaluabilidad !== "EVALUADO" ? (
                          <Chip tono="advertencia">Sin datos</Chip>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>

        {/* --- Elegidos ---------------------------------------------------- */}
        <ul className="mt-4 flex flex-col gap-2">
          {elegidos.map((m) => {
            const aviso = AVISO[m.evaluabilidad];
            return (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-borde bg-superficie px-3 py-2.5"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{m.nombre}</span>
                  {aviso ? (
                    <span className="text-xs text-advertencia-texto">
                      {aviso.texto}
                    </span>
                  ) : null}
                </div>
                <Boton onClick={() => quitar(m.id)}>Quitar</Boton>
              </li>
            );
          })}
        </ul>

        {elegidos.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-borde px-4 py-6 text-center text-sm text-texto-sutil">
            Todavía no elegiste ningún medicamento.
          </p>
        ) : null}
      </section>

      {/* --- Evaluar ------------------------------------------------------- */}
      <section className="flex flex-col gap-3 border-t border-borde pt-6">
        {sinDatos.length > 0 ? (
          <p className="rounded-md border border-advertencia-borde bg-advertencia-fondo px-4 py-3 text-sm text-advertencia-texto">
            <strong className="font-medium">
              {sinDatos.length === 1
                ? "1 de los medicamentos elegidos no se va a poder cruzar"
                : `${sinDatos.length} de los medicamentos elegidos no se van a poder cruzar`}
              .
            </strong>{" "}
            El resultado no va a decir nada sobre{" "}
            {sinDatos.length === 1 ? "esa droga" : "esas drogas"}, ni siquiera
            que estén bien.
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-critico-borde bg-critico-fondo px-4 py-3 text-sm text-critico-texto"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Boton
            variante="primario"
            onClick={() => void evaluar()}
            disabled={!puedeEvaluar}
          >
            {evaluando ? "Evaluando…" : "Evaluar interacciones"}
          </Boton>

          {elegidos.length < MINIMO ? (
            <span className="text-sm text-texto-tenue">
              {elegidos.length === 0
                ? `Elegí ${MINIMO} medicamentos para evaluar.`
                : `Falta 1 medicamento más.`}
            </span>
          ) : null}
        </div>

        <p className="text-xs text-texto-sutil">
          El sistema informa lo que hay registrado en su fuente. No reemplaza el
          criterio profesional.
        </p>
      </section>
    </div>
  );
}
