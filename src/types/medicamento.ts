import { z } from "zod";
import { UnidadMedida } from "@prisma/client";

// Validacion de entrada para Medicamento (tarea 3.02).
//
// DONDE SE USA: en los route handlers, antes de llamar al servicio. Contesta
// "¿esto tiene la forma correcta?" mirando el JSON que llego.
//
// LO QUE NO VA ACA: las reglas del dominio. "No puede haber dos medicamentos con
// el mismo nombre" necesita ir a la base, asi que vive en src/services/. La
// diferencia esta explicada en docs/ARQUITECTURA.md seccion 4.

/**
 * El nombre es el PRINCIPIO ACTIVO, sin dosis ni concentracion.
 *
 * Con la dosis adentro, "Paracetamol 500mg" y "Paracetamol 1g" son cadenas
 * distintas y la restriccion de nombre unico no impide cargar la misma droga dos
 * veces. Ver docs/decisiones/0006-el-nombre-no-lleva-la-dosis.md
 *
 * El control de abajo es una AYUDA, no una prueba: detecta el caso comun —un
 * numero seguido de una unidad— y no puede garantizar que no entre una dosis
 * escrita de otra forma. Para eso esta la revision humana.
 */
const PATRON_DOSIS = /\d+\s*(mg|ml|g|mcg|ui|%)\b/i;

const nombre = z
  .string()
  .trim()
  .min(1, "El nombre de la droga no puede estar vacio.")
  // No es una regla del dominio, es un limite para no aceptar entradas absurdas.
  .max(200, "El nombre no puede superar los 200 caracteres.")
  .refine((v) => !PATRON_DOSIS.test(v), {
    message:
      "El nombre es el principio activo, sin dosis: 'Paracetamol', no 'Paracetamol 500mg'.",
  });

/**
 * RxCUI: opcional, y solo digitos cuando viene.
 *
 * Es opcional por decision (0005): un rxcui ausente se ve y se avisa; uno
 * inventado no se ve y produce un resultado falso. Los identificadores de RxNorm
 * son numericos, asi que se rechaza cualquier otra cosa.
 *
 * La cadena vacia se trata como ausencia: un formulario manda "" cuando el campo
 * quedo en blanco, y eso significa "no lo cargaron", no "el codigo es vacio".
 */
const rxcui = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .refine((v) => v === null || /^\d+$/.test(v), {
    message: "El RxCUI es un identificador numerico de RxNorm.",
  })
  .optional();

export const esquemaCrearMedicamento = z.object({
  nombre,
  rxcui,
  unidad: z.enum(UnidadMedida, {
    message: "La unidad de medida no es una de las permitidas.",
  }),
  stockMinimo: z
    .number()
    .int("El stock minimo tiene que ser un numero entero.")
    .min(0, "El stock minimo no puede ser negativo.")
    .optional(),
});

export type CrearMedicamentoEntrada = z.infer<typeof esquemaCrearMedicamento>;

/**
 * Filtro del listado. `buscar` es el texto del buscador de la pantalla de
 * medicamentos; si no viene, se listan todos.
 */
export const esquemaListarMedicamentos = z.object({
  buscar: z.string().trim().optional(),
});

export type ListarMedicamentosEntrada = z.infer<
  typeof esquemaListarMedicamentos
>;
