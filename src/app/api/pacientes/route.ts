import {
  buscarPacientesPorSeudonimo,
  crearPaciente,
  listarPacientes,
} from "@/services/pacientes";
import { esquemaCrearPaciente, esquemaListarPacientes } from "@/types/clinico";
import {
  leerJson,
  respuestaDeError,
  respuestaDeValidacion,
} from "@/lib/respuestaHttp";

// Endpoint de pacientes (tarea 5.10).
//
// Un route handler hace tres cosas y ninguna mas: recibe el HTTP, valida la
// forma de la entrada y delega en el servicio. Ninguna regla del dominio se
// escribe aca. Ver docs/ARQUITECTURA.md seccion 3.
//
// LO QUE ESTE ENDPOINT NO TIENE, Y ES A PROPOSITO
//
// No hay DELETE. `Paciente` tiene `activo` y se da de baja logica; borrarlo se
// llevaria por delante su medicacion y sus consultas, que son historial
// clinico. Si alguna vez hace falta, es un PATCH que apaga `activo`, no un
// DELETE.

/**
 * GET /api/pacientes
 * GET /api/pacientes?buscar=PAC-0
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const entrada = esquemaListarPacientes.safeParse({
    buscar: searchParams.get("buscar") ?? undefined,
  });

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  const { buscar } = entrada.data;

  try {
    const pacientes = buscar
      ? await buscarPacientesPorSeudonimo(buscar)
      : await listarPacientes();

    return Response.json(pacientes);
  } catch (error) {
    return respuestaDeError(error, "GET /api/pacientes");
  }
}

/**
 * POST /api/pacientes
 *
 * Alta de paciente. El cuerpo lleva el seudonimo y nada mas.
 */
export async function POST(request: Request) {
  const cuerpo = await leerJson(request);
  if (cuerpo instanceof Response) return cuerpo;

  const entrada = esquemaCrearPaciente.safeParse(cuerpo);

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  try {
    const paciente = await crearPaciente(entrada.data);
    return Response.json(paciente, { status: 201 });
  } catch (error) {
    return respuestaDeError(error, "POST /api/pacientes");
  }
}
