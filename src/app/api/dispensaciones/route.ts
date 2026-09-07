import { dispensar, previsualizarDispensacion } from "@/services/dispensacion";
import { esquemaDispensar } from "@/types/lote";
import {
  leerJson,
  respuestaDeError,
  respuestaDeValidacion,
} from "@/lib/respuestaHttp";

// Endpoint de dispensacion FEFO (tarea 4.10).

/**
 * POST /api/dispensaciones
 *
 * Cuerpo: `{ medicamentoId, cantidad, ejecutar? }`
 *
 * **El mismo endpoint previsualiza o ejecuta, segun `ejecutar`.** Es lo que
 * necesita el modal de la tarea 4.14: primero se pide el plan para mostrarlo
 * —"60 del lote A que vence 03/2027, 40 del lote B que vence 11/2027"— y recien
 * al confirmar se vuelve a pedir con `ejecutar: true`.
 *
 * `ejecutar` es **false por defecto**. Olvidarse el campo previsualiza; nunca
 * escribe por descuido.
 *
 * Se elige un solo endpoint y no dos porque el plan lo tiene que calcular la
 * misma logica en los dos casos. Y no se confia en el plan que vio la persona:
 * al ejecutar se vuelve a planificar dentro de la transaccion, por si entre la
 * previsualizacion y el "Confirmar" entro otro egreso.
 *
 * Respuestas: **200** al previsualizar —no se creo nada— y **201** al ejecutar.
 * Si la existencia no alcanza, **422** con cuanto hay en el mensaje.
 */
export async function POST(request: Request) {
  const cuerpo = await leerJson(request);
  if (cuerpo instanceof Response) return cuerpo;

  const entrada = esquemaDispensar.safeParse(cuerpo);

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  const { medicamentoId, cantidad, ejecutar } = entrada.data;

  try {
    if (!ejecutar) {
      const plan = await previsualizarDispensacion(medicamentoId, cantidad);
      return Response.json({ ejecutado: false, plan });
    }

    const plan = await dispensar(medicamentoId, cantidad);
    return Response.json({ ejecutado: true, plan }, { status: 201 });
  } catch (error) {
    return respuestaDeError(error, "POST /api/dispensaciones");
  }
}
