"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { UnidadMedida } from "@prisma/client";
import { Boton } from "@/components/ui/Boton";
import { Chip } from "@/components/ui/Chip";
import { formatearFecha, formatearFechaHora } from "@/lib/fechas";
import { NOMBRE_DE_UNIDAD } from "@/lib/unidades";

// Tablero de inicio con tarjetas (tarea 6.03).
//
// Consume GET /api/inicio, que consolida:
// 1. Medicamentos bajo mínimo (tarea 4.05 / 4.11).
// 2. Lotes próximos a vencer dentro de 30 días (tarea 4.06 / 4.17).
// 3. Consultas de interacciones registradas en el día (tarea 5.09 / 5.20).
//
// Cada tarjeta sintetiza el estado actual y enlaza directamente a su pantalla
// correspondiente para operar sobre ella.

type MedicamentoBajoMinimo = {
  id: string;
  nombre: string;
  unidad: UnidadMedida;
  stockMinimo: number;
  disponible: number;
};

type LotePorVencer = {
  loteId: string;
  numeroLote: string;
  fechaVencimiento: string;
  diasParaVencer: number;
  disponible: number;
  medicamentoId: string;
  nombreMedicamento: string;
  unidad: UnidadMedida;
};

type ConsultaDelDia = {
  id: string;
  fecha: string;
  seudonimo: string | null;
  cantidadDeMedicamentos: number;
  cantidadDeObservaciones: number;
};

type DatosInicio = {
  stockBajo: MedicamentoBajoMinimo[];
  vencimientosProximos: LotePorVencer[];
  consultasDelDia: ConsultaDelDia[];
};

type Estado = "cargando" | "listo" | "error";

