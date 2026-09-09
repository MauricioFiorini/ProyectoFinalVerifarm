"use client";

import { useCallback, useEffect, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Chip } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { hoyComoTexto } from "@/lib/fechas";

// Modal para agregar una droga a la medicacion de un paciente (tarea 5.14).
//
// POR QUE EL SELECTOR SE ESCRIBE ACA Y NO EN src/components/ui/
//
// `CampoSelector` es un <select>, y con un catalogo que va a crecer un <select>
// sin buscador se vuelve inutilizable. Hacia falta un buscador con lista de
// resultados.
//
// **No se hizo un componente compartido.** La regla que se dejo escrita al mudar
// `Chip` es que algo sube a `src/components/ui/` cuando DOS rutas distintas lo
// necesitan; hoy lo necesita solo esta. La 5.16 tambien elige medicamentos, pero
// elige VARIOS a la vez, que es otro widget. Si al escribirla resulta ser el
// mismo, ahi sube: mudarlo despues cuesta menos que mantener una abstraccion que
// sirve para un solo caso.
//
// LOS ERRORES VIENEN DEL SERVIDOR
//
// Que la droga no este ya vigente y que la fecha no sea futura son reglas del
// servicio (5.04). Aca se manda y se pinta lo que conteste.

type MedicamentoDeApi = {
  id: string;
  nombre: string;
  rxcui: string | null;
};

type Props = {
  pacienteId: string;
  alCerrar: () => void;
  /** Se llama despues de un alta exitosa, para refrescar la ficha. */
  alAgregar: () => void;
};

type RespuestaDeError = { error?: string; campos?: Record<string, string> };

/** Cuantos resultados se muestran. Con mas, la lista tapa el resto del modal. */
const MAXIMO_DE_RESULTADOS = 6;

