import { db } from "../lib/db";
import { Severidad } from "@prisma/client";
import { ordenarParRxcui } from "../lib/rxcui";
import { ErrorDeNegocio } from "./errores";

// Motor de interacciones (tarea 5.06).
//
// QUE HACE
//
// Recibe una lista de RxCUI —los principios activos que el paciente toma, o los
// que el medico quiere evaluar— y devuelve todos los pares de esa lista que
// figuran en la tabla `Interaccion`.
//
// ES DETERMINISTICO, Y ESO NO ES UN ADORNO
//
// No consulta ninguna fuente externa, no usa un modelo de lenguaje y no depende
// de la hora ni del orden en que le pasen las drogas. La misma lista devuelve
// siempre el mismo resultado, y ese resultado se puede rastrear hasta la fila
// que lo produjo y hasta la fuente que la cargo. En un sistema que asiste una
// decision clinica, poder explicar por que salio un aviso es parte del aviso.
//
// LO QUE NO HACE
//
// No decide nada. Informa. Ninguna funcion de este archivo bloquea, impide ni
// recomienda: devuelven lo que hay cargado. Ver docs/CONTEXTO.md seccion 3.
//
// Tampoco distingue gravedades hoy: la fuente cargada no publica una escala y
// todas sus filas entran como ALTA (decision 0011). El ordenamiento por
// severidad esta escrito igual, porque el campo existe y otra fuente podria
// traer grados.

/** Una interaccion encontrada, tal como esta cargada. */
export type InteraccionDetectada = {
  rxcui1: string;
  rxcui2: string;
  severidad: Severidad;
  descripcion: string;
  fuente: string;
};

/** Para ordenar de lo mas grave a lo menos, que es como lo pide la 5.18. */
const ORDEN_DE_SEVERIDAD: Record<Severidad, number> = {
  ALTA: 0,
  MEDIA: 1,
  BAJA: 2,
};

/**
 * Todos los pares distintos que se pueden formar con la lista, en orden
 * canonico y sin repetir.
 *
 * Funcion pura. Es la parte del motor que se puede verificar con datos escritos
 * a mano, igual que se hizo con FEFO en la 4.07.
 *
 * Tres cosas que hace y conviene que haga:
 *
 * - **Descarta repetidos.** Si la misma droga llega dos veces, no se cruza
 *   consigo misma ni duplica pares.
 * - **Ordena la entrada antes de combinar.** Asi la salida no depende del orden
 *   en que llegaron las drogas: es lo que hace determinista al motor.
 * - **Ordena cada par con `ordenarParRxcui`**, que es el mismo criterio con el
 *   que se cargo la tabla.
 */
export function combinarPares(rxcuis: string[]): [string, string][] {
  const unicos = [...new Set(rxcuis)].sort();
  const pares: [string, string][] = [];

  // `entries()` en vez de indices sueltos: con `noUncheckedIndexedAccess`
  // prendido, `unicos[i]` es `string | undefined` y habria que descartar un
  // caso que no puede pasar.
  for (const [i, a] of unicos.entries()) {
    for (const b of unicos.slice(i + 1)) {
      pares.push(ordenarParRxcui(a, b));
    }
  }

  return pares;
}

/**
 * Las interacciones registradas entre las drogas de la lista.
 *
 * SOBRE LA CONSULTA
 *
 * Se resuelve con una sola consulta: las filas donde **los dos** RxCUI estan en
 * la lista. Con N drogas hay N(N-1)/2 pares, y preguntarlos de a uno serian 45
 * consultas para un paciente con diez drogas.
 *
 * Esa forma tiene ademas una propiedad que la otra no: **no depende de que la
 * tabla este ordenada canonicamente**. Si una fila estuviera cargada como
 * (B, A), la consulta la encuentra igual, porque solo pide que los dos codigos
 * pertenezcan al conjunto. Preguntando par por par —`rxcui1 = a AND rxcui2 = b`—
 * esa fila se perderia en silencio, y una interaccion no detectada es el peor
 * error que puede cometer este sistema.
 *
 * El orden canonico sigue importando para que la misma interaccion no este
 * cargada dos veces; para encontrarla, esta consulta no lo necesita.
 */
export async function evaluarInteracciones(
  rxcuis: string[],
): Promise<InteraccionDetectada[]> {
  const unicos = [...new Set(rxcuis)];

  // Con menos de dos drogas no hay ningun par que evaluar. Se corta antes de ir
  // a la base, que si no devolveria todas las filas donde una droga aparece con
  // cualquier otra.
  if (unicos.length < 2) return [];

  const filas = await db.interaccion.findMany({
    where: { rxcui1: { in: unicos }, rxcui2: { in: unicos } },
    select: {
      rxcui1: true,
      rxcui2: true,
      severidad: true,
      descripcion: true,
      fuente: true,
    },
  });

  // El orden se decide aca y no en la base: la severidad es un enum y confiar en
  // el orden en que Postgres devuelve sus valores es confiar en un detalle de
  // implementacion. Con el desempate por RxCUI, dos corridas con los mismos
  // datos dan exactamente la misma lista.
  return filas
    .map((f) => {
      const [rxcui1, rxcui2] = ordenarParRxcui(f.rxcui1, f.rxcui2);
      return { ...f, rxcui1, rxcui2 };
    })
    .sort(
      (a, b) =>
        ORDEN_DE_SEVERIDAD[a.severidad] - ORDEN_DE_SEVERIDAD[b.severidad] ||
        a.rxcui1.localeCompare(b.rxcui1) ||
        a.rxcui2.localeCompare(b.rxcui2),
    );
}

