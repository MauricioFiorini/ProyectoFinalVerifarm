import { z } from "zod";

// Validacion de entrada del modulo clinico (tarea 5.10).
//
// Igual que en `medicamento.ts` y `lote.ts`: aca se contesta "¿esto tiene la
// forma correcta?". Las reglas del dominio viven en `src/services/` y NO se
// repiten aca. Ver docs/ARQUITECTURA.md seccion 4.
//
// DONDE SE NOTA ESA SEPARACION EN ESTE ARCHIVO
//
// `medicamentoIds` NO lleva `.min(2)`, aunque una consulta necesite al menos dos
// medicamentos. Esa es la restriccion `2..*` del modelo, o sea una regla del
// dominio, y la aplica `validarMedicamentosDeConsulta` (tarea 5.07).
//
// No es una distincion academica: cambia lo que ve el usuario. Con Zod la
// respuesta seria 400 "los datos enviados no son validos", que suena a que el
// programa esta roto. Desde el servicio es 422 con "una consulta necesita al
// menos 2 medicamentos", que es lo que hay que leer.

const identificador = z.string().trim().min(1);

/**
 * Fecha que llega por JSON. Mismo criterio que en `lote.ts`: `coerce` acepta
 * tanto "2026-09-08" de un <input type="date"> como una cadena ISO completa, y
 * el refinamiento descarta lo que no se pueda interpretar, porque
 * `new Date("hola")` no falla: devuelve un Date invalido que rompe mas lejos.
 */
const fecha = z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), {
  message: "La fecha no es valida.",
});

// --- Pacientes --------------------------------------------------------------

export const esquemaCrearPaciente = z.object({
  /**
   * El seudonimo, y nada mas. **No hay ningun otro campo y no es que falte:**
   * el paciente no lleva datos filiatorios (docs/CONTEXTO.md seccion 3).
   *
   * Que el largo minimo y el rechazo de un DNI esten en el servicio y no aca es
   * a proposito: son reglas del dominio, no de la forma del JSON.
   */
  seudonimo: z.string().trim().min(1, "El seudonimo no puede estar vacio."),
});

export type CrearPacienteEntrada = z.infer<typeof esquemaCrearPaciente>;

export const esquemaListarPacientes = z.object({
  buscar: z.string().trim().optional(),
});

// --- Medicacion -------------------------------------------------------------

export const esquemaListarMedicacion = z.object({
  pacienteId: identificador,
  /**
   * Por defecto solo la vigente.
   *
   * El valor seguro es el mas chico: la evaluacion de interacciones tiene que
   * correr sobre la medicacion vigente, y si el defecto trajera el historial,
   * olvidarse este parametro daria un falso positivo por una droga que el
   * paciente ya no toma. La ficha del paciente (5.13), que si quiere todo, lo
   * pide explicitamente.
   */
  incluirNoVigentes: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

export const esquemaAgregarMedicacion = z.object({
  pacienteId: identificador,
  medicamentoId: identificador,
  fechaInicio: fecha,
});

export type AgregarMedicacionEntrada = z.infer<typeof esquemaAgregarMedicacion>;

export const esquemaSuspenderMedicacion = z.object({
  medicacionId: identificador,
  /**
   * El motivo es obligatorio, y el largo minimo lo comprueba el servicio: aca
   * solo se exige que el campo venga y sea texto.
   */
  motivo: z.string(),
  fechaFin: fecha.optional(),
});

export type SuspenderMedicacionEntrada = z.infer<
  typeof esquemaSuspenderMedicacion
>;

// --- Consultas --------------------------------------------------------------

export const esquemaCrearConsulta = z.object({
  /** Sin `.min(2)`: ver la nota de arriba. */
  medicamentoIds: z.array(identificador),
  /** Opcional: sin paciente es la consulta suelta del medico de guardia. */
  pacienteId: identificador.optional(),
  /**
   * Opcional. Sin autenticacion, quien consulta lo dice el cliente.
   *
   * **Se acepta del pedido a sabiendas de que no esta verificado.** No hay
   * sesion contra la cual comprobarlo: la autenticacion esta fuera del alcance
   * (docs/CONTEXTO.md seccion 6) y la 6.02 es un selector simulado. Si no viene,
   * el servicio usa el medico del seed.
   *
   * El dia que haya sesion, este campo sale del cuerpo del pedido y pasa a
   * salir de ahi.
   */
  usuarioId: identificador.optional(),
});

export type CrearConsultaEntrada = z.infer<typeof esquemaCrearConsulta>;

export const esquemaObtenerConsulta = z.object({
  id: identificador,
});
