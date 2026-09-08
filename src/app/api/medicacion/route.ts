import {
  agregarMedicacion,
  listarMedicacionDePaciente,
  listarMedicacionVigente,
  suspenderMedicacion,
} from "@/services/medicacion";
import {
  esquemaAgregarMedicacion,
  esquemaListarMedicacion,
  esquemaSuspenderMedicacion,
} from "@/types/clinico";
import {
  leerJson,
  respuestaDeError,
  respuestaDeValidacion,
} from "@/lib/respuestaHttp";

// Endpoint de la medicacion de un paciente (tarea 5.10).
//
// POR QUE ACA SI HAY PATCH, Y EN /api/movimientos NO
//
// El historial de movimientos de stock es un libro mayor: un asiento no se
// corrige, se compensa con otro. Por eso ese endpoint es POST y nada mas.
//
// La medicacion no es eso. Una fila es un TRAMO —esta droga, desde esta fecha,
// hasta esta otra— y suspenderla no agrega un hecho nuevo: cierra el tramo que
// ya estaba abierto. Eso es una modificacion, y le corresponde un PATCH.
//
// El historial no se pierde igual: la fila no se borra ni se reutiliza cuando la
// droga se reinicia, que entra como un tramo nuevo. Ver la decision 0013.

/**
 * GET /api/medicacion?pacienteId=…
 * GET /api/medicacion?pacienteId=…&incluirNoVigentes=true
 *
 * Por defecto solo la vigente. **Ese defecto importa:** la evaluacion de
 * interacciones corre sobre la medicacion vigente, y si el defecto trajera el
 * historial, olvidarse el parametro daria un aviso por una droga que el paciente
 * ya no toma.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const entrada = esquemaListarMedicacion.safeParse({
    pacienteId: searchParams.get("pacienteId") ?? "",
    incluirNoVigentes: searchParams.get("incluirNoVigentes") ?? undefined,
  });

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  const { pacienteId, incluirNoVigentes } = entrada.data;

  try {
    const medicacion = incluirNoVigentes
      ? await listarMedicacionDePaciente(pacienteId)
      : await listarMedicacionVigente(pacienteId);

    return Response.json(medicacion);
  } catch (error) {
    return respuestaDeError(error, "GET /api/medicacion");
  }
}

/**
 * POST /api/medicacion
 *
 * Agrega una droga a la medicacion de un paciente.
 */
export async function POST(request: Request) {
  const cuerpo = await leerJson(request);
  if (cuerpo instanceof Response) return cuerpo;

  const entrada = esquemaAgregarMedicacion.safeParse(cuerpo);

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  try {
    const medicacion = await agregarMedicacion(entrada.data);
    return Response.json(medicacion, { status: 201 });
  } catch (error) {
    return respuestaDeError(error, "POST /api/medicacion");
  }
}

/**
 * PATCH /api/medicacion
 *
 * Suspende una medicacion vigente. El motivo es obligatorio: es lo que
 * distingue una suspension de una finalizacion.
 */
export async function PATCH(request: Request) {
  const cuerpo = await leerJson(request);
  if (cuerpo instanceof Response) return cuerpo;

  const entrada = esquemaSuspenderMedicacion.safeParse(cuerpo);

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  try {
    const medicacion = await suspenderMedicacion(entrada.data);
    return Response.json(medicacion);
  } catch (error) {
    return respuestaDeError(error, "PATCH /api/medicacion");
  }
}
