# 0013 — La medicación lleva fechas y motivo, y pierde el `@@unique`

**Fecha:** 2026-09-08
**Estado:** vigente

## Contexto

`MedicacionVigente` salió de la tarea 2.02 con cuatro campos: `pacienteId`,
`medicamentoId` y las dos marcas de tiempo. Nada más.

Cinco tareas del roadmap piden campos que no existían:

| Tarea | Necesita |
|---|---|
| 5.04 | suspender **con motivo** |
| 5.05 | estado derivado "a partir de **fechas y motivo**" |
| 5.13 | mostrar **fecha de inicio** y estado |
| 5.14 | modal con **fecha de inicio** |
| 5.15 | modal que pide **motivo obligatorio** |

No era una tarea que se pudiera empezar y ver cómo salía: sin migración, cinco
tareas quedaban trabadas.

## Decisión

**Se agregan tres campos y se saca la restricción de unicidad.**

```prisma
fechaInicio      DateTime
fechaFin         DateTime?
motivoSuspension String?
```

Migración `20260908132808_medicacion_con_fechas_y_motivo`.

### Por qué `fechaInicio` es obligatoria y `fechaFin` no

Una fila de `MedicacionVigente` es **un tramo**: esta droga, para este paciente,
desde esta fecha y hasta esta otra. Un tramo sin comienzo no se puede ubicar en
el tiempo, así que la fecha de inicio se pide siempre.

`fechaFin` en `NULL` es lo que significa "la sigue tomando". No hace falta un
campo booleano aparte, y tenerlo sería una segunda fuente de verdad que se puede
contradecir con la primera.

### Por qué el motivo va separado de la fecha

Con las dos cosas se distinguen tres estados sin guardar ninguno:

| `fechaFin` | `motivoSuspension` | Estado |
|---|---|---|
| `NULL` | — | **Vigente** |
| con valor | con valor | **Suspendida**: se cortó por una razón |
| con valor | `NULL` | **Finalizada**: el tratamiento llegó a su término |

Es la misma idea que los saldos de stock: el estado **se calcula**, no se
persiste. Un campo `estado` guardado se desincroniza de las fechas la primera
vez que alguien actualiza una y se olvida de la otra. El cálculo es la tarea
5.05.

### Por qué se saca el `@@unique([pacienteId, medicamentoId])`

Esa restricción hacía **imposible el historial**. Si a un paciente se le suspende
el clonazepam y tres meses después se le reinicia, la segunda fila no entra. La
única salida sería pisar la primera, y ahí se pierde el registro de que alguna
vez se suspendió y por qué —que es exactamente el dato clínico que uno querría
tener cuando la droga vuelve a aparecer.

**La regla real es más fina de lo que una restricción de base puede expresar:**
un paciente no puede tener la misma droga **vigente** dos veces; suspendida,
cuantas veces haga falta. PostgreSQL permitiría escribirla con un índice único
parcial, pero Prisma no lo declara en el esquema, y una regla que vive en una
migración escrita a mano y no en el modelo es una regla que nadie va a ver.

Vive en `agregarMedicacion`, en `src/services/medicacion.ts`, que es donde el
resto de las reglas de negocio de este proyecto ya viven.

Es el mismo criterio del módulo de stock: los movimientos son un libro mayor y
nada se reescribe.

## Lo que esto abre, y hay que tener presente

**Ahora se puede tener dos filas de la misma droga para el mismo paciente.** Todo
lo que consulte la medicación tiene que decidir explícitamente si quiere las
vigentes o el historial completo:

- **`listarMedicacionVigente`** — las que no tienen `fechaFin`. **Es la que
  alimenta la evaluación de interacciones.** Una droga suspendida no entra: el
  paciente ya no la toma, y avisar por una interacción que no puede ocurrir es
  ruido que hace que se dejen de leer los avisos que sí importan.
- **`listarMedicacionDePaciente`** — todo. Es la de la ficha (5.13): que una
  droga se haya suspendido, y por qué, es información clínica.

Elegir mal entre las dos en la pantalla de consulta produciría un falso positivo
por una droga que el paciente ya no toma.

## Consecuencias

- **Los tres tienen que aplicar la migración**, con `npx prisma migrate dev` y
  después `npm run setup`.
- **La tabla estaba vacía**, así que `fechaInicio NOT NULL` sin valor por defecto
  no rompe nada. En una base con filas habría que haber pasado por un valor
  provisorio.
- **Se agregó `@@index([pacienteId])`**, que antes lo daba el `@@unique` que se
  fue. Todas las consultas de este servicio filtran por paciente.
- **Destraba la 5.04, 5.05, 5.13, 5.14 y 5.15.**
- **La 5.05 no inventa nada nuevo:** la tabla de tres estados de arriba es su
  especificación completa.
