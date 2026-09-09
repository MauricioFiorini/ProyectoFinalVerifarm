import { db } from "../lib/db";
import { Lote, TipoMovimiento } from "@prisma/client";
import { ErrorDeNegocio } from "./errores";
import { USUARIO_PROVISORIO_ID } from "../lib/usuariosSemilla";
import { finDelDiaUtc } from "../lib/fechas";

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
  //
  // EN UTC (tarea 4.18). Con el fin del dia LOCAL, que en UTC-3 cae a las 02:59
  // UTC del dia siguiente, la medianoche UTC de MAÑANA quedaba por debajo del
  // limite y una fecha de ingreso futura pasaba la validacion.
  const finDeHoy = finDelDiaUtc();

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

// --- Alta de lote con su ingreso inicial (tarea 4.13) -----------------------

/**
 * Reglas de un lote que no necesitan la base. Se separan para que las use tanto
 * `crearLote` como el alta con ingreso, sin duplicarlas.
 */
function validarDatosDeLote(data: CrearLoteInput): string {
  const numeroLote = data.numeroLote.trim();

  if (numeroLote === "") {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "El numero de lote no puede estar vacio.",
      "numeroLote",
    );
  }

  // En UTC, por lo mismo que en `crearLote`. Ver la tarea 4.18.
  const finDeHoy = finDelDiaUtc();

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

  return numeroLote;
}

/**
 * Da de alta un lote **y registra su ingreso inicial, en una sola transaccion**.
 *
 * POR QUE NO SON DOS LLAMADAS
 *
 * Son dos escrituras: la fila del lote y el movimiento de INGRESO. Si la segunda
 * fallara quedaria un lote en cero, que parece existir y no tiene nada: alguien
 * lo veria en la pantalla y no entenderia por que no se puede dispensar. O entran
 * las dos o ninguna. Es la regla de docs/CONVENCIONES.md seccion 9.
 *
 * La cantidad NO se guarda en el lote: se guarda como movimiento, y el
 * disponible se calcula sumando. Ver docs/decisiones/0007.
 */
export async function crearLoteConIngreso(
  data: CrearLoteInput,
  cantidad: number,
  usuarioId: string = USUARIO_PROVISORIO_ID,
): Promise<Lote> {
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "La cantidad tiene que ser un numero entero mayor que cero.",
      "cantidad",
    );
  }

  const numeroLote = validarDatosDeLote(data);

  return db.$transaction(async (tx) => {
    const medicamento = await tx.medicamento.findUnique({
      where: { id: data.medicamentoId },
      select: { id: true },
    });

    if (!medicamento) {
      throw new ErrorDeNegocio(
        "NO_ENCONTRADO",
        "El medicamento indicado no existe.",
        "medicamentoId",
      );
    }

    const existente = await tx.lote.findUnique({
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

    const lote = await tx.lote.create({
      data: {
        medicamentoId: data.medicamentoId,
        numeroLote,
        fechaIngreso: data.fechaIngreso,
        fechaVencimiento: data.fechaVencimiento,
      },
    });

    await tx.movimientoStock.create({
      data: {
        loteId: lote.id,
        tipo: TipoMovimiento.INGRESO,
        cantidad,
        usuarioId,
      },
    });

    return lote;
  });
}
