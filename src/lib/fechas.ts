// Fechas: formato (tarea 4.13) y corte del dia (tarea 4.18).
//
// ESTE ARCHIVO ES EL DUEÑO DE LA CONVENCION DE FECHA SIN HORA
//
// Vive todo junto a proposito. La tarea 4.18 existio porque la convencion estaba
// escrita dos veces: aca se formateaba en UTC y en src/services/stock.ts se
// comparaba en hora local. Nadie habia repetido una regla de negocio —eso sigue
// estando una sola vez, en el servicio—, pero dos capas usaban dos zonas
// distintas para el mismo tipo de dato, y esas tres horas de diferencia hacian
// que un lote figurara vencido durante todo el dia en que vencia.
//
// Lo que se comparte es la convencion, no la regla: aca esta que significa "el
// dia" de una fecha guardada; en el servicio sigue estando si un lote esta
// vencido.
//
// POR QUE SE FORMATEA EN UTC Y NO EN HORA LOCAL
//
// Las fechas de este modulo son FECHAS, no instantes: un vencimiento es "el 30
// de junio de 2027", no "el 30 de junio a las 00:00 de algun lugar".
//
// Un <input type="date"> manda "2027-06-30". Al convertirlo a Date se
// interpreta como medianoche UTC. Si despues se muestra en hora local —Argentina
// es UTC-3— esa medianoche cae el dia anterior, y la pantalla dice 29/06/2027.
//
// Se detecto probando el alta de lote: se cargo ingreso 07/09 y vencimiento
// 30/06, y la tabla mostraba 06/09 y 29/06. Un dia de diferencia en un
// vencimiento no es un detalle cosmetico: define si un lote esta vencido.
//
// La solucion es formatear en la misma zona en la que se guardo. Mientras las
// fechas entren como date-only, UTC es esa zona.

/** Fecha corta, dd/mm/aaaa. Recibe el texto ISO que llega por JSON. */
export function formatearFecha(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Fecha y hora, para el historial de movimientos, que si son instantes. */
export function formatearFechaHora(iso: string | Date): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Hoy en formato yyyy-mm-dd, que es lo que espera un <input type="date">. */
export function hoyComoTexto(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// --- Corte del dia (tarea 4.18) ---------------------------------------------
//
// LAS TRES LEEN EL DIA EN HORA LOCAL Y DEVUELVEN EL BORDE EN UTC
//
// Esa mezcla es la parte que hay que entender antes de tocarlas, y no es un
// descuido: son las dos mitades del problema.
//
// - El dia calendario se lee en HORA LOCAL porque es el dia que la persona ve.
//   Si son las 22 del 9 en Argentina, "hoy" es el 9, aunque en UTC ya sea el 10.
//   Es el mismo criterio que usa `hoyComoTexto`, que llena el <input type="date">.
//
// - El borde se construye en UTC porque es la zona en la que estan guardadas las
//   fechas contra las que se va a comparar. Un <input type="date"> manda
//   "2026-09-24", que se interpreta como medianoche UTC, y asi queda en la base.
//
// Construir el borde en hora local es exactamente el error que arreglo la 4.18:
// medianoche local en UTC-3 son las 03:00 UTC, tres horas DESPUES de la
// medianoche UTC del mismo dia, asi que un lote que vencia ese dia caia del lado
// de "ya vencido" desde el primer minuto.
//
// `referencia` es siempre un INSTANTE —`new Date()`, o una fecha inventada para
// verificar—, nunca una fecha ya normalizada. Pasarle el resultado de
// `inicioDelDiaUtc` la haria leer sus componentes locales y retroceder un dia.

/**
 * Medianoche UTC del dia calendario en el que cae `referencia`.
 *
 * Es el piso contra el que se compara una fecha guardada. Una fecha ANTERIOR a
 * este instante es de un dia ya pasado; una igual es de hoy.
 */
export function inicioDelDiaUtc(referencia: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      referencia.getFullYear(),
      referencia.getMonth(),
      referencia.getDate(),
    ),
  );
}

/**
 * Ultimo instante UTC del dia calendario en el que cae `referencia`.
 *
 * Es el techo, y existe para que la comparacion siga siendo INCLUSIVA aunque la
 * fecha traiga hora. No es hipotetico: `esquemaCrearLote` acepta tanto
 * "2026-09-24" como una cadena ISO completa, asi que por la API puede entrar una
 * fecha con hora. Contra la medianoche pelada, esa fecha quedaria afuera de su
 * propio dia.
 */
export function finDelDiaUtc(referencia: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      referencia.getFullYear(),
      referencia.getMonth(),
      referencia.getDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

/**
 * `referencia` corrida `dias` dias, en dias calendario.
 *
 * Devuelve otro instante, no un borde: se combina con las dos de arriba para
 * obtener el limite de una ventana ("lo que vence dentro de 30 dias" es
 * `finDelDiaUtc(sumarDias(hoy, 30))`).
 *
 * Suma con `setDate` y no treinta veces 24 horas porque el calendario no es
 * aritmetica: `setDate` cruza bien los meses, los años bisiestos y, donde haya
 * horario de verano, los dias que no duran 24 horas.
 */
export function sumarDias(referencia: Date, dias: number): Date {
  const corrida = new Date(referencia);
  corrida.setDate(corrida.getDate() + dias);
  return corrida;
}
