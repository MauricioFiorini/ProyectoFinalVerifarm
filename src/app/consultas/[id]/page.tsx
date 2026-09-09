import type { Metadata } from "next";
import Link from "next/link";
import { ResultadoDeConsulta } from "./ResultadoDeConsulta";

// Resultado de una consulta (tarea 5.18).
//
// La consulta se lee por su direccion, asi que se puede volver a abrir mas
// adelante: es un registro, no una pantalla de paso. Lo que muestra es lo que se
// guardo el dia que se hizo —el texto de las observaciones no se recompone— con
// una excepcion documentada en la decision 0014: la cobertura se recalcula, o
// sea que una consulta vieja puede dejar de decir "sin datos" si mas adelante
// entra una fuente que cubra esa droga.

export const metadata: Metadata = {
  title: "Consulta · Verifarm",
};

export default async function PaginaConsulta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href="/consultas/nueva"
        className="mb-6 inline-block text-sm text-marca-600 hover:underline"
      >
        ← Nueva consulta
      </Link>

      <ResultadoDeConsulta consultaId={id} />
    </main>
  );
}
