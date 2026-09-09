import type { Metadata } from "next";
import { ListaConsultas } from "./ListaConsultas";

// Listado de consultas (tarea 5.20).

export const metadata: Metadata = {
  title: "Consultas · Verifarm",
};

export default function PaginaConsultas() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-texto">Consultas</h1>
        <p className="mt-1 text-sm text-texto-tenue">
          Cada consulta guarda qué medicamentos se evaluaron y qué se encontró.
          De la más reciente a la más antigua.
        </p>
      </header>

      <ListaConsultas />
    </main>
  );
}
