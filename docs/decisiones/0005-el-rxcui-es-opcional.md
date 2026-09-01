# 0005 — El `rxcui` es opcional, y único cuando está

**Fecha:** 2026-09-01
**Estado:** vigente

**Cierra la decisión abierta D3.**

## Contexto

El esquema salido de la tarea 2.02 declara `rxcui String @unique`: obligatorio.
El roadmap pide lo contrario en la tarea 3.07, "RxCUI opcional cargado a mano".
Uno de los dos tenía que ceder.

El argumento a favor de hacerlo obligatorio era tener un lugar del que sacar los
nombres de droga. **Ese beneficio no existe en el alcance del prototipo.** No hay
consulta a RxNorm en vivo —está fuera por decisión, `docs/CONTEXTO.md` sección
6—, así que el código no devuelve ningún nombre: lo tipea la persona igual.

## Para qué sirve realmente el `rxcui`

Conviene dejarlo escrito, porque no se deduce mirando `Medicamento`.

El modelo `Interaccion` guarda `rxcui1` y `rxcui2`. **No tiene ninguna relación
con `Medicamento`**: no hay `medicamentoId` por ningún lado. Y la tarea 5.06
define el motor como "dada una lista de RxCUI, devolver todos los pares que
interactúan".

O sea que **el `rxcui` es el único puente entre el catálogo y la tabla de
interacciones**. Un medicamento sin `rxcui` no pierde una funcionalidad: no
existe para el módulo clínico, porque no hay otro campo por el cual cruzarlo.

No alcanzaría con cruzar por nombre. El campo `fuente` de `Interaccion` indica
que los pares vienen de afuera, de una fuente que nombra las drogas a su manera.
`Fluoxetina`, `fluoxetina`, `Fluoxetina 20mg` y `Fluoxetine` son cuatro cadenas
distintas y una sola droga; un cruce fallido es **una interacción no detectada**,
que es el peor error posible acá.

## Decisión

**`rxcui String? @unique`**: opcional, y único cuando tiene valor. En PostgreSQL
varios `NULL` conviven sin violar la unicidad.

El motivo es el modo de falla, no la comodidad:

| | Qué pasa | Cómo se ve |
|---|---|---|
| `rxcui` ausente | El medicamento no cruza contra ninguna interacción | **Visible.** La pantalla lo dice |
| `rxcui` inventado | No cruza con nada, o cruza con **otra droga** | **Silencioso.** Parece funcionar y da un resultado falso |

`@unique` valida que no se repita, no que sea correcto: un código inventado y
uno real son indistinguibles para la base. Un campo obligatorio que la persona no
puede completar bien es una invitación a inventarlo, y `docs/REGLAS_IA.md`
sección 5 prohíbe exactamente eso.

Se suma que `Medicamento` sirve a dos módulos. Al de stock el `rxcui` no le
importa: cuenta unidades y aplica FEFO por vencimiento. Obligarlo trababa el alta
de medicamentos por un dato que ese módulo no usa.

## Consecuencias

- **Hace falta una migración nueva.** Nunca se edita una migración ya mergeada:
  la inicial `20260901142250_inicial` queda como está y se agrega otra. Es la
  tarea **2.10**, que la comparte con la decisión 0007.
- **Los tres tienen que aplicar esa migración**, igual que hicieron con la
  inicial en la 2.09.
- **Las pantallas del módulo clínico tienen que contemplar el caso sin `rxcui`**
  y decirlo explícitamente, en vez de omitir el medicamento en silencio. Afecta a
  las tareas 5.16 y 5.18.
- La validación de la tarea 3.02 acepta el campo vacío, pero si viene con valor
  sigue exigiendo que no esté repetido.
- **El `rxcui` opcional no es permiso para dejarlo vacío.** Los diez del seed van
  con código real y verificado: ver la decisión 0008.
