"use client";

import { useCallback, useEffect, useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Tabla, type Columna } from "@/components/ui/Tabla";
import { ModalNuevoPaciente } from "./ModalNuevoPaciente";

// Listado de pacientes (tarea 5.11).
//
// Mismo reparto que /medicamentos: componente de cliente, consume /api/pacientes
// y no importa el servicio. Ver docs/ARQUITECTURA.md seccion 3.
//
// LO QUE ESTA TABLA NO MUESTRA
//
// No hay nombre, ni documento, ni fecha de nacimiento, y no es que falten esas
// columnas: **no existen esos campos en la base**. El paciente se identifica con
// un seudonimo y nada mas (docs/CONTEXTO.md seccion 3). La leyenda del
// encabezado de la pagina lo dice en pantalla, para que quien vea el sistema por
// primera vez no lo lea como un dato que falta cargar.

/** Paciente tal como llega del endpoint. */
export type PacienteDeApi = {
  id: string;
  seudonimo: string;
  medicacionVigente: number;
};

type Estado = "cargando" | "listo" | "error";

const COLUMNAS: Columna<PacienteDeApi>[] = [
  {
    clave: "seudonimo",
    encabezado: "Seudónimo",
    celda: (p) => <span className="font-medium font-mono">{p.seudonimo}</span>,
  },
  {
    clave: "medicacionVigente",
    encabezado: "Medicación vigente",
    alineacion: "derecha",
    celda: (p) =>
      p.medicacionVigente === 0 ? (
        // Un cero en gris y no un numero mas: un paciente sin medicacion
        // cargada no tiene nada que evaluar, y conviene que se note de un
        // vistazo cuales son.
        <span className="text-texto-sutil">0</span>
      ) : (
        <span className="font-medium">{p.medicacionVigente}</span>
      ),
  },
];

export function ListaPacientes() {
  const [pacientes, setPacientes] = useState<PacienteDeApi[]>([]);
  const [estado, setEstado] = useState<Estado>("cargando");
  const [buscar, setBuscar] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  // Se guarda el texto con el que se trajo lo que hay en pantalla, para
  // distinguir "no hay pacientes" de "no hay resultados para esta busqueda".
  const [textoBuscado, setTextoBuscado] = useState("");

  const cargar = useCallback(async (texto: string) => {
    const limpio = texto.trim();
    const url = limpio
      ? `/api/pacientes?buscar=${encodeURIComponent(limpio)}`
      : "/api/pacientes";

    try {
      const respuesta = await fetch(url);
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

      setPacientes((await respuesta.json()) as PacienteDeApi[]);
      setTextoBuscado(limpio);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }, []);

  // Se espera a que la persona deje de tipear antes de pedir. Ver la nota de
  // ListaMedicamentos.tsx sobre por que la llamada va dentro de un callback.
  useEffect(() => {
    const t = setTimeout(() => void cargar(buscar), 250);
    return () => clearTimeout(t);
  }, [buscar, cargar]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="w-full max-w-sm">
          <Campo
            etiqueta="Buscar"
            type="search"
            placeholder="Seudónimo…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>

        <Boton variante="primario" onClick={() => setModalAbierto(true)}>
          Nuevo paciente
        </Boton>
      </div>

      {estado === "cargando" ? (
        <EstadoCargando />
      ) : estado === "error" ? (
        <EstadoError alReintentar={() => void cargar(buscar)} />
      ) : (
        <Tabla
          columnas={COLUMNAS}
          filas={pacientes}
          claveDeFila={(p) => p.id}
          descripcion="Listado de pacientes"
          mensajeVacio={
            textoBuscado
              ? `No se encontraron pacientes que coincidan con «${textoBuscado}».`
              : "Todavía no hay pacientes cargados"
          }
        />
      )}

      {modalAbierto ? (
        <ModalNuevoPaciente
          alCerrar={() => setModalAbierto(false)}
          // Se recarga con el texto que haya en el buscador, para no perder el
          // filtro que la persona tenia puesto.
          alCrear={() => void cargar(buscar)}
        />
      ) : null}
    </div>
  );
}

function EstadoCargando() {
  return (
    <div
      className="flex items-center justify-center gap-3 rounded-lg border border-borde bg-superficie px-4 py-12 text-sm text-texto-tenue"
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-borde border-t-marca-600"
      />
      Cargando pacientes…
    </div>
  );
}

function EstadoError({ alReintentar }: { alReintentar: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-lg border border-critico-borde bg-critico-fondo px-4 py-12 text-center"
    >
      <p className="text-sm text-critico-texto">
        No se pudo cargar el listado de pacientes.
      </p>
      <Boton onClick={alReintentar}>Reintentar</Boton>
    </div>
  );
}
