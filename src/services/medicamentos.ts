import { db } from "../lib/db";
import { Medicamento, UnidadMedida } from "@prisma/client";
import { ErrorDeNegocio } from "./errores";

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
  /** Principio activo, sin dosis. Ver docs/decisiones/0006. */
  nombre: string;
  /**
   * RxCUI de ingrediente. Opcional por decision (0005): un medicamento sin
   * codigo se carga igual y funciona para el modulo de stock; lo que no puede
   * hacer es participar del cruce de interacciones, y eso se avisa.
   */
  rxcui?: string | null;
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
    throw new ErrorDeNegocio(
      "DUPLICADO",
      `El medicamento con nombre "${data.nombre}" ya existe en el catalogo.`,
      "nombre",
    );
  }

  // El rxcui sigue siendo @unique, pero ahora puede faltar. En PostgreSQL
  // varios NULL conviven sin violar la unicidad, asi que solo hay algo que
  // comprobar cuando el codigo viene.
  if (data.rxcui) {
    const existenteRxcui = await db.medicamento.findUnique({
      where: { rxcui: data.rxcui },
    });

    if (existenteRxcui) {
      throw new ErrorDeNegocio(
        "DUPLICADO",
        `El RxCUI "${data.rxcui}" ya se encuentra registrado.`,
        "rxcui",
      );
    }
  }

  return db.medicamento.create({
    data: {
      nombre: data.nombre,
      rxcui: data.rxcui ?? null,
      unidad: data.unidad,
      stockMinimo: data.stockMinimo ?? 0,
    },
  });
}
