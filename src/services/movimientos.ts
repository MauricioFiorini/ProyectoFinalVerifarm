import { db } from "../lib/db";
import { MovimientoStock, TipoMovimiento } from "@prisma/client";
import { ErrorDeNegocio } from "./errores";
import { calcularDisponible } from "./stock";
import { USUARIO_PROVISORIO_ID } from "../lib/usuariosSemilla";

// Registro de movimientos de stock (tarea 4.04).
//
// EL HISTORIAL ES UN LIBRO MAYOR
//
// Un movimiento se agrega, no se edita ni se borra. No hay ni va a haber una
// funcion de actualizar o eliminar en este archivo: el saldo se corrige con un
// movimiento nuevo, no reescribiendo el anterior. Ver docs/CONVENCIONES.md
// seccion 7.
//
// POR QUE HACE FALTA UNA TRANSACCION SI SE INSERTA UNA SOLA FILA
//
// Porque no es solo insertar. Un egreso primero LEE lo disponible y despues
// ESCRIBE, y entre esas dos cosas otro egreso podria colarse: los dos leerian
// que hay 100, los dos escribirian 60, y el lote quedaria en -20 sin que ninguna
// de las dos operaciones haya hecho nada mal por su cuenta.
//
// Se usa nivel de aislamiento SERIALIZABLE, que es lo que hace que PostgreSQL
// detecte ese cruce y aborte una de las dos en vez de dejar pasar el negativo.
// El costo es que, si eso llegara a pasar, la operacion falla y hay que
// reintentarla. En un prototipo de un solo usuario no va a pasar; se hace igual
// porque el invariante "un egreso nunca deja el lote en negativo" es del dominio
// y no de la cantidad de usuarios.

export type RegistrarMovimientoInput = {
  loteId: string;
  cantidad: number;
  /**
   * Quien registra el movimiento.
   *
   * PROVISORIO: mientras no haya autenticacion se usa el usuario fijo del seed.
   * Ver docs/decisiones/0009-usuario-fijo-para-los-movimientos.md
   */
  usuarioId?: string;
};

function validarCantidad(cantidad: number): void {
  if (!Number.isInteger(cantidad)) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "La cantidad tiene que ser un numero entero.",
      "cantidad",
    );
  }

  if (cantidad <= 0) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      "La cantidad tiene que ser mayor que cero.",
      "cantidad",
    );
  }
}

/**
 * Registra el ingreso de una cantidad a un lote.
 *
 * Es lo que le da unidades a un lote: `crearLote` (4.01) lo deja en cero, porque
 * la cantidad no es un campo del lote sino la suma de sus movimientos.
 */
export async function registrarIngreso(
  data: RegistrarMovimientoInput,
): Promise<MovimientoStock> {
  validarCantidad(data.cantidad);

  const lote = await db.lote.findUnique({ where: { id: data.loteId } });

  if (!lote) {
    throw new ErrorDeNegocio(
      "NO_ENCONTRADO",
      "El lote indicado no existe.",
      "loteId",
    );
  }

  return db.movimientoStock.create({
    data: {
      loteId: data.loteId,
      tipo: TipoMovimiento.INGRESO,
      cantidad: data.cantidad,
      usuarioId: data.usuarioId ?? USUARIO_PROVISORIO_ID,
    },
  });
}

/**
 * Registra el egreso de una cantidad de un lote.
 *
 * **Nunca deja el lote en negativo.** La lectura de lo disponible y la escritura
 * del movimiento ocurren dentro de la misma transaccion serializable, asi que no
 * hay ventana entre "hay 100" y "saco 60".
 *
 * El mensaje del error trae el disponible real, que es lo que la pantalla de la
 * tarea 4.15 tiene que mostrar.
 */
export async function registrarEgreso(
  data: RegistrarMovimientoInput,
): Promise<MovimientoStock> {
  validarCantidad(data.cantidad);

  return db.$transaction(
    async (tx) => {
      const lote = await tx.lote.findUnique({
        where: { id: data.loteId },
        select: {
          id: true,
          movimientos: { select: { tipo: true, cantidad: true } },
        },
      });

      if (!lote) {
        throw new ErrorDeNegocio(
          "NO_ENCONTRADO",
          "El lote indicado no existe.",
          "loteId",
        );
      }

      const disponible = calcularDisponible(lote.movimientos);

      if (data.cantidad > disponible) {
        throw new ErrorDeNegocio(
          "REGLA_DE_NEGOCIO",
          `No hay existencia suficiente en el lote: se pidieron ${data.cantidad} y hay ${disponible}.`,
          "cantidad",
        );
      }

      return tx.movimientoStock.create({
        data: {
          loteId: data.loteId,
          tipo: TipoMovimiento.EGRESO,
          cantidad: data.cantidad,
          usuarioId: data.usuarioId ?? USUARIO_PROVISORIO_ID,
        },
      });
    },
    { isolationLevel: "Serializable" },
  );
}
