import type { Metadata } from "next";
import Link from "next/link";
import { MedicacionDelPaciente } from "./MedicacionDelPaciente";

// Ficha del paciente (tarea 5.13).
//
// El seudonimo no se sabe todavia aca: lo trae el mismo pedido que la
// medicacion, dentro del componente de cliente. Por eso el titulo del navegador
// es generico y el encabezado visible lo dibuja el componente. Mismo reparto que
// en /stock/[medicamentoId].

export const metadata: Metadata = {
  title: "Paciente · Verifarm",
};

export default async function PaginaPaciente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link
        href="/pacientes"
        className="mb-6 inline-block text-sm text-marca-600 hover:underline"
      >
        ← Volver a pacientes
      </Link>

      <MedicacionDelPaciente pacienteId={id} />
    </main>
  );
}
