"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Modal } from "@/components/ui/Modal";

// Modal para suspender una medicacion (tarea 5.15).
//
// EL MOTIVO ES OBLIGATORIO, Y NO ES BUROCRACIA
//
// Es lo unico que distingue una SUSPENSION de una FINALIZACION. El estado no se
// guarda: se deriva de que haya fecha de fin y de que haya motivo (decision
// 0013). Sin motivo, el sistema no puede decir si la droga se corto por una
// razon clinica o si el tratamiento llego a su termino, que son dos cosas
// distintas para quien lea la ficha despues.
//
// El largo minimo lo comprueba el servicio, no este formulario: un motivo de dos
// letras es un motivo escrito para sacarse el cartel de encima.
//
// NO SE BORRA NADA
//
// Suspender no elimina la fila: le pone fecha de fin y motivo. La medicacion
// queda en el historial de la ficha, con su motivo a la vista, y la droga se
// puede volver a agregar mas adelante como un tramo nuevo.

type Props = {
  medicacionId: string;
  nombreMedicamento: string;
  alCerrar: () => void;
  /** Se llama despues de suspender, para refrescar la ficha. */
  alSuspender: () => void;
};

type RespuestaDeError = { error?: string; campos?: Record<string, string> };

export function ModalSuspender({
  medicacionId,
  nombreMedicamento,
  alCerrar,
  alSuspender,
}: Props) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setError(undefined);
    setErrorGeneral(null);

    try {
      const respuesta = await fetch("/api/medicacion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicacionId, motivo }),
      });

      if (respuesta.ok) {
        alSuspender();
        alCerrar();
        return;
      }

      const cuerpo = (await respuesta.json()) as RespuestaDeError;
      setError(cuerpo.campos?.motivo);
      if (!cuerpo.campos?.motivo) {
        setErrorGeneral(cuerpo.error ?? "No se pudo suspender la medicación.");
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
      titulo={`Suspender ${nombreMedicamento}`}
      alCerrar={alCerrar}
      acciones={
        <>
          <Boton onClick={alCerrar} disabled={enviando}>
            Cancelar
          </Boton>
          <Boton
            // Variante critica y no primaria: cambia el esquema del paciente y
            // hace que esa droga deje de participar de la evaluacion de
            // interacciones. No es la accion corriente de esta pantalla.
            variante="critico"
            type="submit"
            form="form-suspender"
            disabled={enviando}
          >
            {enviando ? "Suspendiendo…" : "Suspender"}
          </Boton>
        </>
      }
    >
      <form
        id="form-suspender"
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
          etiqueta="Motivo de la suspensión"
          placeholder="Ej: Reacción adversa"
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            setError(undefined);
          }}
          error={error}
          ayuda="Queda visible en la ficha del paciente."
          autoComplete="off"
          autoFocus
        />

        <div className="rounded-md border border-info-borde bg-info-fondo px-4 py-3">
          <p className="text-sm text-texto">
            La medicación <strong className="font-medium">no se borra</strong>:
            queda en el historial con su motivo, y{" "}
            <strong className="font-medium">
              deja de participar de la evaluación de interacciones
            </strong>
            .
          </p>
          <p className="mt-2 text-xs text-texto-tenue">
            Si la droga se reinicia más adelante, entra como un tramo nuevo.
            Este queda como está.
          </p>
        </div>
      </form>
    </Modal>
  );
}
