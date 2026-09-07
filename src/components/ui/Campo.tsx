"use client";

import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

// Campo de formulario base (tarea 3.05).
//
// Envuelve etiqueta, control y mensaje de error, y los conecta entre si con los
// atributos que necesita un lector de pantalla: `htmlFor`, `aria-invalid` y
// `aria-describedby`.
//
// El mensaje de error va POR CAMPO, debajo del control. Es lo que devuelve la
// API: `respuestaDeError` y `respuestaDeValidacion` mandan un objeto `campos`
// con el mensaje de cada uno, justamente para poder pintarlos aca y no en un
// cartel suelto arriba del formulario.

const CLASES_CONTROL = [
  "w-full rounded-md border bg-superficie px-3 py-2 text-sm text-texto",
  "placeholder:text-texto-sutil",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600",
  "disabled:cursor-not-allowed disabled:bg-superficie-tenue disabled:opacity-60",
].join(" ");

type PropsComunes = {
  etiqueta: string;
  /** Mensaje de error del campo. Si viene, el control se marca como invalido. */
  error?: string;
  /** Texto de ayuda debajo del control. Se oculta cuando hay error. */
  ayuda?: ReactNode;
};

function Envoltorio({
  etiqueta,
  error,
  ayuda,
  idControl,
  idMensaje,
  children,
}: PropsComunes & {
  idControl: string;
  idMensaje: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={idControl}
        className="text-sm font-medium text-texto-tenue"
      >
        {etiqueta}
      </label>

      {children}

      {error ? (
        <p id={idMensaje} className="text-sm text-critico-texto">
          {error}
        </p>
      ) : ayuda ? (
        <p id={idMensaje} className="text-sm text-texto-sutil">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

type PropsCampo = PropsComunes &
  Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

/** Campo de texto o numero. */
export function Campo({ etiqueta, error, ayuda, ...resto }: PropsCampo) {
  const base = useId();
  const idControl = `${base}-control`;
  const idMensaje = `${base}-mensaje`;

  return (
    <Envoltorio
      etiqueta={etiqueta}
      error={error}
      ayuda={ayuda}
      idControl={idControl}
      idMensaje={idMensaje}
    >
      <input
        id={idControl}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? idMensaje : undefined}
        className={[
          CLASES_CONTROL,
          error ? "border-critico-borde" : "border-borde",
        ].join(" ")}
        {...resto}
      />
    </Envoltorio>
  );
}

type PropsSelector = PropsComunes &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
    opciones: { valor: string; texto: string }[];
    /** Texto de la opcion vacia inicial. Si no se pasa, no hay opcion vacia. */
    marcador?: string;
  };

/**
 * Selector. Va en el mismo archivo que `Campo` a proposito: comparten etiqueta,
 * error y ayuda, y separarlos duplicaria el envoltorio.
 *
 * Lo usa el modal de alta de la tarea 3.07 para la unidad de medida.
 */
export function CampoSelector({
  etiqueta,
  error,
  ayuda,
  opciones,
  marcador,
  ...resto
}: PropsSelector) {
  const base = useId();
  const idControl = `${base}-control`;
  const idMensaje = `${base}-mensaje`;

  return (
    <Envoltorio
      etiqueta={etiqueta}
      error={error}
      ayuda={ayuda}
      idControl={idControl}
      idMensaje={idMensaje}
    >
      <select
        id={idControl}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? idMensaje : undefined}
        className={[
          CLASES_CONTROL,
          error ? "border-critico-borde" : "border-borde",
        ].join(" ")}
        {...resto}
      >
        {marcador ? <option value="">{marcador}</option> : null}
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </Envoltorio>
  );
}
