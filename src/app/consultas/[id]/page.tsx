import type { Metadata } from "next";
import Link from "next/link";

// Resultado de una consulta — PANTALLA PROVISORIA.
//
// **Esto no es la 5.18.** La pantalla de verdad muestra las observaciones
// ordenadas por severidad y, al lado, los medicamentos que la fuente no cubre.
// Mientras tanto esta pagina existe para que el recorrido de la 5.16 no termine
// en un 404: se evalua, se guarda, y hay adonde llegar.
//
// Mismo criterio que la pantalla de inicio provisoria de la 6.01: cuando algo
// todavia no esta, se dice en pantalla y se aclara que tarea lo reemplaza.
//
// La consulta YA quedo guardada con todo: sus medicamentos evaluados y sus
// observaciones. Lo unico que falta es mostrarlas.

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

      <h1 className="text-2xl font-semibold text-texto">Consulta registrada</h1>

      <div className="mt-6 rounded-md border border-borde bg-superficie px-6 py-5">
        <p className="text-sm text-texto">
          La consulta se guardó con los medicamentos que se evaluaron y las
          interacciones que se encontraron.
        </p>
        <p className="mt-3 text-sm text-texto-tenue">
          Identificador: <span className="font-mono">{id}</span>
        </p>
      </div>

      <p className="mt-6 text-xs text-texto-sutil">
        Pantalla provisoria. El resultado con las observaciones ordenadas por
        severidad, y la lista de medicamentos que la fuente no cubre, es la
        tarea 5.18.
      </p>
    </main>
  );
}
