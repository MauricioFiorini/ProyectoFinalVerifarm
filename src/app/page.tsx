import type { Metadata } from "next";

// Pantalla de inicio, provisoria.
//
// Lo que habia aca era la plantilla de `create-next-app`, con el logo de Vercel
// y los botones de "Deploy Now" y "Documentation". Con la barra lateral de la
// tarea 6.01 esa pantalla pasa a ser el destino del enlace "Inicio", y no se
// puede dejar codigo de andamio como primera pantalla del sistema.
//
// ESTA PANTALLA NO ES LA 6.03. La de verdad lleva tarjetas con los
// medicamentos bajo minimo, los lotes por vencer y las consultas del dia, cada
// una enlazada a su seccion, y depende de la 4.11 y la 5.20. Mientras tanto
// esto solo dice que hay y por donde entrar, sin consultar nada a la base.

export const metadata: Metadata = {
  title: "Verifarm",
};

export default function PaginaInicio() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-texto">Verifarm</h1>
        <p className="mt-1 text-sm text-texto-tenue">
          Colonia Psiquiátrica &laquo;Dr. Abelardo Irigoyen Freyre&raquo;.
        </p>
      </header>

      <div className="rounded-md border border-borde bg-superficie px-6 py-5">
        <p className="text-sm text-texto">
          El sistema tiene dos módulos:{" "}
          <strong className="font-medium">
            trazabilidad de stock por lote
          </strong>
          , con dispensación por vencimiento más próximo, y{" "}
          <strong className="font-medium">soporte a la decisión clínica</strong>{" "}
          por interacciones medicamentosas.
        </p>
        <p className="mt-3 text-sm text-texto-tenue">
          Se entra por la barra de la izquierda.
        </p>
      </div>

      <p className="mt-6 text-xs text-texto-sutil">
        Pantalla provisoria. El tablero con medicamentos bajo mínimo, lotes por
        vencer y consultas del día es la tarea 6.03.
      </p>
    </main>
  );
}
