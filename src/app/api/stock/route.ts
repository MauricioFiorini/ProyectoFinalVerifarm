import { listarEstadoDeStock } from "@/services/stock";
import { respuestaDeError } from "@/lib/respuestaHttp";

// Endpoint de estado de stock (tarea 4.11).
//
// La 4.10 dejo los endpoints de lotes, movimientos y dispensacion. Este hacia
// falta para la pantalla de stock y no estaba en esa lista, asi que se agrega
// aca, con la tarea que lo necesita.

/**
 * GET /api/stock
 *
 * Todos los medicamentos activos con su disponible, su minimo y su indicador de
 * estado. El disponible cuenta solo lotes NO vencidos: la medicacion vencida
 * existe fisicamente pero no se puede dispensar, y contarla diria que hay stock
 * cuando no hay.
 */
export async function GET() {
  try {
    return Response.json(await listarEstadoDeStock());
  } catch (error) {
    return respuestaDeError(error, "GET /api/stock");
  }
}
