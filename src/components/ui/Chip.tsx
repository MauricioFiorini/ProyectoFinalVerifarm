// Etiqueta de estado (tarea 3.05, movida aca en la 5.13).
//
// POR QUE SE MUDO
//
// Vivia en `src/app/stock/indicadores.tsx`, o sea dentro de la carpeta de una
// ruta. Cuando la ficha del paciente (5.13) necesito lo mismo, la unica salida
// era importarlo desde ahi —una pantalla clinica dependiendo de un archivo de
// stock— o copiarlo. Es exactamente lo que ya paso con `unidades.ts` en la fase
// 4, y se resuelve igual: lo compartido sube.
//
// **Esto lleva `src/components/ui/` de cuatro archivos a cinco.** Los otros son
// Boton, Campo, Tabla y Modal. No se agrega un sexto sin una razon del mismo
// tipo: que dos rutas distintas necesiten lo mismo.
//
// Lo que NO se movio son `ChipDeEstado` y `ChipDeVencimiento`: esos traducen
// estados del modulo de stock y siguen en `indicadores.tsx`, que es su lugar.

type Props = {
  tono: "ok" | "advertencia" | "critico" | "neutro";
  children: React.ReactNode;
};

const TONOS = {
  ok: "bg-ok-fondo text-ok-texto border-ok-borde",
  advertencia:
    "bg-advertencia-fondo text-advertencia-texto border-advertencia-borde",
  critico: "bg-critico-fondo text-critico-texto border-critico-borde",
  // Para un estado que no es bueno ni malo, solo distinto del corriente: una
  // medicacion finalizada no es una alarma. Sin este tono habria que elegir
  // entre pintarla de verde, que dice "todo bien", o de amarillo, que avisa de
  // algo que no pasa.
  neutro: "bg-superficie-tenue text-texto-tenue border-borde",
} as const;

/**
 * Etiqueta de estado.
 *
 * El texto no es decorativo: quien no distingue los colores tiene que poder leer
 * el estado igual. Por eso nunca se usa un punto de color solo.
 */
export function Chip({ tono, children }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONOS[tono]}`}
    >
      {children}
    </span>
  );
}
