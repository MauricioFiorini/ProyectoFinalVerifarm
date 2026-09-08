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
**Rama:** `feat/5.07-minimo-dos-medicamentos` (**sin mergear**)

### Qué se hizo

**La 5.07**, y **se abrió la decisión D10**, que hay que resolver antes de la
5.09.

### 5.07 — Una consulta necesita al menos dos medicamentos

`validarMedicamentosDeConsulta` y la constante `MINIMO_DE_MEDICAMENTOS`, al
final de `src/services/interacciones.ts`. Es la restricción `2..*` del modelo,
que hasta ahora vivía solo en el diagrama.

**Por qué no está adentro del motor.** `evaluarInteracciones` con una sola droga
devuelve lista vacía, y está bien que así sea: la pregunta que responde es
"cuáles de estas interactúan", y con una sola la respuesta honesta es "ninguna".

Lo que no puede pasar es que **eso** llegue a la pantalla como "no se
encontraron interacciones". Con una sola droga no se encontró nada porque no
había nada que buscar, y mostrarlo igual que un esquema de cinco drogas revisado
y limpio es dar por revisado lo que nunca se revisó. Así que la regla se cumple
un escalón más arriba: la consulta se rechaza **antes** de evaluar nada.

**Se cuentan medicamentos, no RxCUI.** Un medicamento sin `rxcui` igual cuenta.
No se puede cruzar contra la tabla (decisión `0005`), pero la consulta con esos
dos medicamentos es legítima: se hizo, y el sistema tiene que decir que de uno
de los dos no tiene datos. Filtrar por `rxcui` acá convertiría "no tengo el
código de esta droga" en "elegiste mal", que son cosas distintas.

**El mismo medicamento dos veces no son dos medicamentos**, y el mensaje lo
dice con esas palabras. Puede pasar de verdad: la pantalla de consulta (5.16)
precarga la medicación del paciente (5.17) y después se agrega a mano una droga
que ya estaba.

**Devuelve la lista sin repetidos** en vez de solo validar, para que quien la
llama no rehaga el mismo `Set`. Si se dedujera dos veces y una de las dos
cambiara, la validación y lo que se evalúa dejarían de coincidir.

### Cómo verificarlo

Script descartable, **15 casos, todos dan lo esperado**. No toca la base: la
validación es pura.

| Bloque | Qué se probó |
| --- | --- |
| Rechazos | lista vacía; un solo medicamento; el mismo dos veces; el mismo tres veces |
| Aceptados | dos distintos; tres distintos; tres con uno repetido; cinco con dos repetidos |
| Lo que devuelve | sin repetidos; conserva el orden de la primera aparición |
| Mensajes | "elegiste uno solo" y "elegiste dos veces el mismo" dan textos distintos |

`npm run check` da 0.

### D10 — Una consulta no guarda qué medicamentos se evaluaron

**Esto se encontró leyendo el modelo para escribir la 5.07, y hay que resolverlo
antes de la 5.09.**

`ConsultaInteraccion` tiene: paciente (opcional), usuario (opcional), fecha y
las observaciones. **Nada más.** No hay ninguna relación con los medicamentos
que se evaluaron.

Tres consecuencias, y ninguna es teórica:

1. **Una consulta que no encuentra nada queda con cero observaciones.** La fila
   dice que alguien consultó; no dice qué consultó. En `/consultas` (5.20) esa
   consulta aparece vacía y no se puede distinguir de un error.
2. **La 5.18 no puede reconstruirse.** Esa tarea pide mostrar, junto al estado
   vacío, los medicamentos evaluados que la fuente no cubre. En el momento de la
   pantalla esa lista está en memoria; si después se vuelve a abrir la consulta
   guardada, no hay de dónde sacarla.
3. **Para la defensa es débil.** Un sistema de apoyo clínico que no puede decir
   qué revisó es difícil de sostener, y es justo el tipo de pregunta que el
   jurado hace.

**Requiere migración**, así que no se decide sobre la marcha: está en la tabla
de decisiones abiertas del roadmap. La forma más chica sería una tabla de unión
entre `ConsultaInteraccion` y `Medicamento`, pero **la forma la decide el
equipo, no esta tarea.**

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **La D10**, que bloquea la 5.09, la 5.18 y la 5.20.
- **La 5.09 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14. Acá la rama tiene que aportar
`src/services/interacciones.ts` modificado:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.07-minimo-dos-medicamentos
```

### Qué sigue

**Primero la D10.** Es lo único que traba el camino principal.

Mientras tanto, dos tareas libres que no dependen de ella:

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.04** | M | Manejo de errores global: página de error y componente por sección |

Resuelta la D10, sigue la **5.09** (`src/services/consultas.ts`), de la que
cuelgan los route handlers, las pantallas de paciente y de consulta, y la
**6.06**, que es el seed de la demostración.

**La 5.03 no se toma:** quedó sin efecto por la decisión `0012`.

### Antes de arrancar, tener en cuenta

- **La consulta se valida con `validarMedicamentosDeConsulta`** antes de evaluar
  nada. No repetir la cuenta a mano en el route handler ni en la pantalla.
- **El texto de la observación se compone con `redactarObservacion`**, importado
  de `src/lib/redaccion`. Nunca desde `plantilla.ts` directo.
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
- **Si falta aplicar la migración de la 5.04:** `npx prisma migrate dev` y
  después `npm run setup`.

### Bloqueos

**La D10 bloquea la 5.09, la 5.18 y la 5.20.** Es lo primero que hay que
resolver. D8 sigue abierta y no bloquea nada.
