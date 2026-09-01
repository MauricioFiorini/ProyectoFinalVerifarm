# 0010 — Se adopta ONCHigh como fuente de interacciones

**Fecha:** 2026-09-01
**Estado:** vigente

**Cierra la decisión abierta D2.**

## Contexto

La tabla `Interaccion` necesita datos. Había dos caminos: importar el conjunto
**ONCHigh** completo (tarea 5.02) o cargar a mano al menos quince pares de
psicofármacos (tarea 5.03).

Conviene aclarar algo que se prestaba a confusión: **que las interacciones vivan
en base propia nunca estuvo en discusión.** Ya estaba decidido y escrito en
`docs/CONTEXTO.md` sección 3, y es la razón por la que existe el modelo
`Interaccion`. La *Drug Interaction API* de RxNav fue discontinuada por la NLM en
enero de 2024 y no volvió, así que la detección se resuelve contra datos propios
y es determinística. D2 preguntaba otra cosa: **de dónde salen esos datos.**

## Decisión

**Se importa ONCHigh completo a la tabla `Interaccion`.** Los datos quedan en la
base del proyecto, cargados una sola vez; la aplicación en ejecución no consulta
ninguna fuente externa.

Se eligió sobre la carga manual porque una fuente publicada y citable es
sustancialmente más defendible ante el jurado que quince pares elegidos por
nosotros, y porque cubre mucho más que un módulo clínico de demostración.

## Lo que esto implica, y no es poco

La tarea 5.02 es de tamaño **L** y arrastra tres trabajos que el conjunto no
resuelve solo. Están descritos en `docs/ROADMAP_PRODUCTO.md`, P.6.01 a P.6.05:

1. **Obtener los archivos.** Están en el repositorio público
   `dbmi-pitt/public-PDDI-analysis`, carpeta `PDDI-Datasets/ONC-High-Priority`.
2. **Mapear los identificadores a RxCUI.** Los archivos traen identificadores de
   **DrugBank, no RxCUI**. Hay que traducirlos, y los que no resuelvan
   automáticamente hay que revisarlos a mano.
3. **Redactar las descripciones de severidad.** Los archivos **no las traen**. La
   fuente original de la lista es el artículo de Phansalkar y colaboradores
   (JAMIA, 2012).

Además hay que **documentar la vigencia**: los archivos son de 2017 y la
extracción original es de 2014. Eso se dice, no se esconde: es una limitación
declarada, no un defecto oculto.

## Consecuencias

- **La 5.02 pasa de `[?]` a pendiente**, pero **sigue trabada por la decisión
  0008**: los pares se cruzan por RxCUI, y hasta que los del seed no estén
  verificados no hay contra qué cruzar. El orden es 2.11 primero, 5.02 después.
- **La 5.03 no se elimina.** Queda como red: la 5.02 es de tamaño L, depende de
  un mapeo que puede resolver peor de lo esperado, y la fase 5 es la más
  importante para la defensa. Si el mapeo se complica, quince pares cargados a
  mano sostienen la demostración. **Esa decisión se toma cuando se sepa cómo
  resolvió el mapeo, no antes.**
- El campo `Interaccion.fuente` pasa a tener un valor real y estable, y hay que
  poder decir en la defensa de dónde salió cada fila.
- **No se inventa ninguna interacción, severidad ni descripción.** Lo que no
  venga de la fuente o del artículo citado, no entra. Vale la regla de
  `docs/REGLAS_IA.md` sección 5.
