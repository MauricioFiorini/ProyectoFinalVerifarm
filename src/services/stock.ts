import { db } from "../lib/db";
import { TipoMovimiento, type UnidadMedida } from "@prisma/client";

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

// --- Consultas de alerta (tareas 4.05 y 4.06) -------------------------------

export type MedicamentoBajoMinimo = {
  id: string;
  nombre: string;
  unidad: UnidadMedida;
  stockMinimo: number;
  disponible: number;
};

/**
 * Medicamentos cuyo stock disponible quedo POR DEBAJO de su minimo (4.05).
 *
 * Se compara con `<`, no con `<=`: estar justo en el minimo todavia no es estar
 * bajo el minimo.
 *
 * Un medicamento con `stockMinimo` en 0 nunca aparece, que es lo correcto: no
 * fijar un minimo es decir que no hace falta avisar.
 *
 * Ordenado por faltante, de mayor a menor: lo que hay que reponer primero
 * aparece arriba, sin que la pantalla tenga que ordenarlo.
 */
export async function obtenerStockBajo(
  referencia: Date = new Date(),
): Promise<MedicamentoBajoMinimo[]> {
  const medicamentos = await db.medicamento.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true,
      unidad: true,
      stockMinimo: true,
      lotes: {
        select: {
          fechaVencimiento: true,
          movimientos: { select: { tipo: true, cantidad: true } },
        },
      },
    },
  });

  return medicamentos
    .map((m) => ({
      id: m.id,
      nombre: m.nombre,
      unidad: m.unidad,
      stockMinimo: m.stockMinimo,
      disponible: calcularStockDeMedicamento(m.lotes, referencia),
    }))
    .filter((m) => m.disponible < m.stockMinimo)
    .sort(
      (a, b) =>
        b.stockMinimo - b.disponible - (a.stockMinimo - a.disponible) ||
        a.nombre.localeCompare(b.nombre),
    );
}

/** Dias por defecto para considerar que un lote esta por vencer. */
export const DIAS_PARA_VENCIMIENTO_PROXIMO = 30;

export type LotePorVencer = {
  loteId: string;
  numeroLote: string;
  fechaVencimiento: Date;
  diasParaVencer: number;
  disponible: number;
  medicamentoId: string;
  nombreMedicamento: string;
  unidad: UnidadMedida;
};

/**
 * Lotes con disponible mayor a cero que vencen dentro de `dias` (4.06).
 *
 * OJO CON LO QUE **NO** DEVUELVE: los lotes YA VENCIDOS quedan afuera. La tarea
 * pide "los que vencen dentro de N dias", que mira hacia adelante. Un lote
 * vencido con unidades encima no aparece en esta consulta; se ve en la pantalla
 * de lotes de la tarea 4.17, que lo marca como vencido. Si el equipo decide que
 * tambien tienen que estar en la alerta, es un cambio de criterio y va escrito.
 *
 * Ordenado por vencimiento mas proximo primero, que es el orden en el que hay
 * que ocuparse de ellos y el mismo que usa FEFO.
 */
export async function obtenerVencimientosProximos(
  dias: number = DIAS_PARA_VENCIMIENTO_PROXIMO,
  referencia: Date = new Date(),
): Promise<LotePorVencer[]> {
  const limite = new Date(referencia);
  limite.setHours(23, 59, 59, 999);
  limite.setDate(limite.getDate() + dias);

  const lotes = await db.lote.findMany({
    where: { fechaVencimiento: { lte: limite } },
    select: {
      id: true,
      numeroLote: true,
      fechaVencimiento: true,
      medicamentoId: true,
      medicamento: { select: { nombre: true, unidad: true } },
      movimientos: { select: { tipo: true, cantidad: true } },
    },
    orderBy: { fechaVencimiento: "asc" },
  });

  const inicioDeHoy = new Date(referencia);
  inicioDeHoy.setHours(0, 0, 0, 0);
  const UN_DIA = 1000 * 60 * 60 * 24;

  return lotes
    .filter((l) => !estaVencido(l.fechaVencimiento, referencia))
    .map((l) => ({
      loteId: l.id,
      numeroLote: l.numeroLote,
      fechaVencimiento: l.fechaVencimiento,
      diasParaVencer: Math.round(
        (l.fechaVencimiento.getTime() - inicioDeHoy.getTime()) / UN_DIA,
      ),
      disponible: calcularDisponible(l.movimientos),
      medicamentoId: l.medicamentoId,
      nombreMedicamento: l.medicamento.nombre,
      unidad: l.medicamento.unidad,
    }))
    .filter((l) => l.disponible > 0);
}

// --- Estado de stock por medicamento (tarea 4.11) ---------------------------

/**
 * Como esta un medicamento, para el indicador de la pantalla de stock.
 *
 * Son EXCLUYENTES y tienen prioridad: un medicamento puede estar bajo minimo Y
 * tener un lote por vencer al mismo tiempo, y hay que mostrar uno solo.
 */
