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
**Rama:** `feat/5.04-servicio-de-medicacion` (**sin mergear**)

### Qué se hizo

**La 5.04, y la migración que la destrababa.**

| Qué | Dónde |
| --- | --- |
| Migración de `MedicacionVigente` | `20260908132808_medicacion_con_fechas_y_motivo` |
| Servicio | `src/services/medicacion.ts` |
| Por qué se hizo así | `docs/decisiones/0013-la-medicacion-lleva-fechas-y-motivo.md` |

### ATENCIÓN: hay migración nueva

**Los tres tienen que correr `npx prisma migrate dev` y después
`npm run setup`.** Sin lo segundo, el cliente de Prisma queda con el modelo
viejo y `npm run check` falla con errores de tipo que no tienen nada que ver con
lo que uno esté escribiendo.

### La migración

`MedicacionVigente` tenía cuatro campos y ninguno servía para lo que pedían
cinco tareas. Ahora tiene:

```prisma
fechaInicio      DateTime
fechaFin         DateTime?
motivoSuspension String?
```

Y **perdió el `@@unique([pacienteId, medicamentoId])`**.

Con `fechaFin` y `motivoSuspension` se distinguen tres estados **sin guardar
ninguno**, que es lo que va a calcular la 5.05:

| `fechaFin` | `motivoSuspension` | Estado |
| --- | --- | --- |
| `NULL` | — | **Vigente** |
| con valor | con valor | **Suspendida**: se cortó por una razón |
| con valor | `NULL` | **Finalizada**: llegó a su término |

Es el mismo criterio que los saldos de stock: el estado se calcula, no se
persiste.

**El `@@unique` se sacó porque hacía imposible el historial.** Si a un paciente
se le suspende el clonazepam y tres meses después se le reinicia, con la
restricción puesta la segunda fila no entra: habría que pisar la primera, y ahí
se pierde el registro de que alguna vez se suspendió y por qué.

La regla real es más fina de lo que una restricción de base puede expresar: un
paciente no puede tener la misma droga **vigente** dos veces; suspendida,
cuantas veces haga falta. **Ahora vive en `agregarMedicacion`.**

### El servicio

- `listarMedicacionVigente(pacienteId)` — las que no tienen `fechaFin`.
- `listarMedicacionDePaciente(pacienteId)` — todo, vigente y no vigente.
- `agregarMedicacion({ pacienteId, medicamentoId, fechaInicio })`
- `suspenderMedicacion({ medicacionId, motivo, fechaFin? })`

**Elegir bien entre las dos funciones de listado importa más de lo que parece.**
La evaluación de interacciones tiene que usar `listarMedicacionVigente`: una
droga suspendida ya no la toma el paciente, y avisar por una interacción que no
puede ocurrir es ruido que hace que se dejen de leer los avisos que sí importan.
La ficha del paciente (5.13) usa la otra, porque una suspensión y su motivo son
información clínica.

Reglas que aplica el servicio:

- La fecha de inicio **no puede ser futura** (mismo criterio que el alta de lote
  de la 4.01).
- El **motivo es obligatorio** al suspender, con un mínimo de 4 caracteres. Se
  normaliza con `trim()`.
- La fecha de suspensión no puede ser futura ni anterior a la de inicio.
- Una medicación ya suspendida no se vuelve a suspender.
- El paciente y el medicamento tienen que existir y estar activos.

**No hay dosis, ni frecuencia, ni vía.** No faltan: están afuera por decisión de
alcance. Con dosis el sistema pasaría a formar parte del acto médico.

### Cómo verificarlo

Con un script descartable contra la base, **20 casos, todos dan lo esperado**:

| Bloque | Qué se probó |
| --- | --- |
| Alta | válida; misma droga ya vigente; fecha futura; paciente y medicamento inexistentes |
| Suspensión | motivo vacío; motivo de dos letras; fecha futura; fecha anterior al inicio; medicación inexistente; doble suspensión |
| Listados | la suspendida sale de vigentes y queda en el historial |
| **Reinicio** | **una droga suspendida vuelve a entrar, y el motivo de la suspensión anterior no se pierde** |
| Reinicio | y una vez vigente otra vez, no se puede duplicar |

Ese anteúltimo caso es el que la migración destraba, y el que antes era
imposible.

`npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **La 5.05**, el estado derivado. Es lo siguiente y es de tamaño S: la tabla de
  tres estados de más arriba es su especificación completa.
- **D8 sigue abierta.**

### Qué sigue

1. **5.05** — estado derivado (vigente / suspendida / finalizada).
2. **5.06** — el motor de interacciones. **Tiene que usar `ordenarParRxcui`**,
   de `src/lib/rxcui.ts`: es la única definición válida de cómo se ordena un par,
   y buscar con otro orden significa no encontrar interacciones que están
   cargadas.
3. **5.07** y **5.08** — validación de dos medicamentos, y la redacción por
   plantilla.

### Antes de arrancar, tener en cuenta

- **Corré la migración y después `npm run setup`.**
- **`ordenarParRxcui` es obligatorio** en cualquier lectura o escritura de
  `Interaccion`.
- **Las interacciones se evalúan sobre la medicación VIGENTE**, no sobre el
  historial.
- **Ningún dato clínico se inventa.** Las descripciones cargadas dicen la clase,
  no el efecto, porque la fuente no publica el efecto (decisión `0011`).
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **Una consulta de interacciones necesita al menos dos medicamentos.**
- **El sistema asiste, no decide.**
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
