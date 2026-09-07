import type { Metadata } from "next";
import { TablaDeStock } from "./TablaDeStock";

// Pantalla de stock (tarea 4.11).

export const metadata: Metadata = {
  title: "Stock · Verifarm",
};

export default function PaginaStock() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-texto">Stock</h1>
        <p className="mt-1 text-sm text-texto-tenue">
          Disponible por medicamento. El disponible cuenta solo lotes vigentes:
          la medicación vencida no se puede dispensar.
        </p>
      </header>

      <TablaDeStock />
    </main>
  );
}
