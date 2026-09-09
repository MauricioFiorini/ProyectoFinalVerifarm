import type { Metadata } from "next";
import { TableroInicio } from "./TableroInicio";

// Pantalla de inicio definitiva con tarjetas (tarea 6.03).
//
// Muestra el tablero principal con tres tarjetas de estado:
// 1. Medicamentos bajo stock mínimo (con enlace a /stock).
// 2. Lotes por vencer dentro de 30 días (con enlace a /stock).
// 3. Consultas clínicas del día (con enlace a /consultas y acceso a /consultas/nueva).
//
// Cada tarjeta resume el estado actual a partir de la API (/api/inicio).

export const metadata: Metadata = {
  title: "Inicio · Verifarm",
};

export default function PaginaInicio() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-texto">Panel General</h1>
        <p className="mt-1 text-sm text-texto-tenue">
          Colonia Psiquiátrica &laquo;Dr. Abelardo Irigoyen Freyre&raquo;
          &middot; Trazabilidad de stock por lote con dispensación FEFO y
          soporte a la decisión clínica.
        </p>
      </header>

      <TableroInicio />
    </main>
  );
}
