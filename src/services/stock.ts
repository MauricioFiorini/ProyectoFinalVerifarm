import { db } from "../lib/db";
import { TipoMovimiento } from "@prisma/client";

// Calculo de existencias (tarea 4.02).
//
// EL INVARIANTE QUE SOSTIENE ESTE ARCHIVO
//
// Los saldos NO se persisten, se calculan: la cantidad disponible de un lote es
// lo que ingreso menos lo que egreso. No hay ni tiene que haber una columna de
// saldo en Lote. Ver docs/CONVENCIONES.md seccion 7.
//
// Persistir el saldo seria duplicar la verdad: el historial de movimientos ya lo
// dice, y dos numeros que dicen lo mismo terminan diciendo cosas distintas.
//
// POR QUE EL CALCULO ES UNA FUNCION PURA
//
// `calcularDisponible` no toca la base: recibe los movimientos y devuelve un
// numero. Eso permite verificarlo a mano con datos inventados, sin levantar
// Docker ni sembrar nada. El prototipo no lleva pruebas automatizadas, asi que
// esa verificacion manual es la unica red que hay. Es el mismo criterio con el
// que se separa el motor FEFO en la tarea 4.07.

/** Lo minimo que el calculo necesita saber de un movimiento. */
export type MovimientoParaCalculo = {
  tipo: TipoMovimiento;
  cantidad: number;
};

/**
 * Cantidad disponible a partir de una lista de movimientos.
 *
 * FUNCION PURA: no consulta la base ni depende de la fecha. Ingresos suman,
 * egresos restan.
 *
 * Un lote sin movimientos da 0, que es lo correcto: existe el lote pero todavia
 * no entro nada.
 */
export function calcularDisponible(
  movimientos: MovimientoParaCalculo[],
): number {
  return movimientos.reduce((total, m) => {
    return m.tipo === TipoMovimiento.INGRESO
      ? total + m.cantidad
      : total - m.cantidad;
  }, 0);
}

/**
 * Cantidad disponible de un lote, leyendo sus movimientos de la base.
 *
 * Es la capa fina que envuelve al calculo puro: busca y delega. Toda la
 * aritmetica esta en `calcularDisponible`.
 */
export async function obtenerDisponibleDeLote(loteId: string): Promise<number> {
  const movimientos = await db.movimientoStock.findMany({
    where: { loteId },
    select: { tipo: true, cantidad: true },
  });

  return calcularDisponible(movimientos);
}

/**
 * Disponible de varios lotes en una sola consulta.
 *
 * Existe para no caer en el problema N+1: la pantalla de lotes de un medicamento
 * (tarea 4.12) muestra todos sus lotes con su disponible, y pedirlos de a uno
 * seria una consulta por fila.
 *
 * Devuelve un Map de loteId a disponible. Los lotes sin movimientos no vuelven
 * de la consulta, asi que se completan en 0.
 */
export async function obtenerDisponiblePorLote(
  loteIds: string[],
): Promise<Map<string, number>> {
  const disponibles = new Map<string, number>(loteIds.map((id) => [id, 0]));

  if (loteIds.length === 0) return disponibles;

  const movimientos = await db.movimientoStock.findMany({
    where: { loteId: { in: loteIds } },
    select: { loteId: true, tipo: true, cantidad: true },
  });

  const porLote = new Map<string, MovimientoParaCalculo[]>();
  for (const m of movimientos) {
    const lista = porLote.get(m.loteId) ?? [];
    lista.push({ tipo: m.tipo, cantidad: m.cantidad });
    porLote.set(m.loteId, lista);
  }

  for (const [loteId, lista] of porLote) {
    disponibles.set(loteId, calcularDisponible(lista));
  }

  return disponibles;
}

// --- Stock por medicamento (tarea 4.03) -------------------------------------

/** Lo que el calculo por medicamento necesita saber de cada lote. */
export type LoteParaCalculo = {
  fechaVencimiento: Date;
  movimientos: MovimientoParaCalculo[];
};

/**
 * Si un lote esta vencido a una fecha dada.
 *
 * FUNCION PURA, y la fecha entra por parametro en vez de leerse de `new Date()`
 * adentro: asi se puede verificar el comportamiento en cualquier fecha sin tocar
 * el reloj de la maquina.
 *
 * CRITERIO: un lote que vence HOY todavia sirve. Se compara contra el comienzo
 * del dia, no contra el instante actual, porque el vencimiento es una fecha y no
 * una hora: si no, un lote pasaria a estar vencido a mitad de la mañana.
 */
export function estaVencido(
  fechaVencimiento: Date,
  referencia: Date = new Date(),
): boolean {
  const inicioDelDia = new Date(referencia);
  inicioDelDia.setHours(0, 0, 0, 0);
  return fechaVencimiento < inicioDelDia;
}

/**
 * Stock disponible de un medicamento: la suma de lo disponible en sus lotes NO
 * VENCIDOS.
 *
 * FUNCION PURA.
 *
 * Los lotes vencidos se excluyen a proposito, aunque tengan unidades fisicas
 * encima: no se pueden dispensar, asi que contarlos daria un numero que dice que
 * hay medicacion cuando no la hay para usar. Es el mismo criterio con el que el
 * motor FEFO (4.07) los descarta.
 */
export function calcularStockDeMedicamento(
  lotes: LoteParaCalculo[],
  referencia: Date = new Date(),
): number {
  return lotes
    .filter((l) => !estaVencido(l.fechaVencimiento, referencia))
    .reduce((total, l) => total + calcularDisponible(l.movimientos), 0);
}

/**
 * Stock disponible de un medicamento, leyendo de la base.
 *
 * Trae los lotes con sus movimientos en una sola consulta y delega el calculo en
 * la funcion pura.
 */
export async function obtenerStockDeMedicamento(
  medicamentoId: string,
  referencia: Date = new Date(),
): Promise<number> {
  const lotes = await db.lote.findMany({
    where: { medicamentoId },
    select: {
      fechaVencimiento: true,
      movimientos: { select: { tipo: true, cantidad: true } },
    },
  });

  return calcularStockDeMedicamento(lotes, referencia);
}