export type EstadoDeStock =
  /** Por debajo del minimo. Hay que reponer. */
  | "BAJO_MINIMO"
  /** Alcanza, pero hay medicacion que se va a vencer. Hay que usarla. */
  | "POR_VENCER"
  /** Nada que hacer. */
  | "NORMAL";

/**
 * Decide el estado. FUNCION PURA.
 *
 * **Bajo minimo gana sobre por vencer.** Los dos piden accion, pero no la misma:
 * quedarse sin medicacion es peor que desperdiciarla, y ademas el que esta bajo
 * minimo tiene que aparecer arriba en la lista de lo que hay que comprar.
 */
export function calcularEstadoDeStock(
  disponible: number,
  stockMinimo: number,
  tieneLotePorVencer: boolean,
): EstadoDeStock {
  if (disponible < stockMinimo) return "BAJO_MINIMO";
  if (tieneLotePorVencer) return "POR_VENCER";
  return "NORMAL";
}

export type StockDeMedicamento = {
  id: string;
  nombre: string;
  unidad: UnidadMedida;
  stockMinimo: number;
  disponible: number;
  estado: EstadoDeStock;
  /** Cuantos lotes vigentes con unidades vencen dentro del plazo. */
  lotesPorVencer: number;
};

/**
 * Estado de stock de todos los medicamentos activos (tarea 4.11).
 *
 * Una sola consulta trae medicamentos, lotes y movimientos; el resto es
 * aritmetica en memoria. Con el volumen de un prototipo alcanza y sobra, y evita
 * una consulta por medicamento.
 */
export async function listarEstadoDeStock(
  dias: number = DIAS_PARA_VENCIMIENTO_PROXIMO,
  referencia: Date = new Date(),
): Promise<StockDeMedicamento[]> {
  const limite = new Date(referencia);
  limite.setHours(23, 59, 59, 999);
  limite.setDate(limite.getDate() + dias);

  const medicamentos = await db.medicamento.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      unidad: true,
      stockMinimo: true,
      lotes: {
        select: {
          fechaVencimiento: true,
          movimientos: { select: { tipo: true, cantidad: true } },
        },
      },
    },
  });

  return medicamentos.map((m) => {
    const vigentes = m.lotes.filter(
      (l) => !estaVencido(l.fechaVencimiento, referencia),
    );

    const disponible = vigentes.reduce(
      (total, l) => total + calcularDisponible(l.movimientos),
      0,
    );

    const lotesPorVencer = vigentes.filter(
      (l) =>
        l.fechaVencimiento <= limite && calcularDisponible(l.movimientos) > 0,
    ).length;

    return {
      id: m.id,
      nombre: m.nombre,
      unidad: m.unidad,
      stockMinimo: m.stockMinimo,
      disponible,
      estado: calcularEstadoDeStock(
        disponible,
        m.stockMinimo,
        lotesPorVencer > 0,
      ),
      lotesPorVencer,
    };
  });
}

// --- Estado de vencimiento de un lote (tarea 4.17) --------------------------

/**
 * Como esta un lote respecto de su vencimiento.
 *
 * **`VENCIDO` es lo que hace visible al lote que la alerta de la 4.06 no
 * devuelve.** Esa consulta mira hacia adelante —lo que esta por vencer— y el
 * lote ya vencido con unidades encima se ve aca, en el listado.
 */
export type EstadoDeVencimiento = "VENCIDO" | "POR_VENCER" | "VIGENTE";

/**
 * Decide el estado de vencimiento de un lote. FUNCION PURA.
 *
 * La fecha de referencia entra por parametro para poder verificarla en
 * cualquier fecha sin tocar el reloj de la maquina.
 */
export function calcularEstadoDeVencimiento(
  fechaVencimiento: Date,
  dias: number = DIAS_PARA_VENCIMIENTO_PROXIMO,
  referencia: Date = new Date(),
): EstadoDeVencimiento {
  if (estaVencido(fechaVencimiento, referencia)) return "VENCIDO";

  const limite = new Date(referencia);
  limite.setHours(23, 59, 59, 999);
  limite.setDate(limite.getDate() + dias);

  return fechaVencimiento <= limite ? "POR_VENCER" : "VIGENTE";
}

/**
 * Cuantos dias faltan para el vencimiento. Negativo si ya vencio.
 *
 * Se cuenta contra el comienzo del dia, no contra el instante actual: un
 * vencimiento es una fecha, no una hora.
 */
export function diasHastaVencimiento(
  fechaVencimiento: Date,
  referencia: Date = new Date(),
): number {
  const inicioDeHoy = new Date(referencia);
  inicioDeHoy.setHours(0, 0, 0, 0);
  const UN_DIA = 1000 * 60 * 60 * 24;
  return Math.round(
    (fechaVencimiento.getTime() - inicioDeHoy.getTime()) / UN_DIA,
  );
}
