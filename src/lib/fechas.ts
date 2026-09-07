// Formato de fechas (tarea 4.13).
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
