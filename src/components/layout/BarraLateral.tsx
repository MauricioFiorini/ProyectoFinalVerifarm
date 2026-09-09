"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Barra lateral de navegacion (tarea 6.01).
//
// Es de cliente por una sola razon: `usePathname` marca cual seccion esta
// abierta. Todo lo demas es estatico.
//
// POR QUE HAY ENTRADAS QUE NO SON ENLACES
//
// La tarea pide navegacion a las cinco secciones, pero dos de esas pantallas
// todavia no existen: /pacientes es la 5.11 y /consultas la 5.20. Ponerlas como
// enlace daria 404, que en una demostracion se lee como que el sistema esta
// roto. Se muestran igual, marcadas como pendientes, porque el mapa completo
// del sistema es informacion util: dice que hay dos modulos y que uno esta a
// medio construir.
//
// Cuando esas pantallas existan, alcanza con sacarles `pendiente: true`.

type Seccion = {
  href: string;
  etiqueta: string;
  /** Sin `href` valido todavia: la pantalla es de una tarea que no se hizo. */
  pendiente?: boolean;
  /** La tarea del roadmap que la habilita. Solo para las pendientes. */
  tarea?: string;
};

const SECCIONES: Seccion[] = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/medicamentos", etiqueta: "Medicamentos" },
  { href: "/stock", etiqueta: "Stock" },
  { href: "/pacientes", etiqueta: "Pacientes" },
  { href: "/consultas", etiqueta: "Consultas" },
];

/**
 * Inicio solo esta activo en la raiz exacta. Las demas secciones tambien lo
 * estan en sus subrutas: estando en /stock/abc123 la seccion abierta sigue
 * siendo Stock.
 */
function estaActiva(href: string, ruta: string): boolean {
  if (href === "/") return ruta === "/";
  return ruta === href || ruta.startsWith(`${href}/`);
}

export function BarraLateral() {
  const ruta = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="shrink-0 border-b border-borde bg-superficie md:w-56 md:border-r md:border-b-0"
    >
      <div className="flex items-center gap-2 px-5 py-4 md:py-5">
        <span className="text-lg font-semibold tracking-tight text-marca-600">
          Verifarm
        </span>
      </div>

      {/* En pantalla angosta la barra pasa arriba y las secciones se leen en
          fila. Si no entran, se desplazan en horizontal en vez de romper el
          layout. La revision responsive completa es la 6.05. */}
      <ul className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-5">
        {SECCIONES.map((seccion) => (
          <li key={seccion.href} className="shrink-0 md:shrink">
            {seccion.pendiente ? (
              <span
                // No es un enlace: no hay adonde ir. Se marca como
                // deshabilitado para que un lector de pantalla no lo anuncie
                // como algo que se puede activar.
                aria-disabled="true"
                title={`Todavía no implementada (tarea ${seccion.tarea})`}
                className="flex cursor-not-allowed items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-texto-sutil"
              >
                {seccion.etiqueta}
                <span className="rounded border border-borde px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide">
                  Pendiente
                </span>
              </span>
            ) : (
              <Link
                href={seccion.href}
                aria-current={
                  estaActiva(seccion.href, ruta) ? "page" : undefined
                }
                className={[
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600",
                  estaActiva(seccion.href, ruta)
                    ? "bg-marca-50 text-marca-700"
                    : "text-texto-tenue hover:bg-superficie-tenue hover:text-texto",
                ].join(" ")}
              >
                {seccion.etiqueta}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
