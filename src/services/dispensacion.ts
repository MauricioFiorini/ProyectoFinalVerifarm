import { db } from "../lib/db";
import { Prisma, TipoMovimiento } from "@prisma/client";
import { ErrorDeNegocio } from "./errores";
import { calcularDisponible } from "./stock";
import {
  planificarEgresoFefo,
  planAlcanza,
  type LoteParaFefo,
  type PlanDeEgreso,
} from "./fefo";
import { USUARIO_PROVISORIO_ID } from "../lib/usuariosSemilla";

// Dispensacion: previsualizar y ejecutar (tareas 4.08 y 4.09).
//
// Es la capa que conecta el motor FEFO —que es puro y no toca nada— con la base.
// El reparto entre varios lotes lo resuelve el motor; lo que se agrega aca es
// **el error explicito cuando la existencia no alcanza** y **la ejecucion del
// plan en una unica transaccion**.

/** Lo mismo que devuelve el motor, mas el nombre del medicamento. */
export type PlanDeDispensacion = PlanDeEgreso & {
  medicamentoId: string;
  nombreMedicamento: string;
};

/**
 * Trae los lotes de un medicamento con su disponible ya calculado, en la forma
 * que espera el motor.
 *
 * Recibe el cliente por parametro para poder usarse tanto suelta como dentro de
 * una transaccion. Es lo que permite que `dispensar` vuelva a planificar con los
 * datos que ve la transaccion, y no con los que se leyeron antes.
 */
async function obtenerLotesParaFefo(
  cliente: Prisma.TransactionClient,
  medicamentoId: string,
): Promise<LoteParaFefo[]> {
  const lotes = await cliente.lote.findMany({
    where: { medicamentoId },
    select: {
      id: true,
      numeroLote: true,
      fechaVencimiento: true,
      movimientos: { select: { tipo: true, cantidad: true } },
    },
  });

  return lotes.map((l) => ({
    loteId: l.id,
    numeroLote: l.numeroLote,
    fechaVencimiento: l.fechaVencimiento,
    disponible: calcularDisponible(l.movimientos),
  }));
}

function validarCantidad(cantidad: number): void {
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "La cantidad a dispensar tiene que ser un numero entero mayor que cero.",
      "cantidad",
    );
  }
}

/**
 * Convierte "no alcanza" en un error con el numero adentro (tarea 4.08).
 *
 * El mensaje dice cuanto hay, no solo que falta: es lo que la pantalla de la
 * tarea 4.15 tiene que mostrar para que la persona sepa si le sirve dispensar
 * menos.
 */
function fallarSiNoAlcanza(plan: PlanDeEgreso, nombre: string): void {
  if (planAlcanza(plan)) return;

  throw new ErrorDeNegocio(
    "REGLA_DE_NEGOCIO",
    `No hay existencia suficiente de ${nombre}: se pidieron ${plan.cantidadPedida} y hay ${plan.cantidadCubierta} disponibles en lotes vigentes.`,
    "cantidad",
  );
}

/**
 * Previsualiza una dispensacion **sin ejecutarla** (tarea 4.08).
 *
 * Devuelve el plan que muestra el modal de la 4.14: de que lote sale cuanto y
 * con que vencimiento. No escribe nada.
 */
export async function previsualizarDispensacion(
  medicamentoId: string,
  cantidad: number,
  referencia: Date = new Date(),
): Promise<PlanDeDispensacion> {
  validarCantidad(cantidad);

  const medicamento = await db.medicamento.findUnique({
    where: { id: medicamentoId },
    select: { id: true, nombre: true },
  });

  if (!medicamento) {
    throw new ErrorDeNegocio(
      "NO_ENCONTRADO",
      "El medicamento indicado no existe.",
      "medicamentoId",
    );
  }

  const lotes = await obtenerLotesParaFefo(db, medicamentoId);
  const plan = planificarEgresoFefo(lotes, cantidad, referencia);

  fallarSiNoAlcanza(plan, medicamento.nombre);

  return {
    ...plan,
    medicamentoId: medicamento.id,
    nombreMedicamento: medicamento.nombre,
  };
}

/**
 * Ejecuta la dispensacion (tarea 4.09).
 *
 * **O entran todos los movimientos o ninguno.** Un egreso repartido entre tres
 * lotes son tres inserciones; si la tercera fallara y las dos primeras quedaran,
 * el stock diria que salio medicacion que nunca salio.
 *
 * SE VUELVE A PLANIFICAR ADENTRO DE LA TRANSACCION, a proposito. El plan que vio
 * la persona en la previsualizacion se calculo antes, y entre ese momento y el
 * "Confirmar" pudo entrar otro egreso. Reusar aquel plan seria escribir sobre
 * una foto vieja. Se replanifica con lo que ve la transaccion y, si en el medio
 * dejo de alcanzar, falla con el mismo error explicito.
 *
 * El nivel SERIALIZABLE es lo que hace que dos dispensaciones simultaneas no
 * puedan leer el mismo disponible y escribir las dos.
 */
export async function dispensar(
  medicamentoId: string,
  cantidad: number,
  usuarioId: string = USUARIO_PROVISORIO_ID,
  referencia: Date = new Date(),
): Promise<PlanDeDispensacion> {
  validarCantidad(cantidad);

  return db.$transaction(
    async (tx) => {
      const medicamento = await tx.medicamento.findUnique({
        where: { id: medicamentoId },
        select: { id: true, nombre: true },
      });

      if (!medicamento) {
        throw new ErrorDeNegocio(
          "NO_ENCONTRADO",
          "El medicamento indicado no existe.",
          "medicamentoId",
        );
      }

      const lotes = await obtenerLotesParaFefo(tx, medicamentoId);
      const plan = planificarEgresoFefo(lotes, cantidad, referencia);

      fallarSiNoAlcanza(plan, medicamento.nombre);

      await tx.movimientoStock.createMany({
        data: plan.lineas.map((linea) => ({
          loteId: linea.loteId,
          tipo: TipoMovimiento.EGRESO,
          cantidad: linea.cantidad,
          usuarioId,
        })),
      });

      return {
        ...plan,
        medicamentoId: medicamento.id,
        nombreMedicamento: medicamento.nombre,
      };
    },
    { isolationLevel: "Serializable" },
  );
}
