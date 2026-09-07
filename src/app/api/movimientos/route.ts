import { registrarEgreso, registrarIngreso } from "@/services/movimientos";
import { esquemaRegistrarMovimiento } from "@/types/lote";
import {
  leerJson,
  respuestaDeError,
  respuestaDeValidacion,
} from "@/lib/respuestaHttp";

// Endpoint de movimientos de stock (tarea 4.10).
//
// SOLO HAY POST, A PROPOSITO. No existe PUT ni DELETE y no se van a agregar: el
// historial de movimientos es un libro mayor. Un error se corrige con un
// movimiento nuevo, no reescribiendo el anterior. Ver docs/CONVENCIONES.md
// seccion 7.

/**
 * POST /api/movimientos
 *
 * Registra un ingreso o un egreso sobre un lote. El `tipo` decide cual.
 *
 * Un egreso nunca puede dejar el lote en negativo: eso lo garantiza el servicio
 * dentro de una transaccion, y si no alcanza responde 422 con el disponible real
 * en el mensaje.
 */
export async function POST(request: Request) {
  const cuerpo = await leerJson(request);
  if (cuerpo instanceof Response) return cuerpo;

  const entrada = esquemaRegistrarMovimiento.safeParse(cuerpo);

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  const { tipo, loteId, cantidad } = entrada.data;

  try {
    const movimiento =
      tipo === "INGRESO"
        ? await registrarIngreso({ loteId, cantidad })
        : await registrarEgreso({ loteId, cantidad });

    return Response.json(movimiento, { status: 201 });
  } catch (error) {
    return respuestaDeError(error, "POST /api/movimientos");
  }
}
