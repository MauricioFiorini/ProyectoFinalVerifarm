import { db } from "../lib/db";
import { Lote } from "@prisma/client";
import { ErrorDeNegocio } from "./errores";

// Alta y consulta de lotes (tarea 4.01).
//
// LO QUE NO ESTA ACA, A PROPOSITO
//
// Un lote NO tiene cantidad. La cantidad que entro se registra como
// MovimientoStock de tipo INGRESO y se deriva sumando, igual que el saldo.
// Persistirla seria una segunda fuente de verdad para un dato que ya esta
// registrado. Ver docs/decisiones/0007-lote-lleva-fecha-de-ingreso.md
//
// Por eso `crearLote` deja el lote en cero: el movimiento de ingreso lo registra
// el servicio de movimientos (tarea 4.04), y la pantalla de alta (4.13) hace las
// dos cosas en una transaccion.

export type CrearLoteInput = {
  medicamentoId: string;
  /** Identificador alfanumerico que trae el fabricante. */
  numeroLote: string;
  /** Cuando entro la medicacion a farmacia. No es cuando se cargo al sistema. */
  fechaIngreso: Date;
  fechaVencimiento: Date;
};

/**
 * Da de alta un lote.
 *
 * Reglas que aplica, todas del dominio:
 *
 * 1. El medicamento tiene que existir.
 * 2. `fechaIngreso` no puede ser futura: no se registra medicacion que todavia
 *    no llego.
 * 3. `fechaVencimiento` tiene que ser posterior a `fechaIngreso`. Validarla solo
 *    contra hoy no alcanza: un lote cargado con vencimiento anterior a su propio
 *    ingreso es un error de carga, y sin esta regla entra.
 * 4. El numero de lote es unico POR MEDICAMENTO. Dos medicamentos distintos
 *    pueden compartir numero, porque el numero lo pone el fabricante.
 */
export async function crearLote(data: CrearLoteInput): Promise<Lote> {
  const medicamento = await db.medicamento.findUnique({
    where: { id: data.medicamentoId },
  });

  if (!medicamento) {
    throw new ErrorDeNegocio(
      "NO_ENCONTRADO",
      "El medicamento indicado no existe.",
      "medicamentoId",
    );
  }

  const numeroLote = data.numeroLote.trim();

  if (numeroLote === "") {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "El numero de lote no puede estar vacio.",
      "numeroLote",
    );
  }

  // Se compara contra el final del dia de hoy: un lote que entro esta manana es
  // valido, y la hora que traiga la fecha no tiene que decidir nada.
  const finDeHoy = new Date();
  finDeHoy.setHours(23, 59, 59, 999);

  if (data.fechaIngreso > finDeHoy) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "La fecha de ingreso no puede ser futura.",
      "fechaIngreso",
    );
  }

  if (data.fechaVencimiento <= data.fechaIngreso) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "El vencimiento tiene que ser posterior a la fecha de ingreso.",
      "fechaVencimiento",
    );
  }

  const existente = await db.lote.findUnique({
    where: {
      medicamentoId_numeroLote: {
        medicamentoId: data.medicamentoId,
        numeroLote,
      },
    },
  });

  if (existente) {
    throw new ErrorDeNegocio(
      "DUPLICADO",
      `Ya existe un lote "${numeroLote}" para ese medicamento.`,
      "numeroLote",
    );
  }

  return db.lote.create({
    data: {
      medicamentoId: data.medicamentoId,
      numeroLote,
      fechaIngreso: data.fechaIngreso,
      fechaVencimiento: data.fechaVencimiento,
    },
  });
}

/**
 * Lotes de un medicamento, ordenados por vencimiento mas proximo primero.
 *
 * El orden no es decorativo: es el que necesita FEFO (tarea 4.07), que dispensa
 * primero lo que vence antes.
 */
export async function listarLotesDeMedicamento(
  medicamentoId: string,
): Promise<Lote[]> {
  return db.lote.findMany({
    where: { medicamentoId },
    orderBy: { fechaVencimiento: "asc" },
  });
}
