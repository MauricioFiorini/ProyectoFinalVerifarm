import { esErrorDeNegocio, type CodigoDeError } from "@/services/errores";

// Traduccion de errores a respuestas HTTP (tarea 3.04).
//
// Es el unico lugar del proyecto donde un error se convierte en un numero de
// estado. Los route handlers de las fases 4 y 5 usan esto en vez de repetir su
// propio try/catch, para que un mismo problema no responda 409 en una pantalla y
// 500 en otra.

const ESTADO_POR_CODIGO: Record<CodigoDeError, number> = {
  DUPLICADO: 409,
  NO_ENCONTRADO: 404,
  REGLA_DE_NEGOCIO: 422,
};

export type CuerpoDeError = {
  error: string;
  /** Mensajes por campo, para pintarlos al lado del input. */
  campos?: Record<string, string>;
};

/**
 * Convierte cualquier cosa que haya salido de un servicio en una respuesta.
 *
 * - `ErrorDeNegocio` -> el estado que le corresponde a su codigo, con el mensaje
 *   del servicio, que esta escrito para que lo lea una persona.
 * - Cualquier otra excepcion -> 500 con un mensaje generico. El detalle va al
 *   log del servidor y NO al cliente: puede traer nombres de tabla, la cadena de
 *   conexion o parte de una consulta.
 *
 * @param contexto Texto para el log, del tipo "POST /api/medicamentos".
 */
export function respuestaDeError(error: unknown, contexto: string): Response {
  if (esErrorDeNegocio(error)) {
    const estado = ESTADO_POR_CODIGO[error.codigo];
    const cuerpo: CuerpoDeError = { error: error.message };

    if (error.campo) {
      cuerpo.campos = { [error.campo]: error.message };
    }

    return Response.json(cuerpo, { status: estado });
  }

  console.error(contexto, error);

  return Response.json(
    { error: "Ocurrio un error inesperado. Volve a intentar." },
    { status: 500 },
  );
}

/**
 * Respuesta de entrada invalida, a partir de los problemas que devuelve Zod.
 *
 * Se separa de `respuestaDeError` a proposito: esto no es un error de negocio
 * sino una entrada mal formada, y siempre es 400.
 */
export function respuestaDeValidacion(
  problemas: { path: PropertyKey[]; message: string }[],
): Response {
  const campos: Record<string, string> = {};

  for (const p of problemas) {
    const campo = p.path.map(String).join(".") || "_";
    campos[campo] ??= p.message;
  }

  const cuerpo: CuerpoDeError = {
    error: "Los datos enviados no son validos.",
    campos,
  };

  return Response.json(cuerpo, { status: 400 });
}

/**
 * Lee el cuerpo JSON de un pedido.
 *
 * Devuelve el cuerpo, o una `Response` de 400 si no se pudo interpretar. El
 * `instanceof Response` en el llamador es lo que distingue los dos casos:
 *
 * ```ts
 * const cuerpo = await leerJson(request);
 * if (cuerpo instanceof Response) return cuerpo;
 * ```
 *
 * Existe porque el mismo bloque de try/catch se repetia en cada endpoint que
 * recibe un POST, y un cuerpo mal formado tiene que responder igual en todos.
 */
export async function leerJson(request: Request): Promise<unknown | Response> {
  try {
    return await request.json();
  } catch {
    return Response.json(
      { error: "El cuerpo del pedido no es JSON valido." },
      { status: 400 },
    );
  }
}
