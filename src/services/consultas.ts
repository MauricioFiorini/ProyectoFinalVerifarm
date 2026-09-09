import { db } from "../lib/db";
import { Severidad } from "@prisma/client";
import { redactarObservacion } from "../lib/redaccion";
import { USUARIO_CLINICO_PROVISORIO_ID } from "../lib/usuariosSemilla";
import { ErrorDeNegocio } from "./errores";
import {
  calcularEvaluabilidad,
  evaluarInteracciones,
  rxcuisConCobertura,
  validarMedicamentosDeConsulta,
  type Evaluabilidad,
} from "./interacciones";

// Servicio de consultas de interacciones (tarea 5.09).
//
// QUE ES UNA CONSULTA
//
// Alguien elige un conjunto de medicamentos —los de un paciente, o una lista
// suelta— y pregunta si interactuan entre si. La respuesta se guarda: queda el
// registro de que se consulto, que se consulto y que se encontro.
//
// LAS TRES COSAS SE GUARDAN JUNTAS O NO SE GUARDA NINGUNA
//
// Una consulta son tres escrituras: la fila de la consulta, la lista de
// medicamentos evaluados y las observaciones. Si entrara solo una parte
// quedaria un registro que miente: una consulta sin sus evaluados no se puede
// releer (es el problema que cerro la decision 0014), y una consulta sin sus
// observaciones diria que no se encontro nada cuando si se encontro.
//
// POR QUE LA LECTURA VA AFUERA DE LA TRANSACCION, A DIFERENCIA DE LA
// DISPENSACION
//
// En el modulo de stock, `dispensar` replanifica DENTRO de la transaccion,
// porque entre calcular el plan y ejecutarlo puede entrar otro egreso y dejar el
// plan sin existencia. Aca ese riesgo no existe: `Interaccion` es dato de
// referencia que se carga una vez, y los medicamentos elegidos no cambian
// mientras se los evalua. No hay nada que se pueda mover abajo.
//
// Es una diferencia deliberada con el otro modulo, no un olvido.

// `Evaluabilidad` se define en `interacciones.ts`, junto a la funcion que
// calcula la cobertura. Se reexporta para no romper a quien ya la importaba
// desde aca.
export type { Evaluabilidad } from "./interacciones";

export type MedicamentoDeLaConsulta = {
  id: string;
  nombre: string;
  rxcui: string | null;
  evaluabilidad: Evaluabilidad;
};

export type ObservacionDeLaConsulta = {
  id: string;
  medicamento1: { id: string; nombre: string };
  medicamento2: { id: string; nombre: string };
  severidad: Severidad;
  /** El texto compuesto por `src/lib/redaccion`. */
  descripcion: string;
};

export type ResultadoDeConsulta = {
  consultaId: string;
  fecha: Date;
  pacienteId: string | null;
  /**
   * El seudonimo, cuando la consulta es de un paciente (tarea 5.20).
   *
   * Viene resuelto y no solo el id: desde el listado se entra a una consulta, y
   * la pantalla de resultado tiene que poder decir de quien era sin pedirlo
   * aparte.
   */
  seudonimo: string | null;
  /** Todos los que entraron, con o sin RxCUI, hayan dado interaccion o no. */
  medicamentos: MedicamentoDeLaConsulta[];
  /** Ordenadas de mas grave a menos, como las devuelve el motor. */
  observaciones: ObservacionDeLaConsulta[];
};

export type CrearConsultaInput = {
  medicamentoIds: string[];
  /** Opcional: puede ser el esquema de un paciente o una lista suelta. */
  pacienteId?: string | null;
  /** Opcional. Sin autenticacion se usa el medico del seed. */
  usuarioId?: string | null;
};

/**
 * Crea una consulta, evalua las interacciones y guarda todo.
 *
 * @throws ErrorDeNegocio si hay menos de dos medicamentos distintos, si alguno
 *   no existe o esta dado de baja, o si el paciente indicado no existe.
 */
