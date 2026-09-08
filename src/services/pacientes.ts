import { db } from "../lib/db";
import { Paciente } from "@prisma/client";
import { ErrorDeNegocio } from "./errores";

// Servicio de pacientes (tarea 5.01).
//
// EL PACIENTE NO TIENE DATOS FILIATORIOS. NINGUNO.
//
// No es una simplificacion del prototipo que despues se completa: es la regla
// que hace que este trabajo pueda existir. Los datos de salud son datos
// personales sensibles (Ley 25.326, art. 8) y esto es un trabajo academico con
// datos sinteticos. Ver docs/CONTEXTO.md seccion 3.
//
// Lo unico que identifica a un paciente es un seudonimo: un codigo interno que
// el personal de la institucion sabe a quien corresponde, y que fuera del
// sistema no dice nada. Nunca nombre, documento ni fecha de nacimiento, y no
// hay ningun campo donde ponerlos.
//
// Los mockups de `concpeto/` muestran un campo DNI. **No se implementa.** Es una
// de las pantallas que estan fuera de alcance a proposito.

/** Cantidad de caracteres que se le pide a un seudonimo para ser util. */
const LARGO_MINIMO = 3;

/**
 * Un documento argentino es una tirada de 7 u 8 digitos y nada mas. Un
 * seudonimo que sea exactamente eso casi seguro es un DNI escrito en el campo
 * equivocado, asi que no entra.
 *
 * La comprobacion es a proposito estrecha: `PAC-001`, `A-38123456` o `H12` son
 * seudonimos validos y pasan. Lo unico que rechaza es el numero pelado, que es
 * el caso que de verdad importa.
 */
const PARECE_DOCUMENTO = /^\d{7,8}$/;

export async function listarPacientes(): Promise<Paciente[]> {
  return db.paciente.findMany({
    where: { activo: true },
    orderBy: { seudonimo: "asc" },
  });
}

export async function buscarPacientesPorSeudonimo(
  texto: string,
): Promise<Paciente[]> {
  return db.paciente.findMany({
    where: {
      activo: true,
      seudonimo: { contains: texto, mode: "insensitive" },
    },
    orderBy: { seudonimo: "asc" },
  });
}

export async function obtenerPacientePorId(
  id: string,
): Promise<Paciente | null> {
  return db.paciente.findUnique({
    where: { id, activo: true },
  });
}

export type CrearPacienteInput = {
  /** Codigo interno. Lo unico que identifica al paciente. */
  seudonimo: string;
};

export async function crearPaciente(
  data: CrearPacienteInput,
): Promise<Paciente> {
  // Se normaliza antes de comparar y de guardar: " PAC-001 " y "PAC-001" son el
  // mismo paciente, y un espacio invisible al final produciria dos fichas para
  // la misma persona sin que nadie note la diferencia en pantalla.
  const seudonimo = data.seudonimo.trim();

  if (seudonimo.length < LARGO_MINIMO) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      `El seudonimo tiene que tener al menos ${LARGO_MINIMO} caracteres.`,
      "seudonimo",
    );
  }

  if (PARECE_DOCUMENTO.test(seudonimo)) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "El seudonimo no puede ser un numero de documento. Usa un codigo interno, por ejemplo PAC-001.",
      "seudonimo",
    );
  }

  // `seudonimo` es @unique en el esquema, pero esa unicidad distingue
  // mayusculas: "PAC-001" y "pac-001" entrarian los dos y serian dos fichas de
  // la misma persona. La comparacion insensible va aca.
  const existente = await db.paciente.findFirst({
    where: { seudonimo: { equals: seudonimo, mode: "insensitive" } },
  });

  if (existente) {
    throw new ErrorDeNegocio(
      "DUPLICADO",
      `Ya hay un paciente con el seudonimo "${seudonimo}".`,
      "seudonimo",
    );
  }

  return db.paciente.create({ data: { seudonimo } });
}
