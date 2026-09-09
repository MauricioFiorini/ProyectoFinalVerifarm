"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Boton } from "@/components/ui/Boton";

// Página de error global de la aplicación (tarea 6.04).
//
// Atrapa excepciones no controladas dentro de cualquier página o componente
// del árbol sin romper el layout transversal (la barra superior y lateral se
// mantienen visibles y funcionales).
//
// Permite al usuario reintentar la renderización mediante la función `reset()`
// o regresar al panel de inicio.

export default function ErrorGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar el error para diagnóstico técnico
    console.error("Error no controlado capturado por app/error.tsx:", error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-lg border border-critico-borde bg-critico-fondo p-8 text-critico-texto shadow-xs"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-critico-borde text-lg font-bold"
          >
            !
          </span>
          <div>
            <h1 className="text-xl font-semibold">
              Se produjo un error inesperado
            </h1>
            <p className="mt-1 text-sm">
              Ocurrió un problema durante la ejecución de esta pantalla. El
              estado fue capturado para evitar un fallo crítico.
            </p>
          </div>
        </div>

        {error.message && (
          <div className="mt-6 rounded-md border border-critico-borde bg-superficie p-4 font-mono text-xs text-texto">
            <span className="font-semibold text-critico-texto">Detalle: </span>
            {error.message}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Boton variante="primario" onClick={reset}>
            Reintentar operación
          </Boton>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-borde bg-superficie px-4 py-2 text-sm font-medium text-texto transition-colors hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
