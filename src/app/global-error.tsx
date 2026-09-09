"use client";

import { useEffect } from "react";
import { Boton } from "@/components/ui/Boton";

// Manejador crítico de errores en el layout raíz (tarea 6.04).
//
// Solo se activa si falla el propio `RootLayout`. Debe definir sus propias
// etiquetas <html> y <body> porque el layout raíz queda reemplazado por esta
// pantalla de emergencia.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      "Error crítico en layout raíz capturado por global-error:",
      error,
    );
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-superficie p-6">
        <div
          role="alert"
          aria-live="assertive"
          className="w-full max-w-lg rounded-lg border border-critico-borde bg-critico-fondo p-8 text-center text-critico-texto"
        >
          <h1 className="text-xl font-bold">Error crítico del sistema</h1>
          <p className="mt-2 text-sm">
            Ocurrió un error general que impidió cargar la estructura principal
            de la aplicación.
          </p>
          <div className="mt-6 flex justify-center">
            <Boton variante="primario" onClick={reset}>
              Recargar sistema
            </Boton>
          </div>
        </div>
      </body>
    </html>
  );
}
