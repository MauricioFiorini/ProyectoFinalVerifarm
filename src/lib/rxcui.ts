// Orden canonico de un par de RxCUI (tarea 5.02).
//
// POR QUE EXISTE ESTE ARCHIVO
//
// `Interaccion` tiene `@@unique([rxcui1, rxcui2])`, y una interaccion no tiene
// direccion: que la fluoxetina interactue con la fenelzina es exactamente lo
// mismo que al reves. Si una fila entra como (A, B) y otra como (B, A), la
// restriccion de unicidad no las ve como duplicadas y la tabla termina con la
// misma interaccion dos veces.
//
// Peor: el motor de interacciones (5.06) buscaria por un orden y encontraria la
// fila cargada con el otro. **Una interaccion no detectada es el peor error que
// puede cometer este sistema.**
//
// La solucion es que TODO —la carga y la consulta— use la misma funcion para
// decidir cual va primero. El esquema ya lo pedia; esto lo hace cumplible.
//
// El criterio es comparacion de cadenas, no numerica: los RxCUI son
// identificadores, no cantidades. Lo unico que importa es que sea siempre el
// mismo criterio.

/**
 * Devuelve el par ordenado de forma canonica.
 *
 * Cualquier lugar que escriba o consulte `Interaccion` tiene que pasar por
 * aca. No hay una segunda forma valida de ordenar.
 */
export function ordenarParRxcui(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}
