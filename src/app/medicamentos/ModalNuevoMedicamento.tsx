"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo, CampoSelector } from "@/components/ui/Campo";
import { Modal } from "@/components/ui/Modal";
import { OPCIONES_DE_UNIDAD } from "@/lib/unidades";

// Modal de alta de medicamento (tarea 3.07).
//
// LOS ERRORES VIENEN DEL SERVIDOR, NO SE DUPLICAN ACA
//
// Este formulario NO revalida las reglas. Manda lo que la persona escribio y
// pinta lo que el servidor conteste. Las reglas viven en un solo lugar —el
// esquema de Zod de la 3.02 y el servicio de la 3.01— y repetirlas en el cliente
// garantiza que en algun momento digan cosas distintas.
//
// La API contesta con `{ error, campos }`, donde `campos` trae el mensaje de
// cada campo. Eso es lo que permite mostrarlos debajo del input y no en un
// cartel suelto: lo arman `respuestaDeValidacion` y `respuestaDeError` en
// src/lib/respuestaHttp.ts

// El listado lo monta solo cuando hace falta, asi que cada apertura arranca con
// el formulario limpio. Antes se limpiaba con un efecto, que ademas de ser mas
// codigo hacia que React lo renderizara dos veces por apertura.
type Props = {
  alCerrar: () => void;
  /** Se llama despues de un alta exitosa, para que el listado se refresque. */
  alCrear: () => void;
};

type RespuestaDeError = {
  error?: string;
  campos?: Record<string, string>;
};

const VACIO = { nombre: "", rxcui: "", unidad: "", stockMinimo: "" };

export function ModalNuevoMedicamento({ alCerrar, alCrear }: Props) {
  const [valores, setValores] = useState(VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo: keyof typeof VACIO) => (valor: string) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    // El error del campo se borra apenas se lo toca: dejarlo mientras la persona
    // corrige es confuso, porque ya no describe lo que hay escrito.
    setErrores(({ [campo]: _descartado, ...resto }) => resto);
  };

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErrores({});
    setErrorGeneral(null);

    try {
      const respuesta = await fetch("/api/medicamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: valores.nombre,
          // La cadena vacia significa "no lo cargaron". El esquema de la 3.02 la
          // convierte a null; el rxcui es opcional por la decision 0005.
          rxcui: valores.rxcui,
          unidad: valores.unidad,
          stockMinimo:
            valores.stockMinimo === ""
              ? undefined
              : Number(valores.stockMinimo),
        }),
      });

      if (respuesta.ok) {
        alCrear();
        alCerrar();
        return;
      }

      const cuerpo = (await respuesta.json()) as RespuestaDeError;
      setErrores(cuerpo.campos ?? {});
      // Solo se muestra el mensaje general si no hubo errores por campo, para no
      // decir dos veces lo mismo.
      if (!cuerpo.campos) {
        setErrorGeneral(cuerpo.error ?? "No se pudo crear el medicamento.");
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
      titulo="Nuevo medicamento"
      alCerrar={alCerrar}
      acciones={
        <>
          <Boton onClick={alCerrar} disabled={enviando}>
            Cancelar
          </Boton>
          <Boton
            variante="primario"
            type="submit"
            form="form-nuevo-medicamento"
            disabled={enviando}
          >
            {enviando ? "Guardando…" : "Guardar"}
          </Boton>
        </>
      }
    >
      {/* El form vive en el cuerpo y el boton de enviar en el pie del modal, asi
          que se conectan con el atributo `form`. */}
      <form
        id="form-nuevo-medicamento"
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
          etiqueta="Nombre de droga"
          placeholder="Ej: Clonazepam"
          value={valores.nombre}
          onChange={(e) => cambiar("nombre")(e.target.value)}
          error={errores.nombre}
          ayuda="El principio activo, sin dosis."
          autoComplete="off"
        />

        <CampoSelector
          etiqueta="Unidad de medida"
          marcador="Elegir unidad…"
          opciones={OPCIONES_DE_UNIDAD}
          value={valores.unidad}
          onChange={(e) => cambiar("unidad")(e.target.value)}
          error={errores.unidad}
        />

        <Campo
          etiqueta="Stock mínimo"
          type="number"
          min={0}
          step={1}
          placeholder="0"
          value={valores.stockMinimo}
          onChange={(e) => cambiar("stockMinimo")(e.target.value)}
          error={errores.stockMinimo}
          ayuda="Por debajo de este valor se avisa que hay que reponer."
        />

        <Campo
          etiqueta="RxCUI (opcional)"
          placeholder="Ej: 2598"
          value={valores.rxcui}
          onChange={(e) => cambiar("rxcui")(e.target.value)}
          error={errores.rxcui}
          ayuda="Código de ingrediente de RxNorm. Sin él, el medicamento no se evalúa por interacciones."
          autoComplete="off"
          inputMode="numeric"
        />
      </form>
    </Modal>
  );
}
