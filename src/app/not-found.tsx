import Link from "next/link";

// Página de ruta no encontrada 404 (tarea 6.04).
//
// Se muestra cuando una URL solicitada no existe dentro del enrutamiento de la
// aplicación, manteniendo el layout transversal y ofreciendo navegación limpia.

export default function PaginaNoEncontrada() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="rounded-lg border border-borde bg-superficie p-8 text-center shadow-xs">
        <span className="text-xs font-semibold tracking-wider text-texto-tenue uppercase">
          Error 404
        </span>
        <h1 className="mt-2 text-2xl font-bold text-texto">
          Página no encontrada
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-texto-tenue">
          La dirección solicitada no existe o no se encuentra disponible en
          Verifarm.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-marca-600 bg-marca-600 px-4 py-2 text-sm font-medium text-superficie transition-colors hover:bg-marca-700 hover:border-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Ir al inicio
          </Link>
          <Link
            href="/stock"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-borde bg-superficie px-4 py-2 text-sm font-medium text-texto transition-colors hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Ver stock
          </Link>
          <Link
            href="/consultas"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-borde bg-superficie px-4 py-2 text-sm font-medium text-texto transition-colors hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
          >
            Ver consultas
          </Link>
        </div>
      </div>
    </main>
  );
}
