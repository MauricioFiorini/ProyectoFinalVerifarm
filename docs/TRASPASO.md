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
**Rama:** `feat/5.21-la-consulta-guarda-lo-evaluado` (**sin mergear**)

### Qué se hizo

**La 5.21, que es una tarea nueva**, y cierra la decisión D10.

Se agregó al roadmap siguiendo el precedente del propio archivo: cuando una
decisión exige trabajo, se crea una tarea al final de la fase. Así nacieron la
2.10 y la 2.11.

### ATENCIÓN: hay migración nueva

**Los tres tienen que correr `npx prisma migrate dev` y después
`npm run setup`.** Sin lo segundo el cliente de Prisma queda con el modelo viejo
y `npm run check` falla con errores de tipo que no tienen nada que ver con lo
que uno esté escribiendo.

**La migración solo crea una tabla.** No toca ninguna existente, así que no hay
riesgo de perder datos ni de que pida resetear.

### El problema que resuelve

`ConsultaInteraccion` guardaba paciente, usuario, fecha y las observaciones.
**Nada sobre los medicamentos que se evaluaron.** O sea que de una consulta solo
sobrevivía lo que dio positivo.

Dos consecuencias:

**Una consulta sin hallazgos quedaba vacía.** Se evalúan clonazepam y
paracetamol, ninguno está en ONCHigh, el resultado es cero interacciones y la
fila guardada dice: usuario, fecha, y nada. En `/consultas` (5.20) eso se lee
como "consulta del 08/09 — sin observaciones", sin poder saber de qué.

**Y rompía la distinción que el sistema no puede perder.** Todo el módulo
clínico está construido alrededor de que *"no hay interacciones"* y *"no tengo
datos de esta droga"* son cosas distintas. En la pantalla el aviso salía bien
—la lista está en memoria—, pero al reabrir la consulta guardada no había de
dónde sacarla, así que el registro histórico diría "no se encontraron
interacciones" a secas. Eso convierte *"no había contra qué revisar"* en
*"revisado y limpio"*.

### Qué se agregó

`MedicamentoEvaluado`, tabla de unión entre `ConsultaInteraccion` y
`Medicamento`, con `@@unique([consultaId, medicamentoId])`.

**Explícita y no implícita**, aunque Prisma sepa crear la tabla sola. Dos
razones: una tabla que Prisma genera por su cuenta **no aparece en
`schema.prisma`**, y el modelo de datos es lo que se defiende; y el `@@unique`
deja escrito que el mismo medicamento no se evalúa dos veces en la misma
consulta, regla que el servicio ya garantiza (5.07) pero de la que la base no
tiene por qué depender.

**Lo que no se agregó, a propósito:** no se guarda si el medicamento tenía
cobertura al momento de la consulta, ni su RxCUI de entonces. Ninguna tarea lo
pide y los datos de `Interaccion` se cargan una sola vez. La cobertura se
recalcula con `rxcuisConCobertura`. Si alguna vez hiciera falta congelarla, la
tabla ya existe y sumar la columna es una migración chica.

El detalle completo está en
`docs/decisiones/0014-la-consulta-guarda-lo-que-evaluo.md`.

### Cómo verificarlo

Script descartable contra la base, **10 casos, todos dan lo esperado**. Arma las
consultas con Prisma directo, porque el servicio que las crea es la 5.09 y
todavía no existe.

| Caso | Qué se probó |
| --- | --- |
| Con hallazgos | guarda los 3 evaluados; **quedan los que NO dieron interacción** |
| **Sin hallazgos** | sigue sin observaciones, **pero ahora se sabe qué evaluó** |
| **Sin hallazgos** | **se reconstruye el aviso de falta de cobertura** al reabrirla, sin nada en memoria |
| Reglas | el mismo medicamento dos veces en la misma consulta se rechaza; en consultas distintas sí entra; borrar la consulta se lleva sus filas |

El tercero es el que motivó la tarea: la consulta guardada de clonazepam +
paracetamol se reabre y vuelve a decir que de esas dos drogas la fuente no tiene
datos.

`npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **La 5.09 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14. Acá la rama tiene que aportar el esquema, la
migración y la decisión:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.21-la-consulta-guarda-lo-evaluado
```

### Qué sigue

**La 5.09 se destraba, y es la que abre todo lo demás.**

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.09** | L | `src/services/consultas.ts`: crear consulta, observaciones y **medicamentos evaluados**, en una transacción |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.04** | M | Manejo de errores global |

De la 5.09 cuelgan los route handlers, las pantallas de paciente y de consulta, y
la **6.06**, que es el seed de la demostración.

**Si trabajan dos en paralelo: 5.09 con 6.02, o 5.09 con 6.04.** Van por
carpetas distintas. **La 5.03 no se toma:** quedó sin efecto por la decisión
`0012`.

### Lo que la 5.09 tiene que hacer sí o sí

Está en su fila del roadmap, pero conviene repetirlo:

1. **Crear la consulta, las observaciones y las filas de `MedicamentoEvaluado`
   en una sola transacción.** Una consulta guardada sin su lista de evaluados es
   el problema de la D10 otra vez.
2. **Guardar TODOS los medicamentos evaluados, tengan `rxcui` o no.** Uno sin
   código también se evaluó; lo que no se pudo es cruzarlo, y eso es información
   que la pantalla tiene que dar (decisión `0005`).
3. **Validar con `validarMedicamentosDeConsulta`** antes de evaluar nada.
4. **Componer el texto con `redactarObservacion`**, de `src/lib/redaccion`.

### Antes de arrancar, tener en cuenta

- **Corré la migración y después `npm run setup`.**
- **Las interacciones se evalúan sobre la medicación VIGENTE**, no sobre el
  historial. `listarMedicacionVigente`, no `listarMedicacionDePaciente`.
- **`ordenarParRxcui` normaliza los pares.** Está en `src/lib/rxcui.ts`.
- **`rxcuisConCobertura` no es opcional para las pantallas.** Sin ella, "sin
  datos" se muestra como "sin interacciones". Las tareas 5.13, 5.16 y 5.18 ya lo
  dicen en el roadmap, con el texto que tiene que ver el usuario en cada caso.
- **Ningún dato clínico se inventa.**
- **Todas las interacciones tienen severidad `ALTA`.** La fuente no publica una
  escala. La 5.18 va a mostrar un solo color y está asumido.
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
