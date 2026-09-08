# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-09-08
**Entrega:** Mauricio Mateo Fiorini

**Dos ramas apiladas, ninguna mergeada.** Se mergean en este orden:

1. `feat/5.04-servicio-de-medicacion`
2. `feat/5.05-estado-de-la-medicacion`

### Qué se hizo

| Tarea | Qué dejó |
| --- | --- |
| — | Migración de `MedicacionVigente`: fechas, motivo y afuera el `@@unique` |
| 5.04 | `src/services/medicacion.ts`: agregar, suspender, listar |
| 5.05 | Estado derivado, en el mismo archivo |
| — | Decisión `0013` |

### ATENCIÓN: hay migración nueva

**Los tres tienen que correr `npx prisma migrate dev` y después
`npm run setup`.** Sin lo segundo, el cliente de Prisma queda con el modelo
viejo y `npm run check` falla con errores de tipo que no tienen nada que ver con
lo que uno esté escribiendo.

### La migración: `20260908132808_medicacion_con_fechas_y_motivo`

`MedicacionVigente` tenía cuatro campos y ninguno servía para lo que pedían
cinco tareas. Ahora tiene `fechaInicio`, `fechaFin` y `motivoSuspension`, y
**perdió el `@@unique([pacienteId, medicamentoId])`**.

**Se sacó porque hacía imposible el historial.** Si a un paciente se le suspende
el clonazepam y tres meses después se le reinicia, con la restricción puesta la
segunda fila no entra: habría que pisar la primera, y ahí se pierde el registro
de que alguna vez se suspendió y por qué.

La regla real es más fina de lo que una restricción de base puede expresar: un
paciente no puede tener la misma droga **vigente** dos veces; suspendida,
cuantas veces haga falta. **Ahora vive en `agregarMedicacion`.**

El porqué completo está en `docs/decisiones/0013-la-medicacion-lleva-fechas-y-motivo.md`.

### El estado no se guarda, se calcula

Es el mismo criterio que los saldos de stock. Los tres estados salen de dos
campos, sin ningún tercero:

| `fechaFin` | `motivoSuspension` | Estado |
| --- | --- | --- |
| `NULL` | — | **Vigente** |
| con valor | con valor | **Suspendida**: se cortó por una razón |
| con valor | `NULL` | **Finalizada**: llegó a su término |

`calcularEstadoDeMedicacion` es una función pura y toma una `referencia`
opcional, igual que `estaVencido` en el módulo de stock: una fecha de fin
posterior a la referencia todavía no ocurrió, así que el tramo sigue vigente.

**Los dos listados ya devuelven el estado calculado**, así que la 5.13 no tiene
que derivarlo de nuevo.

### El servicio

- `listarMedicacionVigente(pacienteId)` — las que no tienen `fechaFin`.
- `listarMedicacionDePaciente(pacienteId)` — todo, vigente y no vigente.
- `agregarMedicacion({ pacienteId, medicamentoId, fechaInicio })`
- `suspenderMedicacion({ medicacionId, motivo, fechaFin? })`
- `calcularEstadoDeMedicacion(medicacion, referencia?)` — pura.

**Elegir bien entre los dos listados importa más de lo que parece.** La
evaluación de interacciones tiene que usar `listarMedicacionVigente`: una droga
suspendida ya no la toma el paciente, y avisar por una interacción que no puede
ocurrir es ruido que hace que se dejen de leer los avisos que sí importan. La
ficha del paciente (5.13) usa la otra, porque una suspensión y su motivo son
información clínica.

Reglas que aplica el servicio: la fecha de inicio no puede ser futura; el motivo
es obligatorio al suspender, con mínimo de 4 caracteres y `trim()`; la fecha de
suspensión no puede ser futura ni anterior a la de inicio; una medicación ya
suspendida no se vuelve a suspender; el paciente y el medicamento tienen que
existir y estar activos.

**No hay dosis, ni frecuencia, ni vía.** No faltan: están afuera por decisión de
alcance. Con dosis el sistema pasaría a formar parte del acto médico.

### Cómo verificarlo

Dos scripts descartables, **28 casos en total, todos dan lo esperado**.

Contra la base (20 casos):

| Bloque | Qué se probó |
| --- | --- |
| Alta | válida; misma droga ya vigente; fecha futura; paciente y medicamento inexistentes |
| Suspensión | motivo vacío; motivo de dos letras; fecha futura; fecha anterior al inicio; medicación inexistente; doble suspensión |
| Listados | la suspendida sale de vigentes y queda en el historial |
| **Reinicio** | **una droga suspendida vuelve a entrar, y el motivo anterior no se pierde** |
| Estados | un paciente con las tres situaciones a la vez devuelve una de cada una |

Sobre la función pura (8 casos): sin fecha de fin; sin fecha de fin con motivo
cargado por error; fin pasado con motivo; fin pasado sin motivo; fin pasado con
motivo vacío; **fin futuro con y sin motivo**; y fin exactamente igual a la
referencia.

`npm run check` da 0 en las dos ramas.

### Qué quedó sin hacer

- **Las dos ramas sin mergear.**
- **La 5.06 en adelante.**
- **D8 sigue abierta.**

### Qué sigue

1. **5.06** — el motor de interacciones. Es de tamaño L y ya tiene contra qué
   cruzar: 1150 filas en `Interaccion`.
2. **5.07** — la validación de que una consulta necesita al menos dos
   medicamentos.
3. **5.08** — la redacción de la observación por plantilla.

### Antes de arrancar, tener en cuenta

- **Corré la migración y después `npm run setup`.**
- **`ordenarParRxcui` es obligatorio** en cualquier lectura o escritura de
  `Interaccion`. Está en `src/lib/rxcui.ts`. Buscar con otro orden significa no
  encontrar interacciones que están cargadas, y una interacción no detectada es
  el peor error que puede cometer este sistema.
- **Las interacciones se evalúan sobre la medicación VIGENTE**, no sobre el
  historial.
- **Ningún dato clínico se inventa.** Las descripciones cargadas dicen la clase,
  no el efecto, porque la fuente no publica el efecto (decisión `0011`).
- **Todas las interacciones tienen severidad `ALTA`.** La fuente no publica una
  escala. La 5.18 va a mostrar un solo color y está asumido.
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **La 5.16 y la 5.18 tienen tres casos, no dos:** "no hay interacciones
  registradas", "falta el `rxcui`" y **"la fuente no cubre esta droga"**.
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El sistema asiste, no decide.**
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
