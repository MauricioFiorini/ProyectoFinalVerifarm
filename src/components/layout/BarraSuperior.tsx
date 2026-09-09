"use client";

import { useEffect, useRef, useState } from "react";
import { useUsuarioSimulado } from "@/context/UsuarioSimuladoContext";

// Barra superior con selector de usuario simulado (tarea 6.02).
//
// POR QUE EXISTE
//
// Reemplaza al login, que esta fuera del alcance del prototipo (docs/CONTEXTO.md seccion 6).
// Permite que durante la evaluacion o defensa se pueda alternar de rol en un clic
// (Farmacéutico, Médico, Administrador) y que cada movimiento de stock,
// dispensacion o consulta quede atribuida al usuario activo.

function obtenerIniciales(nombre: string): string {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function BarraSuperior() {
  const { usuario, usuarios, cambiarUsuario } = useUsuarioSimulado();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    if (!abierto) return;

    function manejarClicAfuera(evento: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
        setAbierto(false);
      }
    }

    function manejarEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAbierto(false);
      }
    }

    document.addEventListener("mousedown", manejarClicAfuera);
    document.addEventListener("keydown", manejarEscape);
    return () => {
      document.removeEventListener("mousedown", manejarClicAfuera);
      document.removeEventListener("keydown", manejarEscape);
    };
  }, [abierto]);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-borde bg-superficie px-4 sm:px-6">
      {/* Contexto institucional sutil */}
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="hidden truncate text-xs text-texto-tenue md:inline">
          Colonia Psiquiátrica &laquo;Dr. Abelardo Irigoyen Freyre&raquo;
        </span>
        <span className="hidden text-borde md:inline">|</span>
        <span className="inline-flex items-center rounded-full border border-borde bg-superficie-tenue px-2 py-0.5 text-[0.7rem] font-medium text-texto-tenue">
          Modo simulación
        </span>
      </div>

      {/* Selector de usuario */}
      <div className="relative" ref={contenedorRef}>
        <button
          type="button"
          onClick={() => setAbierto((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={abierto}
          className="flex items-center gap-2.5 rounded-lg border border-borde bg-superficie px-3 py-1.5 text-left text-sm transition hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
        >
          {/* Avatar con iniciales */}
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-full bg-marca-100 text-xs font-bold text-marca-800"
          >
            {obtenerIniciales(usuario.nombre)}
          </span>

          <div className="flex flex-col">
            <span className="text-xs font-semibold leading-none text-texto">
              {usuario.nombre}
            </span>
            <span className="text-[0.65rem] leading-tight text-texto-tenue">
              {usuario.etiquetaRol}
            </span>
          </div>

          <svg
            className={`size-4 text-texto-tenue transition-transform duration-150 ${abierto ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Menu desplegable */}
        {abierto && (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 mt-1.5 w-80 rounded-lg border border-borde bg-superficie p-1.5 shadow-lg"
          >
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-texto">
                Cambiar usuario simulado
              </p>
              <p className="mt-0.5 text-[0.7rem] leading-normal text-texto-tenue">
                El prototipo no tiene login. Seleccioná un rol para registrar
                movimientos y consultas a su nombre.
              </p>
            </div>

            <div className="my-1 border-t border-borde" />

            <div className="flex flex-col gap-1">
              {usuarios.map((u) => {
                const esActivo = u.id === usuario.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      cambiarUsuario(u.id);
                      setAbierto(false);
                    }}
                    className={`flex items-start gap-3 rounded-md p-2 text-left transition ${
                      esActivo
                        ? "bg-marca-50 text-marca-900"
                        : "text-texto hover:bg-superficie-tenue"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        esActivo
                          ? "bg-marca-600 text-white"
                          : "bg-superficie-tenue text-texto-tenue border border-borde"
                      }`}
                    >
                      {obtenerIniciales(u.nombre)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs font-medium text-texto">
                          {u.nombre}
                        </span>
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.2 text-[0.65rem] font-medium uppercase ${
                            esActivo
                              ? "bg-marca-200 text-marca-800"
                              : "bg-superficie-tenue text-texto-sutil"
                          }`}
                        >
                          {u.etiquetaRol}
                        </span>
                      </div>
                      <p className="truncate text-[0.65rem] text-texto-sutil">
                        {u.email}
                      </p>
                      <p className="mt-0.5 text-[0.65rem] leading-tight text-texto-tenue">
                        {u.descripcion}
                      </p>
                    </div>

                    {esActivo && (
                      <svg
                        className="mt-1 size-4 shrink-0 text-marca-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
