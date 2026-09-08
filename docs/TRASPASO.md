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

**Tres ramas apiladas, ninguna mergeada.** Se mergean en este orden:

1. `feat/6.01-layout-y-navegacion`
2. `feat/5.01-servicio-de-pacientes`
3. `feat/5.02-importar-onchigh`

Están apiladas a propósito: las tres tocan `docs/ROADMAP.md` y este archivo, y
mergeadas en paralelo chocan en la tabla "En curso ahora".

### Qué se hizo

| Tarea | Qué dejó |
| --- | --- |
| 6.01 | Barra lateral de navegación, y pantalla de inicio provisoria |
| 5.01 | `src/services/pacientes.ts` |
| 5.02 | **1150 interacciones cargadas** desde ONCHigh, con su generador y su procedencia |
| — | Decisiones `0011` y `0012`. La `0012` cierra la D9 |

### 6.01 — Layout

Barra a la izquierda con las cinco secciones, resaltando la abierta; en pantalla
angosta pasa arriba en fila. Vive en `src/components/layout/`, carpeta nueva:
los cuatro de `src/components/ui/` son primitivas y la barra no lo es.

**Pacientes y Consultas figuran pero no son enlaces**, porque esas pantallas son
la 5.11 y la 5.20 y darían 404. Van en gris con la etiqueta **Pendiente**.
Cuando existan, se les saca `pendiente: true` de `SECCIONES`.

**Se borró la plantilla de `create-next-app`.** Lo que quedó **no es la 6.03**:
no consulta la base, no tiene tarjetas, y lo aclara en pantalla.

### 5.01 — Servicio de pacientes

`listarPacientes`, `buscarPacientesPorSeudonimo`, `obtenerPacientePorId` y
`crearPaciente`, con la forma de `medicamentos.ts`.

- **El seudónimo se normaliza con `trim()`** antes de comparar y de guardar. Un
  espacio invisible al final daría dos fichas de la misma persona.
- **El duplicado se busca sin distinguir mayúsculas.** El `@unique` del esquema
  sí las distingue, así que `PAC-001` y `pac-001` entrarían los dos.
- **Un seudónimo de 7 u 8 dígitos pelados se rechaza**: casi seguro es un DNI en
  el campo equivocado. Es estrecha a propósito —`PAC-001`, `A-38123456` y `H12`
  pasan— y si al equipo le parece de más, se borra `PARECE_DOCUMENTO`.

Verificado contra la base con un script descartable: 13 casos, todos dan lo
esperado.

### 5.02 — ONCHigh importado

**`prisma/datos/onchigh.json`: 1150 interacciones**, generadas por
`prisma/datos/generar-onchigh.mjs`, que quedó versionado con las instrucciones
para rehacerlo en su cabecera. El script **no corre en cada seed** y **no agrega
ninguna dependencia**: necesita `xlsx`, que se instala en una carpeta aparte.

El seed carga el JSON al final, con `readFileSync` y no con `import`: son 700 KB
y por el sistema de módulos obligaría a prender `resolveJsonModule` y a que
TypeScript le infiera un tipo a cada fila en cada `npm run check`.

**El mapeo DrugBank → RxCUI resuelve 123 de 123.** Era el riesgo grande de la
tarea y no lo fue.

**Lo que la fuente no trae es severidad ni descripción.** Confirmado por tres
caminos: la planilla tiene cuatro columnas y ninguna es severidad; el script de
carga del proyecto de origen lee esos mismos cuatro campos; y en el conjunto
combinado las 4031 filas de ONC tienen `effectConcept = None`.

Por eso:

- **Todas entran con severidad `ALTA`.** ONCHigh es, por definición, una lista de
  alta prioridad. Graduarla sería inventar la graduación. **La 5.18 va a mostrar
  una sola severidad, y eso está asumido.**
- **La descripción se compone con la clase**, que sí es dato publicado: la
  planilla organiza las interacciones por pares de clases. Queda, por ejemplo:
  _"Par de alta prioridad de la lista ONC: ISRS (fármaco afectado) con IMAO
  (fármaco desencadenante). Entrada #8 de la lista."_ **No dice qué le pasa al
  paciente**, porque la fuente no lo dice.

El detalle completo, incluidas las correcciones de mapeo una por una y las
erratas de la fuente que **no** se corrigieron, está en la decisión `0011`.

### Lo más importante que sale de acá: `src/lib/rxcui.ts`

`Interaccion` tiene `@@unique([rxcui1, rxcui2])` y una interacción no tiene
dirección. Si una fila entra como (A, B) y otra como (B, A), la unicidad no las
ve duplicadas **y el motor de la 5.06 buscaría por un orden sin encontrar la
fila cargada con el otro**. Una interacción no detectada es el peor error
posible en este sistema.

