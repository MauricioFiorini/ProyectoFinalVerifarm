import {
  crearMedicamento,
  buscarMedicamentosPorNombre,
  listarMedicamentos,
} from "@/services/medicamentos";
import {
  esquemaCrearMedicamento,
  esquemaListarMedicamentos,
} from "@/types/medicamento";
import { respuestaDeError, respuestaDeValidacion } from "@/lib/respuestaHttp";

// Endpoint del catalogo de medicamentos (tareas 3.03 y 3.04).
//
// Un route handler hace tres cosas y ninguna mas: recibe el HTTP, valida la
// entrada y delega en el servicio. Toda regla de negocio vive en
// src/services/. Ver docs/ARQUITECTURA.md seccion 3.
//
// No hay ni un numero de estado escrito a mano en los caminos de error: los pone
// src/lib/respuestaHttp.ts, para que un mismo problema no responda distinto
// segun el endpoint.

/**
 * GET /api/medicamentos
 * GET /api/medicamentos?buscar=parac
 *
 * Sin `buscar` devuelve el catalogo completo; con `buscar` filtra por nombre.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const entrada = esquemaListarMedicamentos.safeParse({
    buscar: searchParams.get("buscar") ?? undefined,
  });

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  const { buscar } = entrada.data;

  try {
    const medicamentos = buscar
      ? await buscarMedicamentosPorNombre(buscar)
      : await listarMedicamentos();

    return Response.json(medicamentos);
  } catch (error) {
    return respuestaDeError(error, "GET /api/medicamentos");
  }
}

/**
 * POST /api/medicamentos
 *
 * Alta de un medicamento. El cuerpo se valida contra `esquemaCrearMedicamento`
 * antes de tocar el servicio.
 */
export async function POST(request: Request) {
  let cuerpo: unknown;

  try {
    cuerpo = await request.json();
  } catch {
    return Response.json(
      { error: "El cuerpo del pedido no es JSON valido." },
      { status: 400 },
    );
  }

  const entrada = esquemaCrearMedicamento.safeParse(cuerpo);

  if (!entrada.success) {
    return respuestaDeValidacion(entrada.error.issues);
  }

  try {
    const medicamento = await crearMedicamento(entrada.data);
    return Response.json(medicamento, { status: 201 });
  } catch (error) {
    return respuestaDeError(error, "POST /api/medicamentos");
  }
}