export async function crearConsulta(
  input: CrearConsultaInput,
): Promise<ResultadoDeConsulta> {
  // 1. La regla `2..*` primero, antes de tocar la base. Tarea 5.07.
  const medicamentoIds = validarMedicamentosDeConsulta(input.medicamentoIds);

  let seudonimo: string | null = null;

  if (input.pacienteId) {
    const paciente = await db.paciente.findUnique({
      where: { id: input.pacienteId, activo: true },
    });
    if (!paciente) {
      throw new ErrorDeNegocio(
        "NO_ENCONTRADO",
        "El paciente no existe o esta dado de baja.",
        "pacienteId",
      );
    }
    seudonimo = paciente.seudonimo;
  }

  // 2. Los medicamentos, con su nombre y su RxCUI.
  const medicamentos = await db.medicamento.findMany({
    where: { id: { in: medicamentoIds }, activo: true },
    select: { id: true, nombre: true, rxcui: true },
  });

  // Se comparan las cantidades en vez de confiar en que estaban todos: un id
  // inventado o un medicamento dado de baja no puede entrar a una consulta sin
  // que nadie se entere.
  if (medicamentos.length !== medicamentoIds.length) {
    const encontrados = new Set(medicamentos.map((m) => m.id));
    const faltan = medicamentoIds.filter((id) => !encontrados.has(id));
    throw new ErrorDeNegocio(
      "NO_ENCONTRADO",
      `Hay ${faltan.length} medicamento(s) que no existen o estan dados de baja.`,
      "medicamentos",
    );
  }

  // 3. El cruce. Solo participan los que tienen RxCUI.
  const conRxcui = medicamentos.filter(
    (m): m is (typeof medicamentos)[number] & { rxcui: string } =>
      m.rxcui !== null,
  );
  const rxcuis = conRxcui.map((m) => m.rxcui);

  const [halladas, cubiertos] = await Promise.all([
    evaluarInteracciones(rxcuis),
    rxcuisConCobertura(rxcuis),
  ]);

  const enLaFuente = new Set(cubiertos);
  const porRxcui = new Map(conRxcui.map((m) => [m.rxcui, m]));

  const medicamentosDeLaConsulta: MedicamentoDeLaConsulta[] = medicamentos.map(
    (m) => ({
      ...m,
      evaluabilidad: calcularEvaluabilidad(m.rxcui, enLaFuente),
    }),
  );

  // 4. Las observaciones, con su texto ya compuesto.
  //
  // El texto se arma ACA y se guarda, en vez de componerlo al mostrarlo. Es lo
  // que hace que una consulta vieja siga diciendo lo mismo aunque cambie la
  // plantilla: el registro clinico es lo que se leyo ese dia, no lo que el
  // sistema diria hoy.
  const observaciones = halladas.map((i) => {
    const m1 = porRxcui.get(i.rxcui1);
    const m2 = porRxcui.get(i.rxcui2);

    // No puede pasar: el motor solo devuelve pares cuyos dos RxCUI estaban en
    // la lista que se le paso. Si pasara, callarlo guardaria una observacion
    // sin drogas, que es peor que fallar.
    if (!m1 || !m2) {
      throw new Error(
        `El motor devolvio un par (${i.rxcui1}, ${i.rxcui2}) que no esta entre los medicamentos consultados.`,
      );
    }

    return {
      medicamento1Id: m1.id,
      medicamento2Id: m2.id,
      severidad: i.severidad,
      descripcion: redactarObservacion({
        medicamento1: m1.nombre,
        medicamento2: m2.nombre,
        severidad: i.severidad,
        descripcionDeLaFuente: i.descripcion,
        fuente: i.fuente,
      }),
    };
  });

  // 5. Todo junto.
  //
  // Es una sola escritura anidada, y eso YA es una transaccion: Prisma envuelve
  // el `create` con sus anidados en una sola. No hace falta un `$transaction`
  // alrededor de una unica llamada, y ponerlo daria a entender que hay mas de
  // una operacion de la que preocuparse.
  //
  // Tampoco lleva nivel de aislamiento SERIALIZABLE como las escrituras de
  // stock: aca no se lee un saldo para decidir cuanto escribir. Son inserciones
  // que no dependen de lo que haya en la tabla.
  const consulta = await db.consultaInteraccion.create({
    data: {
      pacienteId: input.pacienteId ?? null,
      usuarioId: input.usuarioId ?? USUARIO_CLINICO_PROVISORIO_ID,
      medicamentosEvaluados: {
        create: medicamentoIds.map((medicamentoId) => ({ medicamentoId })),
      },
      observaciones: { create: observaciones },
    },
    select: {
      id: true,
      createdAt: true,
      observaciones: {
        select: {
          id: true,
          medicamento1: { select: { id: true, nombre: true } },
          medicamento2: { select: { id: true, nombre: true } },
          severidad: true,
          descripcion: true,
        },
      },
    },
  });

  // EL ORDEN SE VUELVE A IMPONER ACA, NO SE HEREDA.
  //
  // Seria comodo asumir que `create` anidado devuelve las filas en el orden en
  // que se le pasaron, y en la practica suele hacerlo. Pero no lo garantiza
  // nada: es el orden en que Postgres devuelve un `RETURNING`, y basta un plan
  // de consulta distinto para que cambie.
  //
  // Si cambiara, la unica consecuencia visible seria que las observaciones
  // salen desordenadas por severidad en la pantalla de resultado. Un defecto
  // silencioso, intermitente y dificil de reproducir: exactamente el tipo que
  // conviene no dejar posible.
  //
  // El par (medicamento1Id, medicamento2Id) identifica a la observacion dentro
  // de la consulta —un par no puede repetirse—, asi que se ordena por la
  // posicion que ese par tenia en lo que devolvio el motor.
  const posicion = new Map(
    observaciones.map((o, i) => [`${o.medicamento1Id}|${o.medicamento2Id}`, i]),
  );

  return {
    consultaId: consulta.id,
    fecha: consulta.createdAt,
    pacienteId: input.pacienteId ?? null,
    seudonimo,
    medicamentos: medicamentosDeLaConsulta,
    observaciones: [...consulta.observaciones].sort(
      (a, b) =>
        (posicion.get(`${a.medicamento1.id}|${a.medicamento2.id}`) ?? 0) -
        (posicion.get(`${b.medicamento1.id}|${b.medicamento2.id}`) ?? 0),
    ),
  };
}

