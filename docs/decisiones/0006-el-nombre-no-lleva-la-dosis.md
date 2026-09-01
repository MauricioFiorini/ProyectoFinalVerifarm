# 0006 — El nombre del medicamento no lleva la dosis

**Fecha:** 2026-09-01
**Estado:** vigente

**Cierra la decisión abierta D4.**

## Contexto

El seed de la tarea 2.08 carga los medicamentos con la dosis dentro del nombre:
`"Paracetamol 500mg"`, `"Ibuprofeno 400mg"`, `"Haloperidol 5mg/ml"`.

El modelo de dominio habla de **nombre de droga**, no de presentación comercial.
Y `docs/CONTEXTO.md` sección 6 deja fuera del prototipo los nombres comerciales y
el vademécum de ANMAT: la entidad que se maneja es el principio activo.

## Por qué la dosis adentro rompe cosas

**Anula la validación de nombre único.** `Medicamento.nombre` es `@unique`, pero
`"Paracetamol 500mg"` y `"Paracetamol 1g"` son cadenas distintas: la restricción
no impide cargar la misma droga dos veces. La validación de la tarea 3.01, que ya
está escrita, queda cuidando algo que no es lo que se quería cuidar.

**Fragmenta el stock.** Cada fila tiene su propio `stockMinimo` y su propio
saldo. La alerta de stock bajo pasa a medir presentaciones en vez de
disponibilidad de la droga, que es lo que le importa a farmacia.

**Duplica el trabajo del módulo clínico.** El motor de interacciones cruza
principios activos. Dos filas de la misma droga son dos `rxcui` que mantener, y
dos oportunidades de que uno quede vacío o mal.

## Decisión

**`Medicamento.nombre` es el principio activo, sin dosis ni concentración.**
`"Paracetamol"`, no `"Paracetamol 500mg"`.

Si en algún momento hace falta la concentración, va en un campo aparte. **No se
agrega ahora**: no está en el alcance del prototipo y ninguna tarea la necesita.

## Qué se verificó

Los diez medicamentos del seed son **diez principios activos distintos**:
Paracetamol, Ibuprofeno, Amoxicilina, Clonazepam, Diazepam, Fluoxetina,
Sertralina, Haloperidol, Risperidona y Escitalopram.

Sacar la dosis **no genera ninguna colisión** de nombre único. El seed se corrige
sin perder filas.

## Consecuencias

- **No hace falta migración.** El campo sigue siendo `String @unique`; lo que
  cambia es qué se guarda adentro.
- **Hay que corregir el seed**, que es parte de la tarea **2.11**.
- **Hay que revisar la validación de la 3.01**, que ya está `[x]`. La restricción
  de unicidad ahora sí significa "una fila por droga", que era la intención.
- Queda emparentada con la decisión 0008: si el nombre es el principio activo, el
  `rxcui` que le corresponde es el de ingrediente, no el de un producto con dosis.
