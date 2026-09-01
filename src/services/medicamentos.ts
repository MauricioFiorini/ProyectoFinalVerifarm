import { db } from "../lib/db";
import { Medicamento, UnidadMedida } from "@prisma/client";

export async function listarMedicamentos(): Promise<Medicamento[]> {
  return db.medicamento.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
}

export async function buscarMedicamentosPorNombre(
  nombre: string,
): Promise<Medicamento[]> {
  return db.medicamento.findMany({
    where: {
      activo: true,
      nombre: { contains: nombre, mode: "insensitive" },
    },
    orderBy: { nombre: "asc" },
  });
}

export async function obtenerMedicamentoPorId(
  id: string,
): Promise<Medicamento | null> {
  return db.medicamento.findUnique({
    where: { id, activo: true },
  });
}

export type CrearMedicamentoInput = {
  nombre: string;
  rxcui: string;
  unidad: UnidadMedida;
  stockMinimo?: number;
};

export async function crearMedicamento(
  data: CrearMedicamentoInput,
): Promise<Medicamento> {
  // Validar nombre de droga unico (case insensitive)
  const existente = await db.medicamento.findFirst({
    where: {
      nombre: { equals: data.nombre, mode: "insensitive" },
    },
  });

  if (existente) {
    throw new Error(
      `El medicamento con nombre "${data.nombre}" ya existe en el catalogo.`,
    );
  }

  // Validar RxCUI unico, ya que el modelo lo exige (es @unique)
  const existenteRxcui = await db.medicamento.findUnique({
    where: { rxcui: data.rxcui },
  });

  if (existenteRxcui) {
    throw new Error(`El RxCUI "${data.rxcui}" ya se encuentra registrado.`);
  }

  return db.medicamento.create({
    data: {
      nombre: data.nombre,
      rxcui: data.rxcui,
      unidad: data.unidad,
      stockMinimo: data.stockMinimo ?? 0,
    },
  });
}