/**
 * Cuales de esos RxCUI aparecen en la fuente cargada, en cualquier par.
 *
 * POR QUE HACE FALTA
 *
 * Porque **"no se encontraron interacciones" y "no hay datos de esta droga" son
 * dos cosas distintas**, y mostrarlas igual seria el peor error de interfaz que
 * este sistema puede cometer.
 *
 * ONCHigh no cubre todas las drogas del catalogo: el clonazepam, que es de los
 * psicofarmacos mas usados en la institucion, no esta. Evaluar un esquema con
 * clonazepam y decir "sin interacciones" da a entender que se lo reviso y esta
 * limpio, cuando lo que paso es que no habia contra que revisarlo.
 *
 * Con esto la pantalla puede distinguir los tres casos que fija la decision
 * 0012: sin interacciones, sin `rxcui`, y sin cobertura de la fuente.
 */
export async function rxcuisConCobertura(rxcuis: string[]): Promise<string[]> {
  const unicos = [...new Set(rxcuis)];
  if (unicos.length === 0) return [];

  const filas = await db.interaccion.findMany({
    where: {
      OR: [{ rxcui1: { in: unicos } }, { rxcui2: { in: unicos } }],
    },
    select: { rxcui1: true, rxcui2: true },
  });

  const enLaFuente = new Set<string>();
  for (const f of filas) {
    enLaFuente.add(f.rxcui1);
    enLaFuente.add(f.rxcui2);
  }

  // Se devuelven solo los preguntados: las filas traen ademas la otra droga del
  // par, que no viene al caso.
  return unicos.filter((r) => enLaFuente.has(r)).sort();
}

// --- Que una consulta necesita al menos dos medicamentos (tarea 5.07) --------
//
// POR QUE ESTO NO ESTA ADENTRO DEL MOTOR
//
// `evaluarInteracciones` con una sola droga devuelve lista vacia, y esta bien
// que asi sea: la pregunta que responde es "cuales de estas interactuan", y con
// una sola droga la respuesta honesta es "ninguna". Es una consulta, y una
// consulta no tiene por que fallar.
//
// Lo que no puede pasar es que ESO llegue a la pantalla como "no se encontraron
// interacciones". Con una sola droga no se encontro nada porque no habia nada
// que buscar, y mostrarlo igual que un esquema de cinco drogas revisado y limpio
// es dar por revisado lo que nunca se reviso.
//
// Asi que la regla se cumple un escalon mas arriba: la consulta se rechaza antes
// de evaluar nada. Es la restriccion `2..*` del modelo, que hasta ahora vivia
// solo en el diagrama.
//
// SE CUENTAN MEDICAMENTOS, NO RxCUI
//
// Un medicamento sin `rxcui` igual cuenta. No se puede cruzar contra la tabla de
// interacciones (decision 0005), pero la consulta con esos dos medicamentos es
// legitima: se hizo, y el sistema tiene que decir que de uno de los dos no tiene
// datos. Filtrar por `rxcui` aca convertiria "no tengo el codigo de esta droga"
// en "elegiste mal", que son cosas distintas.

/** Restriccion `2..*` del modelo: una interaccion es entre dos cosas. */
export const MINIMO_DE_MEDICAMENTOS = 2;

/**
 * Valida los medicamentos de una consulta y devuelve la lista sin repetidos.
 *
 * Devuelve la lista deduplicada en vez de solo validar, para que quien la llama
 * no tenga que volver a hacer el mismo `Set`. Si se dedujera dos veces y una de
 * las dos cambiara, la validacion y lo que se evalua dejarian de coincidir.
 *
 * @throws ErrorDeNegocio si hay menos de dos medicamentos distintos.
 */
export function validarMedicamentosDeConsulta(
  medicamentoIds: string[],
): string[] {
  // El mismo medicamento elegido dos veces no son dos medicamentos. Puede pasar
  // en la pantalla de consulta (5.16) al precargar la medicacion del paciente
  // (5.17) y agregar a mano una droga que ya estaba.
  const unicos = [...new Set(medicamentoIds)];

  if (unicos.length < MINIMO_DE_MEDICAMENTOS) {
    throw new ErrorDeNegocio(
      "REGLA_DE_NEGOCIO",
      unicos.length === medicamentoIds.length
        ? `Una consulta de interacciones necesita al menos ${MINIMO_DE_MEDICAMENTOS} medicamentos. Se recibieron ${unicos.length}.`
        : `Una consulta de interacciones necesita al menos ${MINIMO_DE_MEDICAMENTOS} medicamentos DISTINTOS. Se recibieron ${medicamentoIds.length}, pero son ${unicos.length}.`,
      "medicamentos",
    );
  }

  return unicos;
}
