import { db } from "../lib/db";
import { MedicacionVigente } from "@prisma/client";
import { ErrorDeNegocio } from "./errores";

// Servicio de medicacion de un paciente (tarea 5.04).
//
// QUE ES UNA FILA DE `MedicacionVigente`
//
// Un tramo: esta droga, para este paciente, desde esta fecha y hasta esta otra.
// No es "el estado actual del paciente", es un renglon de su historia. Si se le
// suspende el clonazepam y tres meses despues se le reinicia, son DOS filas.
//
// Por eso el esquema ya no tiene `@@unique([pacienteId, medicamentoId])`: esa
// restriccion obligaba a pisar la fila vieja y se perdia el registro de que
// alguna vez se suspendio y por que.
//
// La regla que si vale es mas fina, y por eso vive aca y no en la base: **un
// paciente no puede tener la misma droga VIGENTE dos veces**. Suspendida,
// cuantas veces haga falta.
//
// ESTO NO ES UNA RECETA
//
// No hay dosis, ni frecuencia, ni via de administracion, y no es que falten:
// estan afuera por decision de alcance (docs/CONTEXTO.md seccion 3). Con dosis
// el sistema pasaria a formar parte del acto medico. Lo que se registra es que
// el paciente esta tomando la droga, que es lo unico que el modulo de
// interacciones necesita saber.

/** Largo minimo del motivo de suspension. Un motivo de dos letras no es un motivo. */
const LARGO_MINIMO_MOTIVO = 4;

/** Una fila con el medicamento resuelto, que es como la piden las pantallas. */
export type MedicacionConMedicamento = MedicacionVigente & {
  medicamento: { id: string; nombre: string; rxcui: string | null };
};

const CON_MEDICAMENTO = {
  medicamento: { select: { id: true, nombre: true, rxcui: true } },
} as const;

/**
 * La medicacion que el paciente esta tomando hoy: las filas sin fecha de fin.
 *
 * Es la que alimenta la evaluacion de interacciones. Una droga suspendida no
 * entra: el paciente ya no la toma, y avisar por una interaccion que no puede
 * ocurrir es ruido que hace que se dejen de leer los avisos que si importan.
 */
export async function listarMedicacionVigente(
  pacienteId: string,
): Promise<MedicacionConMedicamento[]> {
  return db.medicacionVigente.findMany({
    where: { pacienteId, fechaFin: null },
    include: CON_MEDICAMENTO,
    orderBy: { fechaInicio: "asc" },
  });
}

/**
 * Toda la medicacion del paciente, vigente y no vigente. Es lo que necesita la
 * pantalla de la ficha (5.13): que una droga se haya suspendido, y por que, es
 * informacion clinica, no basura para esconder.
 */
export async function listarMedicacionDePaciente(
  pacienteId: string,
): Promise<MedicacionConMedicamento[]> {
  return db.medicacionVigente.findMany({
    where: { pacienteId },
    include: CON_MEDICAMENTO,
    orderBy: [{ fechaFin: "asc" }, { fechaInicio: "desc" }],
  });
}

export type AgregarMedicacionInput = {
  pacienteId: string;
  medicamentoId: string;
  /** Desde cuando la toma. No puede ser futura. */
  fechaInicio: Date;
};

export async function agregarMedicacion(
  data: AgregarMedicacionInput,
): Promise<MedicacionVigente> {
  const paciente = await db.paciente.findUnique({
    where: { id: data.pacienteId, activo: true },
  });
  if (!paciente) {
    throw new ErrorDeNegocio(
      "NO_ENCONTRADO",
      "El paciente no existe o esta dado de baja.",
      "pacienteId",
    );
  }

  const medicamento = await db.medicamento.findUnique({
    where: { id: data.medicamentoId, activo: true },
  });
  if (!medicamento) {
    throw new ErrorDeNegocio(
      "NO_ENCONTRADO",
      "El medicamento no existe o esta dado de baja.",
      "medicamentoId",
    );
  }

  // Mismo criterio que el alta de lote (4.01): una fecha futura casi siempre es
  // un error de tipeo, y aca ademas significaria que el paciente esta tomando
  // algo que todavia no empezo a tomar.
  if (data.fechaInicio.getTime() > Date.now()) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "La fecha de inicio no puede ser futura.",
      "fechaInicio",
    );
  }

  // La regla que reemplaza al @@unique que se saco del esquema.
  const yaVigente = await db.medicacionVigente.findFirst({
    where: {
      pacienteId: data.pacienteId,
      medicamentoId: data.medicamentoId,
      fechaFin: null,
    },
  });
  if (yaVigente) {
    throw new ErrorDeNegocio(
      "DUPLICADO",
      `El paciente ya tiene ${medicamento.nombre} en su medicacion vigente.`,
      "medicamentoId",
    );
  }

  return db.medicacionVigente.create({
    data: {
      pacienteId: data.pacienteId,
      medicamentoId: data.medicamentoId,
      fechaInicio: data.fechaInicio,
    },
  });
}

export type SuspenderMedicacionInput = {
  medicacionId: string;
  /** Obligatorio: es lo que distingue una suspension de una finalizacion. */
  motivo: string;
  /** Cuando dejo de tomarla. Por defecto, ahora. */
  fechaFin?: Date;
};

export async function suspenderMedicacion(
  data: SuspenderMedicacionInput,
): Promise<MedicacionVigente> {
  const medicacion = await db.medicacionVigente.findUnique({
    where: { id: data.medicacionId },
  });
  if (!medicacion) {
    throw new ErrorDeNegocio(
      "NO_ENCONTRADO",
      "No existe esa medicacion.",
      "medicacionId",
    );
  }

  if (medicacion.fechaFin !== null) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "Esa medicacion ya no esta vigente.",
    );
  }

  const motivo = data.motivo.trim();
  if (motivo.length < LARGO_MINIMO_MOTIVO) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      `El motivo de la suspension es obligatorio y tiene que tener al menos ${LARGO_MINIMO_MOTIVO} caracteres.`,
      "motivo",
    );
  }

  const fechaFin = data.fechaFin ?? new Date();

  if (fechaFin.getTime() < medicacion.fechaInicio.getTime()) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "La fecha de suspension no puede ser anterior a la de inicio.",
      "fechaFin",
    );
  }

  if (fechaFin.getTime() > Date.now()) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "La fecha de suspension no puede ser futura.",
      "fechaFin",
    );
  }

  // Se actualiza la fila en lugar de crear otra porque no es un hecho nuevo: es
  // el cierre del tramo que ya estaba abierto. El historial se conserva igual,
  // porque la fila no se borra ni se reutiliza para un reinicio posterior.
  return db.medicacionVigente.update({
    where: { id: data.medicacionId },
    data: { fechaFin, motivoSuspension: motivo },
  });
}
