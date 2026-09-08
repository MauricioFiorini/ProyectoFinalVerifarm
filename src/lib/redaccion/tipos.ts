import { Severidad } from "@prisma/client";

// Redaccion de la observacion (tarea 5.08) — el contrato.
//
// QUE ES UNA OBSERVACION
//
// El texto que lee el medico cuando el sistema detecta una interaccion. Se
// guarda en `ObservacionInteraccion.descripcion` (tarea 5.09) y se muestra en la
// pantalla de resultado (5.18).
//
// POR QUE ESTO ES UNA INTERFAZ Y NO UNA FUNCION SUELTA
//
// `docs/CONTEXTO.md` seccion 3 lo dice: el texto **no lo genera un modelo de
// lenguaje**, se compone por plantilla. Y el motivo no es que un modelo no
// sirva: es que el sistema tiene que funcionar sin depender de una clave de API
// que puede fallar el dia de la defensa, y no hay presupuesto para una.
//
// Que la explicacion sea generada es deseable. Que el sistema se caiga si no
// hay internet, no. Asi que la puerta queda abierta: quien quiera enchufar un
// modelo escribe otro `Redactor` y cambia una linea en `index.ts`. Nada mas del
// sistema se entera.

/**
 * Todo lo que hace falta para escribir una observacion. Nada de esto lo decide
 * el redactor: llega ya resuelto desde `Interaccion` y el catalogo.
 */
export type DatosDeObservacion = {
  /** Nombre del principio activo, como esta en el catalogo. */
  medicamento1: string;
  medicamento2: string;
  severidad: Severidad;
  /**
   * La descripcion tal como vino de la fuente.
   *
   * **Es dato, no borrador.** El redactor la puede ubicar, no reescribir: dice
   * lo que la fuente publica y ni una palabra mas. Ver la decision 0011 sobre
   * por que estas descripciones hablan de clases de farmacos y no de
   * consecuencias clinicas.
   */
  descripcionDeLaFuente: string;
  /** De donde salio la interaccion. Se cita, no se omite. */
  fuente: string;
};

/**
 * Compone el texto de una observacion.
 *
 * **Un redactor no puede agregar informacion clinica.** Puede ordenar, unir y
 * dar forma a lo que recibe; no puede concluir, recomendar ni explicar un
 * mecanismo que la fuente no explique. `docs/REGLAS_IA.md` seccion 5.
 *
 * Es sincronica a proposito. Si algun dia entra una implementacion que consulta
 * un modelo, ese cambio de forma tiene que ser visible y discutido, no colarse
 * detras de un `await` que ya estaba.
 */
export type Redactor = (datos: DatosDeObservacion) => string;
