import { z } from "zod";

// Validacion de entrada para Lote y MovimientoStock (tarea 4.10).
//
// Igual que en medicamento.ts: aca se contesta "¿esto tiene la forma correcta?".
// Las reglas del dominio —que el vencimiento sea posterior al ingreso, que un
// egreso no deje el lote en negativo— viven en src/services/ y NO se repiten
// aca. Ver docs/ARQUITECTURA.md seccion 4.

/**
 * Fecha que llega por JSON.
 *
 * El navegador manda "2026-09-07" desde un <input type="date"> y una cadena ISO
 * completa desde JavaScript. `coerce` acepta las dos y devuelve un Date; el
 * refinamiento descarta lo que no se pueda interpretar, porque `new Date("hola")`
 * no falla: devuelve un Date invalido que rompe mas adelante y lejos.
 */
const fecha = z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), {
  message: "La fecha no es valida.",
});

const identificador = z.string().trim().min(1);

export const esquemaCrearLote = z.object({
  medicamentoId: identificador,
  numeroLote: z
    .string()
    .trim()
    .min(1, "El numero de lote no puede estar vacio.")
    .max(60, "El numero de lote no puede superar los 60 caracteres."),
  fechaIngreso: fecha,
  fechaVencimiento: fecha,
  /**
   * Cantidad que ingresa junto con el lote. Opcional.
   *
   * Si viene, el alta del lote y su movimiento de INGRESO entran en una sola
   * transaccion. Si no viene, el lote queda en cero y la cantidad se registra
   * despues por /api/movimientos.
   */
  cantidad: z
    .number()
    .int("La cantidad tiene que ser un numero entero.")
    .positive("La cantidad tiene que ser mayor que cero.")
    .optional(),
  /**
   * Opcional. Sin autenticacion, el usuario lo indica el selector simulado (tarea 6.02).
   * Si no viene, se usa el farmaceutico por defecto.
   */
  usuarioId: identificador.optional(),
});

export type CrearLoteEntrada = z.infer<typeof esquemaCrearLote>;

export const esquemaListarLotes = z.object({
  medicamentoId: identificador,
});

/**
 * Cantidad de un movimiento: entero positivo.
 *
 * El servicio vuelve a comprobarlo, y no es redundancia inutil: el servicio se
 * puede llamar desde el seed o desde otro servicio, sin pasar por la API.
 */
const cantidad = z
  .number()
  .int("La cantidad tiene que ser un numero entero.")
  .positive("La cantidad tiene que ser mayor que cero.");

export const esquemaRegistrarMovimiento = z.object({
  loteId: identificador,
  tipo: z.enum(["INGRESO", "EGRESO"], {
    message: "El tipo de movimiento tiene que ser INGRESO o EGRESO.",
  }),
  cantidad,
  /**
   * Opcional. Proviene del selector simulado (tarea 6.02).
   */
  usuarioId: identificador.optional(),
});

export type RegistrarMovimientoEntrada = z.infer<
  typeof esquemaRegistrarMovimiento
>;

export const esquemaDispensar = z.object({
  medicamentoId: identificador,
  cantidad,
  /**
   * Si se ejecuta o solo se previsualiza.
   *
   * Por defecto **no ejecuta**: es el valor seguro. Quien quiere escribir en el
   * historial lo tiene que pedir explicitamente, y no por olvidarse un campo.
   */
  ejecutar: z.boolean().default(false),
  /**
   * Opcional. Proviene del selector simulado (tarea 6.02).
   */
  usuarioId: identificador.optional(),
});

export type DispensarEntrada = z.infer<typeof esquemaDispensar>;

export const esquemaListarMovimientos = z.object({
  loteId: identificador,
});
