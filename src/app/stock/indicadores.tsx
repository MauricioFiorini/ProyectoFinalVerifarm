import type { EstadoDeStock, EstadoDeVencimiento } from "@/services/stock";

// Indicadores visuales del modulo de stock (tareas 4.11 y 4.17).
//
// Los colores salen de los tokens de estado de la 1.10 —ok, advertencia,
// critico— y no de hex escritos a mano. Ese es todo el sistema de color de
// estado que tiene el proyecto: no se agregan mas.

type PropsChip = {
  tono: "ok" | "advertencia" | "critico";
  children: React.ReactNode;
};

const TONOS = {
  ok: "bg-ok-fondo text-ok-texto border-ok-borde",
  advertencia:
    "bg-advertencia-fondo text-advertencia-texto border-advertencia-borde",
  critico: "bg-critico-fondo text-critico-texto border-critico-borde",
} as const;

/**
 * Etiqueta de estado.
 *
 * El texto no es decorativo: quien no distingue los colores tiene que poder leer
 * el estado igual. Por eso nunca se usa un punto de color solo.
 */
export function Chip({ tono, children }: PropsChip) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONOS[tono]}`}
    >
      {children}
    </span>
  );
}

const ESTADO_DE_STOCK: Record<
  EstadoDeStock,
  { tono: PropsChip["tono"]; texto: string }
> = {
  BAJO_MINIMO: { tono: "critico", texto: "Bajo mínimo" },
  POR_VENCER: { tono: "advertencia", texto: "Lote por vencer" },
  NORMAL: { tono: "ok", texto: "Normal" },
};

export function ChipDeEstado({ estado }: { estado: EstadoDeStock }) {
  const { tono, texto } = ESTADO_DE_STOCK[estado];
  return <Chip tono={tono}>{texto}</Chip>;
}

const ESTADO_DE_VENCIMIENTO: Record<
  EstadoDeVencimiento,
  { tono: PropsChip["tono"]; texto: (dias: number) => string }
> = {
  VENCIDO: {
    tono: "critico",
    // Se dice hace cuanto, no solo que vencio: un lote vencido ayer y uno
    // vencido hace un año piden acciones distintas.
    texto: (d) => (d === 0 ? "Vencido" : `Vencido hace ${Math.abs(d)} d.`),
  },
  POR_VENCER: {
    tono: "advertencia",
    texto: (d) => (d === 0 ? "Vence hoy" : `Vence en ${d} d.`),
  },
  VIGENTE: { tono: "ok", texto: () => "Vigente" },
};

export function ChipDeVencimiento({
  estado,
  diasParaVencer,
}: {
  estado: EstadoDeVencimiento;
  diasParaVencer: number;
}) {
  const { tono, texto } = ESTADO_DE_VENCIMIENTO[estado];
  return <Chip tono={tono}>{texto(diasParaVencer)}</Chip>;
}
