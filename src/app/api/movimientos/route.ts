import {
  listarMovimientosDeLote,
  registrarEgreso,
  registrarIngreso,
} from "@/services/movimientos";
import {
  esquemaListarMovimientos,
  esquemaRegistrarMovimiento,
} from "@/types/lote";
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
 * GET /api/movimientos?loteId=…
 *
 * Historial de un lote, del mas nuevo al mas viejo. Solo lectura: no hay PUT ni
 * DELETE y no los va a haber.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const entrada = esquemaListarMovimientos.safeParse({
    loteId: searchParams.get("loteId") ?? "",
  });

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  try {
    return Response.json(await listarMovimientosDeLote(entrada.data.loteId));
  } catch (error) {
    return respuestaDeError(error, "GET /api/movimientos");
  }
}

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
