import type { ButtonHTMLAttributes, ReactNode } from "react";

// Boton base (tarea 3.05).
//
// Tailwind puro, sin bibliotecas de componentes: todo lo que se ve lo escribimos
// nosotros y lo podemos explicar en la defensa. Ver docs/CONVENCIONES.md
// seccion 9.
//
// Los colores salen de los tokens de src/app/globals.css, que estan muestreados
// de los mockups. Ningun hex escrito a mano.

export type VarianteBoton = "primario" | "secundario" | "critico";

const VARIANTES: Record<VarianteBoton, string> = {
  // Accion principal de la pantalla: "Guardar", "Registrar", "Confirmar egreso".
  primario:
    "bg-marca-600 text-superficie border-marca-600 hover:bg-marca-700 hover:border-marca-700 focus-visible:outline-marca-600",
  // Acompaña a la primaria: "Cancelar", "Reintentar", "Ver lotes".
  secundario:
    "bg-superficie text-texto border-borde hover:bg-superficie-tenue focus-visible:outline-marca-600",
  // Para lo que el usuario no puede deshacer. En el prototipo casi no se usa: el
  // historial de movimientos es inmutable, asi que no hay botones de borrar.
  critico:
    "bg-critico-fondo text-critico-texto border-critico-borde hover:bg-critico-suave focus-visible:outline-critico-texto",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton;
  children: ReactNode;
};

export function Boton({
  variante = "secundario",
  className = "",
  type = "button",
  children,
  ...resto
}: Props) {
  return (
    <button
      // Por defecto `type="button"`: un boton dentro de un <form> sin type envia
      // el formulario, que es una fuente clasica de envios accidentales.
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md border",
        "px-4 py-2 text-sm font-medium",
        "transition-colors",
        // Foco visible solo por teclado: el mouse no dibuja el anillo.
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        // `disabled:` cubre tambien el boton deshabilitado del aviso de
        // existencia insuficiente (tarea 4.15).
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTES[variante],
        className,
      ].join(" ")}
      {...resto}
    >
      {children}
    </button>
  );
}
