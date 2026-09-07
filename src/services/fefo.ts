import { estaVencido } from "./stock";

// Motor FEFO — First Expired, First Out (tarea 4.07).
//
// Dado un conjunto de lotes y una cantidad, decide DE CUAL LOTE Y CUANTO sacar,
// empezando por el que vence antes.
//
// FEFO NO ES FIFO. Sale primero el que VENCE antes, no el que ENTRO antes. Es la
// diferencia que evita el desperdicio y es medio proyecto: la institucion perdia
// medicacion por vencimiento justamente porque no habia registro de que lote
// tenia que salir primero.
//
// POR QUE ES UNA FUNCION PURA
//
// No toca la base, no lee el reloj —la fecha entra por parametro— y no escribe
// nada. Recibe una lista y devuelve un plan.
//
// Eso no es elegancia: **el prototipo no lleva pruebas automatizadas**, asi que
// la verificacion de los casos borde se hace a mano, y una funcion pura se puede
// verificar con datos inventados sin levantar Docker ni sembrar la base. Quien
// toque este archivo tiene que volver a pasar los cinco casos que lista el
// roadmap y anotar el resultado en el PR.
//
// Quien EJECUTA el plan es otra cosa, y esta en dispensacion.ts (tarea 4.09).

/** Lo que el motor necesita saber de cada lote. Nada mas. */
export type LoteParaFefo = {
  loteId: string;
  numeroLote: string;
  fechaVencimiento: Date;
  disponible: number;
};

/** Una linea del plan: de este lote, esta cantidad. */
export type LineaDelPlan = {
  loteId: string;
  numeroLote: string;
  fechaVencimiento: Date;
  cantidad: number;
};

export type PlanDeEgreso = {
  lineas: LineaDelPlan[];
  cantidadPedida: number;
  /** Lo que el plan llega a cubrir. Igual a `cantidadPedida` si alcanza. */
  cantidadCubierta: number;
  /** Cuanto falta. Cero cuando el plan cubre todo lo pedido. */
  faltante: number;
};

/**
 * Ordena los lotes como los quiere FEFO.
 *
 * El desempate NO es un detalle: si dos lotes vencen el mismo dia y el orden
 * dependiera del que devuelva la base, el mismo pedido podria producir dos
 * planes distintos en dos corridas. Con el numero de lote como segundo criterio
 * —y el id como tercero, por si el numero se repitiera entre medicamentos— el
 * plan es siempre el mismo para los mismos datos.
 */
function ordenarPorVencimiento(a: LoteParaFefo, b: LoteParaFefo): number {
  const porFecha = a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime();
  if (porFecha !== 0) return porFecha;

  const porNumero = a.numeroLote.localeCompare(b.numeroLote);
  if (porNumero !== 0) return porNumero;

  return a.loteId.localeCompare(b.loteId);
}

/**
 * Arma el plan de egreso para una cantidad, priorizando el vencimiento mas
 * proximo.
 *
 * QUE EXCLUYE, Y POR QUE:
 *
 * - **Lotes vencidos.** No se pueden dispensar. Incluirlos daria un plan que
 *   parece resolver el pedido y no se puede ejecutar.
 * - **Lotes con disponible cero o negativo.** No aportan nada; un negativo seria
 *   ademas un sintoma de que algo mas ya esta mal.
 *
 * SI NO ALCANZA no lanza error: devuelve el plan de lo que si se puede cubrir y
 * el `faltante`. Quien decide si eso es un error es la capa de arriba —la tarea
 * 4.08—, y la pantalla necesita justamente ese numero para avisar cuanto hay.
 */
export function planificarEgresoFefo(
  lotes: LoteParaFefo[],
  cantidadPedida: number,
  referencia: Date = new Date(),
): PlanDeEgreso {
  // Una cantidad que no es un entero positivo es un error de quien llama, no una
  // situacion del dominio, asi que se corta con RangeError y no con
  // ErrorDeNegocio. Quien valida la entrada de una persona es la capa de arriba
  // (dispensacion.ts), que nunca deja llegar hasta aca un valor asi.
  //
  // La primera version devolvia un plan vacio con faltante 0, y eso hacia que
  // pedir -5 unidades diera "alcanza: true". Un plan invalido que se declara
  // exitoso es peor que un error: se propaga en silencio.
  if (!Number.isInteger(cantidadPedida) || cantidadPedida <= 0) {
    throw new RangeError(
      `La cantidad a dispensar tiene que ser un entero positivo, se recibio ${cantidadPedida}.`,
    );
  }

  const elegibles = lotes
    .filter((l) => l.disponible > 0)
    .filter((l) => !estaVencido(l.fechaVencimiento, referencia))
    .sort(ordenarPorVencimiento);

  const lineas: LineaDelPlan[] = [];
  let porCubrir = cantidadPedida;

  for (const lote of elegibles) {
    if (porCubrir === 0) break;

    // Del lote se saca lo que falte, o todo lo que tenga si no alcanza. Asi el
    // reparto entre varios lotes cae solo: el primero se vacia y el que sigue
    // aporta el resto.
    const cantidad = Math.min(lote.disponible, porCubrir);

    lineas.push({
      loteId: lote.loteId,
      numeroLote: lote.numeroLote,
      fechaVencimiento: lote.fechaVencimiento,
      cantidad,
    });

    porCubrir -= cantidad;
  }

  return {
    lineas,
    cantidadPedida,
    cantidadCubierta: cantidadPedida - porCubrir,
    faltante: porCubrir,
  };
}

/** Si el plan cubre todo lo que se pidio. */
export function planAlcanza(plan: PlanDeEgreso): boolean {
  return plan.faltante === 0;
}
