import {
  crearMedicamento,
  buscarMedicamentosPorNombre,
  listarMedicamentos,
} from "@/services/medicamentos";
import {
  esquemaCrearMedicamento,
  esquemaListarMedicamentos,
} from "@/types/medicamento";

// Endpoint del catalogo de medicamentos (tarea 3.03).
//
// Un route handler hace tres cosas y ninguna mas: recibe el HTTP, valida la
// entrada y delega en el servicio. Toda regla de negocio vive en
// src/services/. Ver docs/ARQUITECTURA.md seccion 3.
//
// El manejo de errores de aca es provisorio: la tarea 3.04 lo reemplaza por una
// funcion unica que traduce error de servicio a respuesta HTTP, para que los
// endpoints de las fases 4 y 5 no repitan este bloque.

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
    return Response.json(
      { error: "Parametros de busqueda invalidos." },
      { status: 400 },
    );
  }

  const { buscar } = entrada.data;

  try {
    const medicamentos = buscar
      ? await buscarMedicamentosPorNombre(buscar)
      : await listarMedicamentos();

    return Response.json(medicamentos);
  } catch (error) {
    console.error("GET /api/medicamentos", error);
    return Response.json(
      { error: "No se pudo obtener el listado de medicamentos." },
      { status: 500 },
    );
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
    // Errores por campo, que es lo que la pantalla de la 3.07 necesita para
    // mostrarlos al lado del input y no en un cartel suelto.
    const porCampo: Record<string, string> = {};
    for (const issue of entrada.error.issues) {
      const campo = issue.path.join(".") || "_";
      porCampo[campo] ??= issue.message;
    }

    return Response.json(
      { error: "Los datos enviados no son validos.", campos: porCampo },
      { status: 400 },
    );
  }

  try {
    const medicamento = await crearMedicamento(entrada.data);
    return Response.json(medicamento, { status: 201 });
  } catch (error) {
    // Provisorio hasta la 3.04: hoy el servicio lanza Error con un mensaje, asi
    // que no hay forma de distinguir "ya existe" de una caida real sin mirar el
    // texto. La 3.04 le da un tipo al error y esto desaparece.
    console.error("POST /api/medicamentos", error);
    return Response.json(
      { error: "No se pudo crear el medicamento." },
      { status: 500 },
    );
  }
}
