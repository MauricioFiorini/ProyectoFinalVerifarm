import { Severidad } from "@prisma/client";
import type { DatosDeObservacion, Redactor } from "./tipos";

// Redaccion por plantilla (tarea 5.08) — la implementacion vigente.
//
// COMO SE ARMA EL TEXTO
//
// Tres lineas, siempre en el mismo orden:
//
//   1. Las dos drogas y la severidad.        <- lo escribe la plantilla
//   2. La descripcion de la fuente.          <- se copia tal cual
//   3. La cita de la fuente.                 <- se copia tal cual
//
// **Solo la primera linea es texto nuestro.** Las otras dos son datos que ya
// venian resueltos. Esa separacion no es estetica: es la que permite decir en
// la defensa que el sistema no interpreta informacion clinica, la transporta.
//
// LO QUE ESTA PLANTILLA NO HACE, Y NO ES QUE FALTE
//
// No dice que hacer. No sugiere suspender, espaciar ni ajustar nada, y no
// concluye que el riesgo sea aceptable o inaceptable. El sistema informa; la
// decision es del profesional (docs/CONTEXTO.md seccion 3).
//
// Tampoco explica el mecanismo mas alla de lo que diga la fuente. Con ONCHigh
// eso significa que muchas observaciones nombran clases de farmacos y no
// consecuencias: es una limitacion de la fuente, declarada en la decision 0011,
// y taparla escribiendo la consecuencia de memoria seria inventar (REGLAS_IA
// seccion 5).

const ETIQUETA_DE_SEVERIDAD: Record<Severidad, string> = {
  ALTA: "alta",
  MEDIA: "media",
  BAJA: "baja",
};

/**
 * Deja el texto listo para pegarlo a continuacion de otro: sin espacios de mas
 * y terminado en punto.
 *
 * Las descripciones de la fuente vienen redactadas por personas distintas en
 * momentos distintos; algunas cierran con punto y otras no. Sin esto, el texto
 * final queda con puntuacion despareja segun de que fila venga.
 */
function comoOracion(texto: string): string {
  const limpio = texto.trim().replace(/\s+/g, " ");
  if (limpio === "") return "";
  return /[.!?]$/.test(limpio) ? limpio : `${limpio}.`;
}

/**
 * Compone la observacion por plantilla.
 *
 * Las dos drogas se ordenan alfabeticamente. Podrian salir en el orden en que
 * vienen —que es el del RxCUI, porque asi esta guardado el par—, pero ese orden
 * es un numero interno y en pantalla se leeria como arbitrario. Alfabetico es
 * igual de determinista y ademas se entiende.
 */
export const redactarPorPlantilla: Redactor = (datos: DatosDeObservacion) => {
  const [primero, segundo] = [datos.medicamento1, datos.medicamento2].sort(
    (a, b) => a.localeCompare(b, "es"),
  );

  const encabezado = `${primero} + ${segundo}: interaccion de severidad ${ETIQUETA_DE_SEVERIDAD[datos.severidad]}.`;

  // Se filtran los vacios en vez de dar por hecho que siempre vienen los tres.
  // `descripcion` y `fuente` son obligatorios en el esquema, pero una fila
  // cargada a mano con la cadena vacia dejaria una linea suelta o un "Fuente:"
  // sin nada atras.
  const lineas = [
    encabezado,
    comoOracion(datos.descripcionDeLaFuente),
    datos.fuente.trim() === "" ? "" : `Fuente: ${comoOracion(datos.fuente)}`,
  ];

  return lineas.filter((l) => l !== "").join("\n");
};
