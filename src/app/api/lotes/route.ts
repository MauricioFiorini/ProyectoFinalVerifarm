import { crearLote, listarLotesDeMedicamento } from "@/services/lotes";
import { obtenerDisponiblePorLote } from "@/services/stock";
import { obtenerMedicamentoPorId } from "@/services/medicamentos";
import { esquemaCrearLote, esquemaListarLotes } from "@/types/lote";
import {
  leerJson,
  respuestaDeError,
  respuestaDeValidacion,
} from "@/lib/respuestaHttp";
import { ErrorDeNegocio } from "@/services/errores";

// Endpoint de lotes (tareas 4.10 y 4.12).

/**
 * GET /api/lotes?medicamentoId=…
 *
 * Devuelve `{ medicamento, lotes }`.
 *
 * El medicamento viene en la misma respuesta a proposito: la pantalla de la
 * tarea 4.12 necesita su nombre para el encabezado, y pedirlo aparte serian dos
 * viajes para dibujar una sola pantalla.
 *
 * Los lotes van ordenados por vencimiento mas proximo primero —el orden de
 * FEFO— y cada uno con su cantidad disponible. El disponible se calcula: no
 * existe ninguna columna de saldo. Se resuelven todos en una sola consulta con
 * `obtenerDisponiblePorLote` en vez de pedirlo lote por lote.
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
    const medicamento = await obtenerMedicamentoPorId(
      entrada.data.medicamentoId,
    );

    if (!medicamento) {
      throw new ErrorDeNegocio(
        "NO_ENCONTRADO",
        "El medicamento indicado no existe.",
        "medicamentoId",
      );
    }

    const lotes = await listarLotesDeMedicamento(entrada.data.medicamentoId);
    const disponibles = await obtenerDisponiblePorLote(lotes.map((l) => l.id));

    return Response.json({
      medicamento,
      lotes: lotes.map((l) => ({
        ...l,
        disponible: disponibles.get(l.id) ?? 0,
      })),
    });
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
