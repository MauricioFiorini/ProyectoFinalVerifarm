import { db } from "../lib/db";
import { Medicamento, UnidadMedida } from "@prisma/client";
import { ErrorDeNegocio } from "./errores";
import {
  calcularEvaluabilidad,
  rxcuisConCobertura,
  type Evaluabilidad,
} from "./interacciones";

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

// --- Cobertura de la fuente de interacciones (tarea 5.16) -------------------
//
// POR QUE ES OPCIONAL Y NO VIENE SIEMPRE
//
// Calcularla cuesta una consulta mas. La pantalla del catalogo (3.06) no la
// necesita: ahi lo que importa es si el `rxcui` esta cargado, y eso ya se ve.
// La que la necesita es la pantalla de consulta (5.16), que tiene que avisar
// **antes de evaluar** cual de las drogas elegidas la fuente no cubre.
//
// Por eso se pide explicitamente, igual que `incluirNoVigentes` en la
// medicacion: el que la quiere, la pide.

export type MedicamentoConCobertura = Medicamento & {
  evaluabilidad: Evaluabilidad;
};

/**
 * Agrega a cada medicamento si la fuente de interacciones lo cubre.
 *
 * Una sola consulta para toda la lista, no una por fila. Mismo criterio que la
 * cuenta de pacientes (5.11) y la cobertura de la medicacion (5.13).
 */
export async function conCobertura(
  medicamentos: Medicamento[],
): Promise<MedicamentoConCobertura[]> {
  const rxcuis = medicamentos
    .map((m) => m.rxcui)
    .filter((r): r is string => r !== null);
  const cubiertos = new Set(await rxcuisConCobertura(rxcuis));

  return medicamentos.map((m) => ({
    ...m,
    evaluabilidad: calcularEvaluabilidad(m.rxcui, cubiertos),
  }));
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
