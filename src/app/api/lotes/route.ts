import { crearLote, listarLotesDeMedicamento } from "@/services/lotes";
import { obtenerDisponiblePorLote } from "@/services/stock";
import { esquemaCrearLote, esquemaListarLotes } from "@/types/lote";
import {
  leerJson,
  respuestaDeError,
  respuestaDeValidacion,
} from "@/lib/respuestaHttp";

// Endpoint de lotes (tarea 4.10).

/**
 * GET /api/lotes?medicamentoId=…
 *
 * Lotes de un medicamento, ordenados por vencimiento mas proximo primero, cada
 * uno con su cantidad disponible.
 *
 * El disponible se calcula, no se lee de una columna: no existe tal columna.
 * Se traen todos de una sola consulta con `obtenerDisponiblePorLote` en vez de
 * pedirlo lote por lote, que serian N consultas para una pantalla.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const entrada = esquemaListarLotes.safeParse({
    medicamentoId: searchParams.get("medicamentoId") ?? "",
  });

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  try {
    const lotes = await listarLotesDeMedicamento(entrada.data.medicamentoId);
    const disponibles = await obtenerDisponiblePorLote(lotes.map((l) => l.id));

    return Response.json(
      lotes.map((l) => ({ ...l, disponible: disponibles.get(l.id) ?? 0 })),
    );
  } catch (error) {
    return respuestaDeError(error, "GET /api/lotes");
  }
}

/**
 * POST /api/lotes
 *
 * Alta de un lote. **Queda en cero**: la cantidad entra como movimiento de tipo
 * INGRESO, por `POST /api/movimientos`. Ver docs/decisiones/0007.
 */
export async function POST(request: Request) {
  const cuerpo = await leerJson(request);
  if (cuerpo instanceof Response) return cuerpo;

  const entrada = esquemaCrearLote.safeParse(cuerpo);

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  try {
    const lote = await crearLote(entrada.data);
    return Response.json(lote, { status: 201 });
  } catch (error) {
    return respuestaDeError(error, "POST /api/lotes");
  }
}
