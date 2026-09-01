# 0008 — Los RxCUI son de ingrediente, y se verifican contra RxNorm

**Fecha:** 2026-09-01
**Estado:** vigente

**Cierra la decisión abierta D6.**

## Contexto

RxNorm no asigna un solo tipo de código. Hay códigos que identifican un
**ingrediente** —el principio activo— y códigos que identifican un **producto**,
que es el principio activo con su forma farmacéutica y su concentración.

Los diez RxCUI cargados en el seed de la tarea 2.08 mezclan los dos tipos. Eso
traba la fase 5 entera, porque los pares de `Interaccion` se identifican por
RxCUI: si un medicamento está cargado con un código de producto y la tabla de
interacciones habla de ingredientes, el cruce no encuentra nada. Y no falla con
un error: devuelve "sin interacciones", que es el peor resultado posible.

## Decisión

**Los `rxcui` del catálogo son de nivel ingrediente.**

El sistema evalúa interacciones entre **principios activos**, no entre
presentaciones. Es el nivel que corresponde al dominio, y es coherente con la
decisión 0006: si `Medicamento.nombre` es el principio activo sin dosis, el
código que le corresponde es el del ingrediente.

**Los diez del seed se verifican uno por uno contra RxNorm antes de construir
nada encima.** No se dan por buenos, no se corrigen de memoria y no se completan
por inferencia: se consultan.

Esto **no contradice** que RxNorm en vivo esté fuera del alcance
(`docs/CONTEXTO.md` sección 6). Esa regla es sobre la aplicación en ejecución. La
verificación es una sola vez, hecha por una persona, para cargar el seed a mano
—que es justamente lo que la documentación describe.

## Qué queda pendiente

**La verificación todavía no se hizo.** Esta decisión fija el criterio; el
trabajo es la tarea **2.11**.

Lo que esa tarea tiene que producir, por cada uno de los diez medicamentos:

- El código actual del seed y qué es hoy según RxNorm (ingrediente, producto, o
  no resuelve).
- El RxCUI de ingrediente que le corresponde.
- La fecha de la consulta, porque RxNorm se actualiza.

Si alguno no resuelve, **queda sin `rxcui`** —la decisión 0005 lo permite— y se
anota por qué. No se pone un código aproximado.

## Consecuencias

- **Desbloquea la 5.03 y la 5.02** en cuanto la 2.11 esté hecha. Hasta entonces
  siguen trabadas: la decisión está tomada, el dato todavía no.
- La tarea 5.06, el motor de interacciones, puede asumir que todos los RxCUI que
  recibe son del mismo nivel. Sin esta decisión tendría que normalizar, que es
  trabajo que el prototipo no tiene por qué hacer.
- **Va en el mismo commit que la corrección de nombres de la decisión 0006**: son
  el mismo archivo y la misma pasada.
- Conviene dejar anotada la fecha de verificación en un comentario del seed, para
  que dentro de un año se sepa contra qué versión de RxNorm se validó.
