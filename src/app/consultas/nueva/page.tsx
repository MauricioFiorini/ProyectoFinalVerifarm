import type { Metadata } from "next";
import { NuevaConsulta } from "./NuevaConsulta";

// Pantalla de consulta de interacciones (tarea 5.16).

export const metadata: Metadata = {
  title: "Nueva consulta · Verifarm",
};

export default function PaginaNuevaConsulta() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-texto">
          Evaluar interacciones
        </h1>
        <p className="mt-1 text-sm text-texto-tenue">
          Elegí los medicamentos a evaluar. El paciente es opcional.
        </p>
      </header>

      <NuevaConsulta />
    </main>
  );
}