export function ModalAgregarMedicacion({
  pacienteId,
  alCerrar,
  alAgregar,
}: Props) {
  const [buscar, setBuscar] = useState("");
  const [resultados, setResultados] = useState<MedicamentoDeApi[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [elegido, setElegido] = useState<MedicamentoDeApi | null>(null);
  const [fechaInicio, setFechaInicio] = useState(hoyComoTexto());
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const buscarMedicamentos = useCallback(async (texto: string) => {
    const limpio = texto.trim();
    if (limpio === "") {
      setResultados([]);
      return;
    }

    setBuscando(true);
    try {
      const r = await fetch(
        `/api/medicamentos?buscar=${encodeURIComponent(limpio)}`,
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setResultados((await r.json()) as MedicamentoDeApi[]);
    } catch {
      // Un fallo del buscador no merece un cartel rojo: la lista queda vacia y
      // se puede volver a tipear. El error que si importa es el del alta.
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  }, []);

  // Se espera a que deje de tipear. Ver la nota de ListaMedicamentos.tsx.
  useEffect(() => {
    // Con uno ya elegido no se busca: la lista esta oculta y pedir seria gastar
    // viajes por un resultado que nadie va a ver.
    if (elegido) return;
    const t = setTimeout(() => void buscarMedicamentos(buscar), 250);
    return () => clearTimeout(t);
  }, [buscar, elegido, buscarMedicamentos]);

  function elegir(medicamento: MedicamentoDeApi) {
    setElegido(medicamento);
    setResultados([]);
    setErrores(({ medicamentoId: _d, ...resto }) => resto);
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErrores({});
    setErrorGeneral(null);

    try {
      const respuesta = await fetch("/api/medicacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId,
          medicamentoId: elegido?.id ?? "",
          fechaInicio,
        }),
      });

      if (respuesta.ok) {
        alAgregar();
        alCerrar();
        return;
      }

      const cuerpo = (await respuesta.json()) as RespuestaDeError;
      setErrores(cuerpo.campos ?? {});
      if (!cuerpo.campos) {
        setErrorGeneral(cuerpo.error ?? "No se pudo agregar la medicación.");
      }
    } catch {
      setErrorGeneral(
        "No se pudo contactar al servidor. Revisá tu conexión y volvé a intentar.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      abierto
      titulo="Agregar medicamento"
      alCerrar={alCerrar}
      acciones={
        <>
          <Boton onClick={alCerrar} disabled={enviando}>
            Cancelar
          </Boton>
          <Boton
            variante="primario"
            type="submit"
            form="form-agregar-medicacion"
            // Sin droga elegida no hay nada que agregar. Es lo unico que el
            // cliente decide por su cuenta, y no es una regla del dominio: es
            // que el formulario esta incompleto.
            disabled={enviando || elegido === null}
          >
            {enviando ? "Agregando…" : "Agregar"}
          </Boton>
        </>
      }
    >
      <form
        id="form-agregar-medicacion"
        onSubmit={enviar}
        noValidate
        className="flex flex-col gap-4"
      >
        {errorGeneral ? (
          <p
            role="alert"
            className="rounded-md border border-critico-borde bg-critico-fondo px-3 py-2 text-sm text-critico-texto"
          >
            {errorGeneral}
          </p>
        ) : null}

        {elegido ? (
          <div>
            <p className="mb-1.5 block text-sm font-medium text-texto">
              Medicamento
            </p>
            <div className="flex items-center justify-between gap-3 rounded-md border border-borde bg-superficie-tenue px-3 py-2">
              <span className="flex items-center gap-2 text-sm">
                <span className="font-medium">{elegido.nombre}</span>
                {elegido.rxcui === null ? (
                  <Chip tono="advertencia">Sin RxCUI cargado</Chip>
                ) : null}
              </span>
              <Boton
                onClick={() => {
                  setElegido(null);
                  setBuscar("");
                }}
              >
                Cambiar
              </Boton>
            </div>
            {errores.medicamentoId ? (
              <p role="alert" className="mt-1.5 text-sm text-critico-texto">
                {errores.medicamentoId}
              </p>
            ) : null}
            {elegido.rxcui === null ? (
              <p className="mt-1.5 text-xs text-texto-tenue">
                Se puede agregar igual, pero no va a participar de la evaluación
                de interacciones.
              </p>
            ) : null}
          </div>
        ) : (
          <div>
            <Campo
              etiqueta="Medicamento"
              type="search"
              placeholder="Buscar por nombre de droga…"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              error={errores.medicamentoId}
              ayuda="Escribí para buscar en el catálogo."
              autoComplete="off"
              autoFocus
            />

            {buscar.trim() !== "" ? (
              <div
                className="mt-2 overflow-hidden rounded-md border border-borde"
                role="listbox"
                aria-label="Resultados de la búsqueda"
              >
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
                    No hay medicamentos que coincidan con «{buscar.trim()}».
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
                          role="option"
                          aria-selected="false"
                          onClick={() => elegir(m)}
                          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-superficie-tenue focus-visible:bg-superficie-tenue focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-marca-600"
                        >
                          <span className="font-medium">{m.nombre}</span>
                          {m.rxcui === null ? (
                            <Chip tono="advertencia">Sin RxCUI</Chip>
                          ) : (
                            <span className="font-mono text-xs text-texto-sutil">
                              {m.rxcui}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {resultados.length > MAXIMO_DE_RESULTADOS ? (
                  <p className="border-t border-borde px-3 py-2 text-xs text-texto-sutil">
                    Se muestran {MAXIMO_DE_RESULTADOS} de {resultados.length}.
                    Afiná la búsqueda.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        <Campo
          etiqueta="Fecha de inicio"
          type="date"
          value={fechaInicio}
          onChange={(e) => {
            setFechaInicio(e.target.value);
            setErrores(({ fechaInicio: _d, ...resto }) => resto);
          }}
          error={errores.fechaInicio}
          ayuda="Desde cuándo la toma. Viene con hoy puesto."
        />
      </form>
    </Modal>
  );
}
