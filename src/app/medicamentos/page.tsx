import type { Metadata } from "next";
import { ListaMedicamentos } from "./ListaMedicamentos";

// Pantalla del catalogo de medicamentos (tarea 3.06).
//
// La pagina es un componente de servidor y solo arma el encabezado; todo lo
// interactivo vive en <ListaMedicamentos />, que es de cliente. Asi el HTML
// inicial llega renderizado y solo el listado carga JavaScript.

export const metadata: Metadata = {
  title: "Medicamentos · Verifarm",
};

export default function PaginaMedicamentos() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-texto">Medicamentos</h1>
        <p className="mt-1 text-sm text-texto-tenue">
          Catálogo de principios activos. El nombre es la droga, sin dosis.
        </p>
      </header>

      <ListaMedicamentos />
    </main>
  );
}
