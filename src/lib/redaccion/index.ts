import { redactarPorPlantilla } from "./plantilla";
import type { Redactor } from "./tipos";

// Redaccion de la observacion (tarea 5.08) — el punto de cambio.
//
// TODO EL SISTEMA IMPORTA DE ACA, NUNCA DE `plantilla.ts`.
//
// Es la unica linea que hay que tocar para cambiar como se escriben las
// observaciones. Si algun dia entra un redactor con un modelo generativo, se
// escribe al lado, se cambia esta asignacion y el resto del sistema no se
// entera: la 5.09, que es la que persiste las observaciones, solo conoce el
// tipo `Redactor`.
//
// Que el reemplazo sea de una linea es justamente lo que hace que la decision
// de reemplazarlo se pueda tomar despues, con calma, y no ahora por las dudas.

export const redactarObservacion: Redactor = redactarPorPlantilla;

export type { DatosDeObservacion, Redactor } from "./tipos";