`ordenarParRxcui` es la única definición válida de cuál va primero. **Todo lo
que escriba o consulte `Interaccion` tiene que pasar por ahí.**

De los 1930 pares del archivo quedan 1150: la fuente trae cada par en las dos
direcciones.

### El hallazgo que cambia la 6.06 (decisión `0012`, cierra la D9)

Con los datos ya en la base se midió el cruce contra el catálogo real:

| | |
| --- | --- |
| Medicamentos del seed con RxCUI | 10 |
| Presentes en ONCHigh | **4** |
| **Interacciones detectables entre ellos** | **1** |

Una sola: escitalopram con haloperidol.

**El problema no es la fuente, es el catálogo.** ONCHigh está lleno de
psicofármacos —citalopram, clorpromazina, tioridazina, pimozida, los IMAO, los
tricíclicos, carbamazepina, metadona—; el seed se armó en la 2.08, antes de que
hubiera fuente. Con un catálogo de 20 drogas tomadas de la propia lista da **47
interacciones**, medido contra la base cargada.

**Se resuelve en la 6.06**, el seed definitivo, que crece de alcance. Y **la
5.03 queda sin efecto**: existía como red por si el mapeo fallaba.

De esto sale una obligación de interfaz para la 5.16 y la 5.18: hay **tres**
casos, no dos. "No hay interacciones registradas", "falta el `rxcui`" y **"la
fuente no cubre esta droga"**. Confundir _sin interacciones_ con _sin datos_ es
el error que este sistema no puede cometer.

### Qué quedó sin hacer

- **Las tres ramas sin mergear.**
- **La migración de `MedicacionVigente`.** Ver abajo.
- **Toda la fase 5 de la 5.04 en adelante.**
- **D8 sigue abierta.**

### Cómo verificarlo

Con `docker compose up -d`, `npx prisma db seed` y `npm run dev`:

| Qué | Resultado |
| --- | --- |
| Seed | Dice "Cargando 1150 interacciones" |
| Filas en `Interaccion` | 1150 |
| Pares canónicos distintos | 1150 — no hay duplicados invertidos |
| Filas fuera del orden canónico | 0 |
| Pares de una droga consigo misma | 0 |
| Cruce con el catálogo actual | 1 interacción |
| Cruce con el catálogo de 20 drogas de la `0012` | 47 interacciones |
| `/` | Barra a la izquierda, **Inicio** resaltado |
| Clic en **Stock** y después en **Ver lotes** | La sección abierta sigue siendo Stock |
| 375 px | La barra pasa arriba; la tabla se desplaza dentro de su caja |

`npm run check` da 0 en las tres ramas.

### Qué sigue

1. **La migración de `MedicacionVigente`**, y después **5.04** y **5.05**.
2. **5.06** — el motor de interacciones. Ya tiene contra qué cruzar.
3. **5.07** y **5.08** — validación de dos medicamentos, y la redacción por
   plantilla.

### La migración que hace falta, y ya está decidida

`MedicacionVigente` hoy tiene `pacienteId`, `medicamentoId` y las marcas de
tiempo. **Nada más.** Cinco tareas piden campos que no existen: la 5.04
(suspender con motivo), la 5.05 (estado derivado de fechas y motivo), la 5.13
(mostrar fecha de inicio y estado), la 5.14 (modal con fecha de inicio) y la
5.15 (motivo obligatorio).

**Lo decidido el 2026-09-08:** se agregan `fechaInicio`, `fechaFin` y
`motivoSuspension`, y **se saca el `@@unique([pacienteId, medicamentoId])`**.

El `@@unique` se saca porque impide el historial: una droga suspendida y después
reiniciada son dos filas, no una sobrescrita. La regla "una sola vigente por
paciente y por droga" pasa al servicio. Es el mismo criterio del módulo de
stock, donde nada se reescribe.

**Esa migración todavía no se hizo.** Va antes de la 5.04.

### Antes de arrancar, tener en cuenta

- **`ordenarParRxcui` es obligatorio** en cualquier lectura o escritura de
  `Interaccion`.
- **Ningún dato clínico se inventa.** Las descripciones dicen la clase, no el
  efecto, porque la fuente no publica el efecto.
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **Una consulta de interacciones necesita al menos dos medicamentos.**
- **El sistema asiste, no decide.**
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Las secciones nuevas se agregan en `SECCIONES`**, en
  `src/components/layout/BarraLateral.tsx`.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **Después de cambiar el esquema, `npm run setup` antes de `npm run check`.**

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
