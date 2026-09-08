import type { Metadata } from "next";
import { ListaPacientes } from "./ListaPacientes";

// Pantalla de pacientes (tarea 5.11).
//
// La pagina es un componente de servidor y solo arma el encabezado; lo
// interactivo vive en <ListaPacientes />, que es de cliente. Mismo reparto que
// en /medicamentos y /stock.

export const metadata: Metadata = {
  title: "Pacientes · Verifarm",
};

export default function PaginaPacientes() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-texto">Pacientes</h1>
        <p className="mt-1 text-sm text-texto-tenue">
          Cada paciente se identifica con un seudónimo. El sistema no guarda
          nombre, documento ni fecha de nacimiento.
        </p>
      </header>

      <ListaPacientes />
    </main>
  );
}
