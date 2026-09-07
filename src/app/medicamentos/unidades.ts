import { UnidadMedida } from "@prisma/client";

// Nombres legibles de las unidades de medida.
//
// El enum guarda "COMPRIMIDO" y en pantalla tiene que decir "Comprimido". Vive
// al lado de las pantallas que lo usan —la tabla de la 3.06 y el select de la
// 3.07— y no en src/types/, que es donde estan los esquemas de validacion.
//
// El Record esta tipado contra el enum a proposito: si alguien agrega una unidad
// en schema.prisma y se olvida de nombrarla aca, no compila.

export const NOMBRE_DE_UNIDAD: Record<UnidadMedida, string> = {
  MG: "Miligramos",
  ML: "Mililitros",
  G: "Gramos",
  UI: "Unidades internacionales",
  COMPRIMIDO: "Comprimido",
  AMPOLLA: "Ampolla",
  GOTA: "Gota",
};

/** Opciones para el select del modal de alta, en el orden en que se muestran. */
export const OPCIONES_DE_UNIDAD = (
  Object.keys(NOMBRE_DE_UNIDAD) as UnidadMedida[]
).map((valor) => ({ valor, texto: NOMBRE_DE_UNIDAD[valor] }));
