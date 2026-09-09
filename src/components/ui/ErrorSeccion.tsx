import type { ReactNode } from "react";
import { Boton } from "./Boton";

// Componente de error por sección (tarea 6.04).
//
// Unifica la presentación visual y la accesibilidad para estados de fallo
// en la carga de datos o peticiones HTTP en cualquier sección o tabla del
// sistema.
//
// Es el séptimo componente de src/components/ui/ (junto a Boton, Campo, Tabla,
// Modal, Chip y AvisoClinico), justificando su presencia acá al ser consumido
// transversalmente por múltiples rutas de la aplicación.

type Props = {
  /** Mensaje explicativo del error. */
  mensaje?: string;
  /** Título o encabezado opcional para contextualizar el error. */
  titulo?: string;
  /** Función que se ejecuta al presionar "Reintentar". Si no se pasa, no se muestra el botón. */
  alReintentar?: () => void;
  /** Clases CSS adicionales para ajustar el espaciado o dimensiones. */
  className?: string;
  /** Contenido adicional o secundario opcional. */
  children?: ReactNode;
};

export function ErrorSeccion({
  mensaje = "No se pudieron cargar los datos.",
  titulo,
  alReintentar,
  className = "",
  children,
}: Props) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-critico-borde bg-critico-fondo px-6 py-10 text-center text-critico-texto",
        className,
      ].join(" ")}
    >
      {titulo ? <h3 className="text-base font-semibold">{titulo}</h3> : null}
      <p className="text-sm">{mensaje}</p>
      {children}
      {alReintentar ? (
        <div className="mt-1">
          <Boton onClick={alReintentar}>Reintentar</Boton>
        </div>
      ) : null}
    </div>
  );
}
