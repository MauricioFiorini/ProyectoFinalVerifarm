import type { ReactNode } from "react";

// Tabla base (tarea 3.05).
//
// Generica: recibe las columnas y las filas, y cada columna dice como se dibuja
// su celda. Eso permite que la misma tabla sirva para medicamentos, lotes,
// movimientos y consultas sin que ninguna pantalla reescriba el `<table>`.
//
// LO QUE NO HACE, A PROPOSITO
//
// No maneja "cargando" ni "error". Esos son estados de la PANTALLA, no de la
// tabla: la pantalla decide si muestra la tabla, un indicador de carga o un
// mensaje con boton de reintentar. Es la tarea 3.08.
//
// Tampoco ordena ni pagina. Ninguna tarea del prototipo lo pide.

export type Columna<T> = {
  /** Clave estable, para React y para identificar la columna. */
  clave: string;
  /** Texto del encabezado. */
  encabezado: ReactNode;
  /** Como se dibuja la celda de esta columna para una fila dada. */
  celda: (fila: T) => ReactNode;
  /**
   * Alineacion. Los numeros van a la derecha: asi las unidades quedan alineadas
   * entre filas y la columna se lee de un vistazo.
   */
  alineacion?: "izquierda" | "derecha";
};

type Props<T> = {
  columnas: Columna<T>[];
  filas: T[];
  /** Clave unica de cada fila. Casi siempre el id. */
  claveDeFila: (fila: T) => string;
  /** Que mostrar cuando no hay filas. */
  mensajeVacio?: ReactNode;
  /** Descripcion de la tabla para lectores de pantalla. */
  descripcion?: string;
  /**
   * Ancho mínimo de la tabla para evitar compresión de celdas y garantizar
   * desplazamiento horizontal limpio en dispositivos reducidos o notebooks (tarea 6.05).
   */
  anchoMinimo?: string;
};

export function Tabla<T>({
  columnas,
  filas,
  claveDeFila,
  mensajeVacio = "No hay datos para mostrar.",
  descripcion,
  anchoMinimo = "min-w-[600px]",
}: Props<T>) {
  const alinear = (c: Columna<T>) =>
    c.alineacion === "derecha" ? "text-right" : "text-left";

  return (
    // El contenedor scrollea solo la tabla. Sin esto, una tabla ancha empuja el
    // ancho de toda la pagina y aparece scroll horizontal en el body.
    <div className="w-full overflow-x-auto rounded-lg border border-borde bg-superficie">
      <table className={`w-full border-collapse text-sm ${anchoMinimo}`}>
        {descripcion ? (
          <caption className="sr-only">{descripcion}</caption>
        ) : null}

        <thead>
          <tr className="border-b border-borde bg-superficie-tenue">
            {columnas.map((c) => (
              <th
                key={c.clave}
                scope="col"
                className={`px-4 py-3 text-xs font-semibold tracking-wide text-texto-sutil uppercase ${alinear(c)}`}
              >
                {c.encabezado}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filas.length === 0 ? (
            <tr>
              <td
                colSpan={columnas.length}
                className="px-4 py-10 text-center text-texto-tenue"
              >
                {mensajeVacio}
              </td>
            </tr>
          ) : (
            filas.map((fila) => (
              <tr
                key={claveDeFila(fila)}
                className="border-b border-borde last:border-b-0 hover:bg-superficie-tenue"
              >
                {columnas.map((c) => (
                  <td
                    key={c.clave}
                    className={`px-4 py-3 text-texto ${alinear(c)}`}
                  >
                    {c.celda(fila)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
