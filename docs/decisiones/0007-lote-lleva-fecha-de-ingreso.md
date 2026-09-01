# 0007 — `Lote` lleva `fechaIngreso`; la cantidad vive en los movimientos

**Fecha:** 2026-09-01
**Estado:** vigente

**Cierra la decisión abierta D5.**

## Contexto

El modelo de dominio le da a `Lote` dos campos que el esquema de la tarea 2.03 no
tiene: `fechaIngreso` y `cantidadIngresada`. Había que decidir si se agregan los
dos, uno, o ninguno, antes de empezar la fase 4.

Son dos preguntas distintas y tienen respuestas distintas.

## `cantidadIngresada`: no se agrega

Persistirla rompería el invariante central del módulo de stock, escrito en
`docs/CONTEXTO.md` y en `docs/CONVENCIONES.md` sección 7: **los saldos no se
persisten, se calculan.**

Y no se pierde nada, porque el dato ya existe: la cantidad ingresada de un lote
**es la suma de sus movimientos de tipo `INGRESO`**. Una columna sería una
segunda fuente de verdad para algo que ya está registrado, y la garantía de que
en algún momento las dos digan cosas distintas.

El propio `schema.prisma` ya lo tiene anotado en `MovimientoStock`: *"No hay
campo de saldo o cantidad restante en Lote"*.

## `fechaIngreso`: sí se agrega

Acá **no hay reemplazo**. `createdAt` responde otra pregunta: cuándo se cargó el
lote **al sistema**. `fechaIngreso` es cuándo entró la medicación **a farmacia**.

No son lo mismo, y la diferencia es visible: si alguien registra el lunes un lote
que llegó el viernes, `createdAt` miente por tres días. En un proyecto cuyo
argumento central es la trazabilidad, es exactamente el tipo de cosa que se nota
en la defensa.

## Decisión

- **Se agrega `fechaIngreso DateTime` a `Lote`.** Obligatoria.
- **No se agrega `cantidadIngresada`.** La cantidad entra como movimiento de tipo
  `INGRESO`, y se deriva sumando.

**Esto se aparta del modelo de dominio en UML**, y se documenta a propósito: el
diagrama muestra `cantidadIngresada` como atributo de `Lote`. La corrección del
diagrama es la tarea **DOC.05** de `docs/ROADMAP_PRODUCTO.md`.

## Consecuencias

- **Hace falta una migración nueva.** Es la tarea **2.10**, compartida con la
  decisión 0005. Van juntas para que los tres apliquen una sola migración y no
  dos.
- **Los tres tienen que aplicarla**, como hicieron con la inicial en la 2.09.
- **Validaciones para las tareas 4.01 y 4.13**, que no son obvias y conviene
  fijar acá:
  - `fechaIngreso` no puede ser futura.
  - `fechaVencimiento` tiene que ser posterior a `fechaIngreso`, no solo
    posterior a hoy. Un lote que vence antes de haber entrado es un error de
    carga, y sin esta regla pasa.
- El alta de lote de la tarea 4.13 pide la fecha de ingreso además de la de
  vencimiento, que es lo que esa tarea ya describía.
- La tarea 4.02, el cálculo de cantidad disponible, no cambia: sigue siendo suma
  de ingresos menos suma de egresos.
