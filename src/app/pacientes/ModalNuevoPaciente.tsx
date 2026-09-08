"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Modal } from "@/components/ui/Modal";

// Modal de alta de paciente (tarea 5.12).
//
// UN SOLO CAMPO, Y LA NOTA QUE EXPLICA POR QUE
//
// El formulario pide el seudonimo y nada mas. Eso, a quien no conozca el
// proyecto, se le lee como un formulario a medio hacer: falta el nombre, falta
// el documento, falta la fecha de nacimiento.
//
// Por eso la nota no es decorativa ni un disclaimer legal de relleno: **es lo
// que convierte una ausencia en una decision**. Los datos de salud son datos
// personales sensibles (Ley 25.326, art. 8) y este es un trabajo academico con
// datos sinteticos; el paciente se identifica con un codigo interno y el
// vinculo con la persona vive fuera del sistema.
//
// Ver docs/CONTEXTO.md seccion 3.
//
// LOS ERRORES VIENEN DEL SERVIDOR, NO SE DUPLICAN ACA
//
// Igual que en ModalNuevoMedicamento: se manda lo que la persona escribio y se
// pinta lo que el servidor conteste. Que el seudonimo no se repita, que tenga un
// largo minimo y que no sea un DNI son reglas del servicio (tarea 5.01), y
// repetirlas aca garantiza que en algun momento digan cosas distintas.

type Props = {
  alCerrar: () => void;
  /** Se llama despues de un alta exitosa, para que el listado se refresque. */
  alCrear: () => void;
};

type RespuestaDeError = {
  error?: string;
  campos?: Record<string, string>;
};

export function ModalNuevoPaciente({ alCerrar, alCrear }: Props) {
  const [seudonimo, setSeudonimo] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setError(undefined);
    setErrorGeneral(null);

    try {
      const respuesta = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seudonimo }),
      });

      if (respuesta.ok) {
        alCrear();
        alCerrar();
        return;
      }

      const cuerpo = (await respuesta.json()) as RespuestaDeError;
      setError(cuerpo.campos?.seudonimo);
      // El mensaje general solo aparece si no vino el del campo, para no decir
      // dos veces lo mismo.
      if (!cuerpo.campos?.seudonimo) {
        setErrorGeneral(cuerpo.error ?? "No se pudo crear el paciente.");
      }
    } catch {
      setErrorGeneral(
        "No se pudo contactar al servidor. Revisá tu conexión y volvé a intentar.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      abierto
      titulo="Nuevo paciente"
      alCerrar={alCerrar}
      acciones={
        <>
          <Boton onClick={alCerrar} disabled={enviando}>
            Cancelar
          </Boton>
          <Boton
            variante="primario"
            type="submit"
            form="form-nuevo-paciente"
            disabled={enviando}
          >
            {enviando ? "Creando…" : "Crear"}
          </Boton>
        </>
      }
    >
      <form
        id="form-nuevo-paciente"
        onSubmit={enviar}
        noValidate
        className="flex flex-col gap-4"
      >
        {errorGeneral ? (
          <p
            role="alert"
            className="rounded-md border border-critico-borde bg-critico-fondo px-3 py-2 text-sm text-critico-texto"
          >
            {errorGeneral}
          </p>
        ) : null}

        <Campo
          etiqueta="Seudónimo"
          placeholder="Ej: PAC-001"
          value={seudonimo}
          onChange={(e) => {
            setSeudonimo(e.target.value);
            // El error se borra apenas se toca el campo: dejarlo mientras la
            // persona corrige es confuso, porque ya no describe lo que hay
            // escrito.
            setError(undefined);
          }}
          error={error}
          ayuda="Un código interno. No uses el número de documento."
          autoComplete="off"
          autoFocus
        />

        <div className="rounded-md border border-info-borde bg-info-fondo px-4 py-3">
          <p className="text-sm font-medium text-info-texto">
            El paciente se identifica solo con este código
          </p>
          <p className="mt-1.5 text-sm text-texto">
            El sistema <strong className="font-medium">no guarda</strong>{" "}
            nombre, documento ni fecha de nacimiento, y no hay ningún campo
            donde cargarlos. El vínculo entre el seudónimo y la persona vive
            fuera del sistema.
          </p>
          <p className="mt-2 text-xs text-texto-tenue">
            Los datos de salud son datos personales sensibles (Ley 25.326, art.
            8). Este es un caso de estudio con datos sintéticos.
          </p>
        </div>
      </form>
    </Modal>
  );
}
