"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

// Modal base (tarea 3.05).
//
// Lo usan el alta de medicamento (3.07), el ingreso de lote (4.13), la
// dispensacion FEFO (4.14) y el alta de paciente (5.12).
//
// POR QUE NO ES UN <dialog>
//
// El elemento nativo resolveria el foco y el Escape solo, pero su backdrop se
// estiliza con ::backdrop, que queda fuera del sistema de tokens de Tailwind 4
// que armamos en la 1.10. Se prefirio manejar las tres cosas a mano —Escape,
// foco y scroll del fondo— y mantener todo el color en los tokens.

type Props = {
  abierto: boolean;
  titulo: string;
  /** Se llama al apretar Escape, al clic en el fondo y en el boton de cerrar. */
  alCerrar: () => void;
  children: ReactNode;
  /** Botones del pie. Van alineados a la derecha, el primario ultimo. */
  acciones?: ReactNode;
};

export function Modal({
  abierto,
  titulo,
  alCerrar,
  children,
  acciones,
}: Props) {
  const idTitulo = useId();
  const panel = useRef<HTMLDivElement>(null);

  // Escape cierra. Se registra en `document` y no en el panel porque el foco
  // puede estar en cualquier control de adentro.
  useEffect(() => {
    if (!abierto) return;

    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") alCerrar();
    };

    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abierto, alCerrar]);

  // Bloquear el scroll del fondo mientras el modal esta abierto. Sin esto, la
  // rueda del mouse mueve la pagina de atras y el modal parece flotar suelto.
  useEffect(() => {
    if (!abierto) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [abierto]);

  // Llevar el foco adentro al abrir, para que el teclado no siga navegando la
  // pantalla de atras.
  useEffect(() => {
    if (!abierto) return;

    // Se busca primero un control de formulario y recien despues cualquier
    // enfocable. Sin ese orden el foco cae en la cruz de cerrar, que esta antes
    // en el DOM, y quien usa teclado tiene que tabular hasta el primer campo.
    const panelActual = panel.current;
    if (!panelActual) return;

    const campo = panelActual.querySelector<HTMLElement>(
      "input:not([type=hidden]), select, textarea",
    );
    const alternativa = panelActual.querySelector<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
    );

    (campo ?? alternativa)?.focus();
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-texto/40 p-4"
      // El clic cierra solo si fue en el fondo. Sin esta comparacion, arrastrar
      // una seleccion de texto desde adentro y soltar afuera cierra el modal y
      // se pierde lo que la persona estaba escribiendo.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) alCerrar();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-borde bg-superficie shadow-lg"
      >
        <div className="flex items-start justify-between gap-4 border-b border-borde px-6 py-4">
          <h2 id={idTitulo} className="text-lg font-semibold text-texto">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={alCerrar}
            aria-label="Cerrar"
            className="-m-1 rounded p-1 text-texto-sutil hover:bg-superficie-tenue hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            {/* SVG inline: no se instalan bibliotecas de iconos. */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {acciones ? (
          <div className="flex justify-end gap-3 border-t border-borde bg-superficie-tenue px-6 py-4">
            {acciones}
          </div>
        ) : null}
      </div>
    </div>
  );
}