/**
 * Relee una consulta guardada.
 *
 * **La cobertura se recalcula**, no estaba guardada: es lo que decidio la 0014.
 * Por eso una consulta vieja puede cambiar de "sin cobertura" a "evaluado" si
 * mas adelante entra una fuente que cubra esa droga. El texto de las
 * observaciones, en cambio, es el que se guardo ese dia y no se recompone.
 */
export async function obtenerConsulta(
  id: string,
): Promise<ResultadoDeConsulta | null> {
  const consulta = await db.consultaInteraccion.findUnique({
    where: { id },
    select: {
      id: true,
      createdAt: true,
      pacienteId: true,
      paciente: { select: { seudonimo: true } },
      medicamentosEvaluados: {
        select: {
          medicamento: { select: { id: true, nombre: true, rxcui: true } },
        },
      },
      observaciones: {
        select: {
          id: true,
          severidad: true,
          descripcion: true,
          medicamento1: { select: { id: true, nombre: true } },
          medicamento2: { select: { id: true, nombre: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!consulta) return null;

  const medicamentos = consulta.medicamentosEvaluados.map((e) => e.medicamento);
  const rxcuis = medicamentos
    .map((m) => m.rxcui)
    .filter((r): r is string => r !== null);
  const enLaFuente = new Set(await rxcuisConCobertura(rxcuis));

  return {
    consultaId: consulta.id,
    fecha: consulta.createdAt,
    pacienteId: consulta.pacienteId,
    seudonimo: consulta.paciente?.seudonimo ?? null,
    medicamentos: medicamentos.map((m) => ({
      ...m,
      evaluabilidad: calcularEvaluabilidad(m.rxcui, enLaFuente),
    })),
    observaciones: consulta.observaciones,
  };
}

// --- Listado de consultas (tarea 5.20) --------------------------------------
//
// Sin filtros y ordenado por fecha, de la mas reciente a la mas vieja. Es lo que
// pide la tarea y alcanza: en el prototipo el volumen es chico, y un filtro que
// nadie uso todavia es una decision tomada sin datos.
//
// LO QUE TRAE CADA FILA, Y POR QUE
//
// La fecha y el seudonimo dicen de que consulta se trata. **Las dos cuentas
// dicen algo mas dificil de reponer:** cuantos medicamentos entraron y cuantas
// interacciones salieron. Sin la primera, una consulta sin hallazgos se lee como
// vacia; con ella se ve que se evaluaron cuatro drogas y no salio nada, que es
// un resultado, no una fila rota.

export type ConsultaEnLista = {
  id: string;
  fecha: Date;
  /** El seudonimo, o null si fue una consulta suelta. */
  seudonimo: string | null;
  cantidadDeMedicamentos: number;
  cantidadDeObservaciones: number;
};

export async function listarConsultas(): Promise<ConsultaEnLista[]> {
  const filas = await db.consultaInteraccion.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      paciente: { select: { seudonimo: true } },
      // Las dos cuentas se resuelven en la misma consulta. Pedirlas por fila
      // seria una consulta por consulta, valga la redundancia.
      _count: { select: { medicamentosEvaluados: true, observaciones: true } },
    },
  });

  return filas.map((f) => ({
    id: f.id,
    fecha: f.createdAt,
    seudonimo: f.paciente?.seudonimo ?? null,
    cantidadDeMedicamentos: f._count.medicamentosEvaluados,
    cantidadDeObservaciones: f._count.observaciones,
  }));
}

/**
 * Consultas de interacciones registradas en el día de hoy (tarea 6.03).
 *
 * Considera las consultas desde el inicio del día (00:00:00) hasta la fecha de
 * referencia. Ordenadas de la más reciente a la más antigua.
 */
export async function obtenerConsultasDelDia(
  referencia: Date = new Date(),
): Promise<ConsultaEnLista[]> {
  const inicioDelDia = new Date(referencia);
  inicioDelDia.setHours(0, 0, 0, 0);

  const filas = await db.consultaInteraccion.findMany({
    where: {
      createdAt: { gte: inicioDelDia },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      paciente: { select: { seudonimo: true } },
      _count: { select: { medicamentosEvaluados: true, observaciones: true } },
    },
  });

  return filas.map((f) => ({
    id: f.id,
    fecha: f.createdAt,
    seudonimo: f.paciente?.seudonimo ?? null,
    cantidadDeMedicamentos: f._count.medicamentosEvaluados,
    cantidadDeObservaciones: f._count.observaciones,
  }));
}
