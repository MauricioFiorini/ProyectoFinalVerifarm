import type { Metadata } from "next";
import Link from "next/link";
import { LotesDelMedicamento } from "./LotesDelMedicamento";

// Lotes de un medicamento (tarea 4.12).
//
// El nombre del medicamento no se sabe todavia aca: lo trae el mismo pedido que
// los lotes, dentro del componente de cliente. Por eso el titulo del navegador
// es generico y el encabezado visible lo dibuja el componente.

export const metadata: Metadata = {
  title: "Lotes · Verifarm",
};

export default async function PaginaLotes({
  params,
}: {
  params: Promise<{ medicamentoId: string }>;
}) {
  const { medicamentoId } = await params;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link
        href="/stock"
        className="mb-6 inline-block text-sm text-marca-600 hover:underline"
      >
        ← Volver al stock
      </Link>

      <LotesDelMedicamento medicamentoId={medicamentoId} />
    </main>
  );
}
