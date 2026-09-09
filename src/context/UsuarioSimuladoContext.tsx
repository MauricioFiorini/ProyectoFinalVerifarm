"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  USUARIO_DEFECTO,
  USUARIOS_SIMULADOS,
  type UsuarioSimulado,
} from "@/lib/usuariosSemilla";

// Contexto de usuario simulado (tarea 6.02).
//
// POR QUE EXISTE
//
// El prototipo no tiene autenticacion ni sesiones reales (docs/CONTEXTO.md seccion 6).
// Para la defensa y uso diario se requiere poder alternar entre los tres roles
// del dominio (Farmaceutico, Medico y Administrador) para que las operaciones
// (movimientos, dispensacion, consultas) queden registradas con el usuario
// que estaba activo en la barra superior.
//
// POR QUE useSyncExternalStore EN VEZ DE useEffect + useState
//
// Leer localStorage dentro de un useEffect con setState provoca la advertencia
// react-hooks/set-state-in-effect y un re-render en cascada. useSyncExternalStore
// sincroniza el estado del navegador con el renderizado de forma nativa en
// React 18/19, previene parpadeos y soporta sincronizacion entre pestanas.

const CLAVE_STORAGE = "verifarm_usuario_simulado_id";
const EVENTO_CAMBIO = "verifarm:usuario_simulado_cambio";

function suscribir(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("storage", callback);
  window.addEventListener(EVENTO_CAMBIO, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENTO_CAMBIO, callback);
  };
}

function obtenerSnapshot(): string {
  if (typeof window === "undefined") return USUARIO_DEFECTO.id;
  try {
    return localStorage.getItem(CLAVE_STORAGE) ?? USUARIO_DEFECTO.id;
  } catch {
    return USUARIO_DEFECTO.id;
  }
}

function obtenerServerSnapshot(): string {
  return USUARIO_DEFECTO.id;
}

type ContextoUsuarioSimulado = {
  usuario: UsuarioSimulado;
  usuarios: readonly UsuarioSimulado[];
  cambiarUsuario: (id: string) => void;
};

const UsuarioSimuladoContext = createContext<ContextoUsuarioSimulado | null>(
  null,
);

export function UsuarioSimuladoProvider({ children }: { children: ReactNode }) {
  const idActivo = useSyncExternalStore(
    suscribir,
    obtenerSnapshot,
    obtenerServerSnapshot,
  );

  const usuario =
    USUARIOS_SIMULADOS.find((u) => u.id === idActivo) ?? USUARIO_DEFECTO;

  const cambiarUsuario = useCallback((id: string) => {
    const elegido = USUARIOS_SIMULADOS.find((u) => u.id === id);
    if (!elegido) return;

    try {
      localStorage.setItem(CLAVE_STORAGE, id);
    } catch {
      // Ignorar fallo de almacenamiento si las cookies/storage están bloqueadas.
    }
    window.dispatchEvent(new Event(EVENTO_CAMBIO));
  }, []);

  return (
    <UsuarioSimuladoContext.Provider
      value={{
        usuario,
        usuarios: USUARIOS_SIMULADOS,
        cambiarUsuario,
      }}
    >
      {children}
    </UsuarioSimuladoContext.Provider>
  );
}

export function useUsuarioSimulado(): ContextoUsuarioSimulado {
  const contexto = useContext(UsuarioSimuladoContext);
  if (!contexto) {
    throw new Error(
      "useUsuarioSimulado debe usarse dentro de un UsuarioSimuladoProvider",
    );
  }
  return contexto;
}
