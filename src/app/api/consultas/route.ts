import { crearConsulta, obtenerConsulta } from "@/services/consultas";
import { esquemaCrearConsulta, esquemaObtenerConsulta } from "@/types/clinico";
import {
  leerJson,
  respuestaDeError,
  respuestaDeValidacion,
} from "@/lib/respuestaHttp";

// Endpoint de consultas de interacciones (tarea 5.10).
//
// POR QUE UNA CONSULTA SE CREA CON POST Y NO SE PREVISUALIZA
//
// La dispensacion tiene previsualizacion —`ejecutar: false`— porque calcular el
// plan y ejecutarlo son cosas distintas: una escribe en el historial de stock y
// la otra no.
//
// Una consulta de interacciones no tiene esa division. Evaluar ES la operacion,
// y que quede registrada es parte del punto: el sistema tiene que poder decir
// que se consulto y que se contesto. Una evaluacion que no se guarda no seria
// una consulta, seria una cuenta.
//
// NO HAY PUT NI DELETE, Y NO ES UN OLVIDO
//
// Una consulta es un hecho fechado: alguien pregunto algo un dia y el sistema
// contesto. Editarla o borrarla seria reescribir lo que se leyo, que es
// exactamente lo que un registro clinico no puede permitir. Si una consulta
// estuvo mal planteada, se hace otra.

/**
 * GET /api/consultas?id=…
 *
 * Relee una consulta guardada, con los medicamentos que se evaluaron y las
 * observaciones que se registraron.
 *
 * **No hay listado todavia.** La pantalla que lo necesita es la 5.20 y el
 * servicio no expone la funcion: agregarla aca significaria consultar la base
 * desde el route handler, que es lo que la arquitectura no permite.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const entrada = esquemaObtenerConsulta.safeParse({
    id: searchParams.get("id") ?? "",
  });

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  try {
    const consulta = await obtenerConsulta(entrada.data.id);

    if (!consulta) {
      return Response.json(
        { error: "La consulta no existe." },
        { status: 404 },
      );
    }

    return Response.json(consulta);
  } catch (error) {
    return respuestaDeError(error, "GET /api/consultas");
  }
}

/**
 * POST /api/consultas
 *
 * Evalua un conjunto de medicamentos y guarda la consulta.
 *
 * Que sean al menos dos NO se comprueba aca: lo hace el servicio, que devuelve
 * 422 con un mensaje que se puede leer, en vez del 400 generico de una entrada
 * mal formada. Ver la nota en `src/types/clinico.ts`.
 */
export async function POST(request: Request) {
  const cuerpo = await leerJson(request);
  if (cuerpo instanceof Response) return cuerpo;

  const entrada = esquemaCrearConsulta.safeParse(cuerpo);

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  try {
    const consulta = await crearConsulta(entrada.data);
    return Response.json(consulta, { status: 201 });
  } catch (error) {
    return respuestaDeError(error, "POST /api/consultas");
  }
}