export function TableroInicio() {
  const [datos, setDatos] = useState<DatosInicio | null>(null);
  const [estado, setEstado] = useState<Estado>("cargando");

  const cargar = useCallback(async () => {
    setEstado("cargando");
    try {
      const res = await fetch("/api/inicio");
      if (!res.ok) {
        setEstado("error");
        return;
      }
      const json = (await res.json()) as DatosInicio;
      setDatos(json);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(t);
  }, [cargar]);

  if (estado === "cargando") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center gap-3 rounded-lg border border-borde bg-superficie px-4 py-16 text-sm text-texto-tenue"
      >
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-borde border-t-marca-600"
        />
        Cargando indicadores de inicio...
      </div>
    );
  }

  if (estado === "error" || !datos) {
    return (
      <div className="rounded-lg border border-critico-borde bg-critico-fondo p-6 text-critico-texto">
        <h2 className="text-base font-semibold">
          No se pudieron cargar los indicadores de inicio
        </h2>
        <p className="mt-1 text-sm">
          Ocurrió un error al consultar el estado de stock y las consultas
          clínicas.
        </p>
        <div className="mt-4">
          <Boton onClick={() => void cargar()}>Reintentar</Boton>
        </div>
      </div>
    );
  }

  const cantidadStockBajo = datos.stockBajo.length;
  const cantidadVencimientos = datos.vencimientosProximos.length;
  const cantidadConsultas = datos.consultasDelDia.length;

  return (
    <div className="space-y-8">
      {/* Grilla de 3 tarjetas de resumen */}
      <section
        aria-label="Tarjetas de estado"
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {/* Tarjeta 1: Medicamentos bajo mínimo */}
        <div className="flex flex-col justify-between rounded-lg border border-borde bg-superficie p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-texto-tenue uppercase">
                Stock y Existencias
              </span>
              <Chip tono={cantidadStockBajo > 0 ? "critico" : "ok"}>
                {cantidadStockBajo > 0
                  ? `${cantidadStockBajo} bajo mínimo`
                  : "Nivel óptimo"}
              </Chip>
            </div>

            <h2 className="mt-3 text-lg font-semibold text-texto">
              Medicamentos bajo mínimo
            </h2>
            <p className="mt-1 text-3xl font-bold tracking-tight text-texto">
              {cantidadStockBajo}
            </p>
            <p className="mt-1 text-xs text-texto-tenue">
              Fármacos que requieren reposición inmediata por stock
              insuficiente.
            </p>

            <div className="mt-4">
              {cantidadStockBajo > 0 ? (
                <ul className="divide-y divide-borde rounded-md border border-borde bg-superficie-tenue text-xs">
                  {datos.stockBajo.slice(0, 4).map((med) => {
                    const faltante = med.stockMinimo - med.disponible;
                    return (
                      <li
                        key={med.id}
                        className="flex items-center justify-between px-3 py-2"
                      >
                        <span className="truncate font-medium text-texto">
                          {med.nombre}
                        </span>
                        <span className="shrink-0 text-texto-tenue">
                          <strong className="text-critico-texto">
                            {med.disponible}
                          </strong>{" "}
                          / {med.stockMinimo}{" "}
                          {NOMBRE_DE_UNIDAD[med.unidad]?.toLowerCase() ?? ""}{" "}
                          <span className="text-critico-texto">
                            (-{faltante})
                          </span>
                        </span>
                      </li>
                    );
                  })}
                  {cantidadStockBajo > 4 && (
                    <li className="px-3 py-2 text-center text-xs font-medium text-texto-tenue">
                      + {cantidadStockBajo - 4} medicamentos más...
                    </li>
                  )}
                </ul>
              ) : (
                <div className="rounded-md border border-ok-borde bg-ok-fondo px-3 py-3 text-xs text-ok-texto">
                  Todos los medicamentos registrados cuentan con existencias por
                  encima de su stock mínimo.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-borde">
            <Link
              href="/stock"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-borde bg-superficie px-4 py-2 text-sm font-medium text-texto transition-colors hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
            >
              Ir a control de stock &rarr;
            </Link>
          </div>
        </div>

        {/* Tarjeta 2: Lotes por vencer */}
        <div className="flex flex-col justify-between rounded-lg border border-borde bg-superficie p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-texto-tenue uppercase">
                Vencimientos FEFO
              </span>
              <Chip tono={cantidadVencimientos > 0 ? "advertencia" : "ok"}>
                {cantidadVencimientos > 0
                  ? `${cantidadVencimientos} próximo${cantidadVencimientos === 1 ? "" : "s"}`
                  : "Sin vencimientos"}
              </Chip>
            </div>

            <h2 className="mt-3 text-lg font-semibold text-texto">
              Lotes por vencer
            </h2>
            <p className="mt-1 text-3xl font-bold tracking-tight text-texto">
              {cantidadVencimientos}
            </p>
            <p className="mt-1 text-xs text-texto-tenue">
              Lotes vigentes con fecha de vencimiento dentro de los próximos 30
              días.
            </p>

            <div className="mt-4">
              {cantidadVencimientos > 0 ? (
                <ul className="divide-y divide-borde rounded-md border border-borde bg-superficie-tenue text-xs">
                  {datos.vencimientosProximos.slice(0, 4).map((lote) => (
                    <li
                      key={lote.loteId}
                      className="flex flex-col gap-0.5 px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate font-medium text-texto">
                          {lote.nombreMedicamento}
                        </span>
                        <span className="font-mono text-[11px] text-texto-sutil">
                          {lote.numeroLote}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-texto-tenue text-[11px]">
                        <span>
                          Vence:{" "}
                          <strong className="text-advertencia-texto">
                            {formatearFecha(lote.fechaVencimiento)}
                          </strong>
                        </span>
                        <span>
                          {lote.diasParaVencer === 0
                            ? "Vence hoy"
                            : `en ${lote.diasParaVencer} día${lote.diasParaVencer === 1 ? "" : "s"}`}{" "}
                          ({lote.disponible} disp.)
                        </span>
                      </div>
                    </li>
                  ))}
                  {cantidadVencimientos > 4 && (
                    <li className="px-3 py-2 text-center text-xs font-medium text-texto-tenue">
                      + {cantidadVencimientos - 4} lotes más...
                    </li>
                  )}
                </ul>
              ) : (
                <div className="rounded-md border border-ok-borde bg-ok-fondo px-3 py-3 text-xs text-ok-texto">
                  No hay lotes con unidades disponibles próximos a vencer dentro
                  de los siguientes 30 días.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-borde">
            <Link
              href="/stock"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-borde bg-superficie px-4 py-2 text-sm font-medium text-texto transition-colors hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
            >
              Ver lotes en stock &rarr;
            </Link>
          </div>
        </div>

        {/* Tarjeta 3: Consultas del día */}
        <div className="flex flex-col justify-between rounded-lg border border-borde bg-superficie p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-texto-tenue uppercase">
                Módulo Clínico
              </span>
              <Chip tono={cantidadConsultas > 0 ? "neutro" : "neutro"}>
                {cantidadConsultas > 0
                  ? `${cantidadConsultas} registrada${cantidadConsultas === 1 ? "" : "s"}`
                  : "0 registradas"}
              </Chip>
            </div>

            <h2 className="mt-3 text-lg font-semibold text-texto">
              Consultas del día
            </h2>
            <p className="mt-1 text-3xl font-bold tracking-tight text-texto">
              {cantidadConsultas}
            </p>
            <p className="mt-1 text-xs text-texto-tenue">
              Evaluaciones de interacciones farmacológicas realizadas hoy.
            </p>

            <div className="mt-4">
              {cantidadConsultas > 0 ? (
                <ul className="divide-y divide-borde rounded-md border border-borde bg-superficie-tenue text-xs">
                  {datos.consultasDelDia.slice(0, 4).map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-texto">
                            {c.seudonimo ?? "Consulta suelta"}
                          </span>
                          <span className="text-[11px] text-texto-sutil">
                            {formatearFechaHora(c.fecha).split(" ")[1] ?? ""}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-texto-tenue">
                          {c.cantidadDeMedicamentos} drogas evaluadas
                        </p>
                      </div>
                      <div className="shrink-0">
                        {c.cantidadDeObservaciones > 0 ? (
                          <span className="font-medium text-critico-texto">
                            {c.cantidadDeObservaciones} int.
                          </span>
                        ) : (
                          <span className="text-texto-tenue">Limpia</span>
                        )}
                      </div>
                    </li>
                  ))}
                  {cantidadConsultas > 4 && (
                    <li className="px-3 py-2 text-center text-xs font-medium text-texto-tenue">
                      + {cantidadConsultas - 4} consultas más...
                    </li>
                  )}
                </ul>
              ) : (
                <div className="rounded-md border border-borde bg-superficie-tenue px-3 py-3 text-xs text-texto-tenue">
                  Todavía no se registraron evaluaciones clínicas de
                  interacciones en el día de hoy.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-borde flex gap-2">
            <Link
              href="/consultas"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-borde bg-superficie px-3 py-2 text-sm font-medium text-texto transition-colors hover:bg-superficie-tenue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
            >
              Consultas &rarr;
            </Link>
            <Link
              href="/consultas/nueva"
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-marca-600 bg-marca-600 px-3 py-2 text-sm font-medium text-superficie transition-colors hover:bg-marca-700 hover:border-marca-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600"
            >
              + Nueva
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de módulos del sistema y accesos directos */}
      <section
        aria-label="Accesos directos del sistema"
        className="rounded-lg border border-borde bg-superficie p-6 shadow-xs"
      >
        <h2 className="text-base font-semibold text-texto">
          Módulos del Sistema
        </h2>
        <p className="mt-0.5 text-xs text-texto-tenue">
          Acceso rápido a las operaciones principales de Verifarm.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/stock"
            className="group block rounded-md border border-borde p-4 transition-colors hover:border-marca-600 hover:bg-superficie-tenue"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-texto group-hover:text-marca-700">
                Control de Stock
              </h3>
              <span className="text-texto-sutil group-hover:text-marca-700">
                &rarr;
              </span>
            </div>
            <p className="mt-1 text-xs text-texto-tenue">
              Existencias por medicamento, registro de ingresos y dispensación
              con reparto FEFO.
            </p>
          </Link>

          <Link
            href="/consultas/nueva"
            className="group block rounded-md border border-borde p-4 transition-colors hover:border-marca-600 hover:bg-superficie-tenue"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-texto group-hover:text-marca-700">
                Evaluar Interacciones
              </h3>
              <span className="text-texto-sutil group-hover:text-marca-700">
                &rarr;
              </span>
            </div>
            <p className="mt-1 text-xs text-texto-tenue">
              Evaluación determinística sobre base ONCHigh para esquemas
              individuales o de pacientes.
            </p>
          </Link>

          <Link
            href="/pacientes"
            className="group block rounded-md border border-borde p-4 transition-colors hover:border-marca-600 hover:bg-superficie-tenue"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-texto group-hover:text-marca-700">
                Pacientes
              </h3>
              <span className="text-texto-sutil group-hover:text-marca-700">
                &rarr;
              </span>
            </div>
            <p className="mt-1 text-xs text-texto-tenue">
              Fichas seudonimizadas, esquemas de medicación activa y suspensión
              fundada.
            </p>
          </Link>

          <Link
            href="/medicamentos"
            className="group block rounded-md border border-borde p-4 transition-colors hover:border-marca-600 hover:bg-superficie-tenue"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-texto group-hover:text-marca-700">
                Catálogo Farmacológico
              </h3>
              <span className="text-texto-sutil group-hover:text-marca-700">
                &rarr;
              </span>
            </div>
            <p className="mt-1 text-xs text-texto-tenue">
              Catálogo de principios activos, códigos RxCUI de ingrediente y
              umbrales mínimos.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
