// Errores de negocio (tarea 3.04).
//
// EL PROBLEMA QUE RESUELVEN
//
// Los servicios lanzaban `new Error("El medicamento ... ya existe")`. Desde el
// route handler no habia forma de distinguir eso de una caida real de la base:
// las dos llegan como Error. El resultado era que un nombre repetido devolvia
// 500, cuando es un 409, y el usuario veia "error del servidor" por haber
// escrito un nombre que ya estaba.
//
// La alternativa era mirar el texto del mensaje, que se rompe la primera vez que
// alguien lo reescribe.
//
// EL CONTRATO
//
// Un servicio lanza `ErrorDeNegocio` cuando la operacion es imposible por una
// REGLA DEL DOMINIO. Cualquier otra excepcion que salga de un servicio es una
// falla real, se registra y se responde 500.
//
// Los servicios siguen sin saber que existe HTTP: no hay un solo numero de
// estado en este archivo. La traduccion a codigos vive en
// src/lib/respuestaHttp.ts

/**
 * Familias de error de negocio. Se agrega una cuando aparece un caso que
 * ninguna cubre, no "por si acaso".
 */
export type CodigoDeError =
  /** Ya existe algo que tiene que ser unico. */
  | "DUPLICADO"
  /** Se pidio algo por identificador y no esta. */
  | "NO_ENCONTRADO"
  /** Los datos son validos en forma, pero la operacion rompe una regla. */
  | "REGLA_DE_NEGOCIO";

export class ErrorDeNegocio extends Error {
  readonly codigo: CodigoDeError;
  /**
   * Campo del formulario al que corresponde el error, si aplica. Permite que la
   * pantalla lo muestre al lado del input en vez de en un cartel suelto.
   */
  readonly campo?: string;

  constructor(codigo: CodigoDeError, mensaje: string, campo?: string) {
    super(mensaje);
    this.name = "ErrorDeNegocio";
    this.codigo = codigo;
    this.campo = campo;
  }
}

export function esErrorDeNegocio(error: unknown): error is ErrorDeNegocio {
  return error instanceof ErrorDeNegocio;
}
