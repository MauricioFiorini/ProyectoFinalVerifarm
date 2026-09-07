import { UnidadMedida } from "@prisma/client";

// Nombres legibles de las unidades de medida.
//
// El enum guarda "COMPRIMIDO" y en pantalla tiene que decir "Comprimido".
//
// Vive en src/lib/ y no dentro de la carpeta de una ruta porque lo usan dos
// pantallas: la de medicamentos (3.06 y 3.07) y la de stock (4.11).
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
