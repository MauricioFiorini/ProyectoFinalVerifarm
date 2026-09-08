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
**Rama:** `feat/6.01-layout-y-navegacion` (**sin mergear**)
**Commit:** `ea96199` (reserva) y el que trae este traspaso

### Qué se hizo

**La 6.01: layout general con barra lateral.** Es la primera tarea de la fase 6
y se hizo antes que la fase 5 a propósito: hasta ahora a `/medicamentos` y a
`/stock` se llegaba escribiendo la URL a mano, y las pantallas clínicas que
vienen iban a heredar el mismo problema.

Tres archivos:

| Archivo | Qué es |
|---|---|
| `src/components/layout/BarraLateral.tsx` | La barra. Nuevo. |
| `src/app/layout.tsx` | La envuelve alrededor de todas las pantallas. |
| `src/app/page.tsx` | Pantalla de inicio provisoria. **Reescrito entero.** |

**`src/components/layout/` es una carpeta nueva y es a propósito.** Los cuatro
componentes de `src/components/ui/` son primitivas —botón, campo, tabla, modal—
y la barra no es una primitiva: es estructura de la aplicación. Meterla ahí
habría roto la regla de que en `ui/` hay exactamente cuatro archivos.

### Dos decisiones que conviene conocer

**Pacientes y Consultas figuran en la barra pero no son enlaces.** Esas
pantallas son la 5.11 y la 5.20 y todavía no existen; un enlace daría 404, que
en una demostración se lee como que el sistema está roto. Se muestran en gris,
con la etiqueta **Pendiente** y un `title` que dice qué tarea las habilita.
Aparecen igual porque el mapa completo es información útil: dice que hay dos
módulos y que uno está a medio construir.

Cuando esas pantallas existan, alcanza con sacarles `pendiente: true` de la
lista `SECCIONES`. No hay que tocar nada más.

**Se borró la plantilla de `create-next-app`.** La pantalla de inicio todavía
tenía el logo de Vercel y los botones de "Deploy Now" y "Documentation". Con la
barra puesta, esa pantalla pasa a ser el destino del enlace **Inicio**, y no se
puede dejar código de andamio como primera pantalla del sistema.

**Lo que quedó en su lugar NO es la 6.03.** Es un párrafo que dice qué hace el
sistema y que se entra por la barra. No consulta la base, no tiene tarjetas y lo
dice en pantalla: *"Pantalla provisoria. El tablero (…) es la tarea 6.03"*. La
6.03 sigue pendiente y sigue dependiendo de la 4.11 y la 5.20.

### Un detalle del layout que no es decorativo

La columna de contenido lleva `min-w-0`. Sin eso, una tabla ancha estira el
contenedor flex y empuja la barra fuera de la pantalla, en vez de desplazarse
dentro de su propia caja. Se verificó en 375 px con la tabla de lotes.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **`Inicio` no está en la barra como tarjetas**: es la 6.03.
- **No hay selector de usuario simulado**: es la 6.02, y ya se puede tomar.
- **Toda la fase 5.**
- **D8 sigue abierta.**

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`:

| Qué | Resultado |
|---|---|
| `/` | La barra a la izquierda, **Inicio** resaltado, sin rastro de la plantilla de Next |
| Clic en **Stock** | Va a `/stock` y **Stock** queda resaltado |
| Clic en **Ver lotes** | En `/stock/[id]` la sección abierta **sigue siendo Stock** |
| **Pacientes** y **Consultas** | En gris, con la etiqueta Pendiente, no son clicables |
| 375 px de ancho | La barra pasa arriba en fila y se desplaza en horizontal; la tabla se desplaza dentro de su caja |
| Consola del navegador | Sin errores |

`npm run check` da 0.

### Qué sigue

**La fase 5**, el módulo clínico, en este orden:

1. **5.01** — servicio de pacientes. No depende de nada pendiente.
2. **El sondeo de ONCHigh**, y recién ahí elegir entre la **5.02** y la **5.03**.
3. **5.06**, **5.07** y **5.08** — el motor y la redacción.
4. **5.04** y **5.05** — medicación. **Necesitan una migración**, ver abajo.

### La migración que hace falta, y ya está decidida

`MedicacionVigente` hoy tiene `pacienteId`, `medicamentoId` y las marcas de
tiempo. **Nada más.** Cinco tareas piden campos que no existen:

| Tarea | Necesita |
|---|---|
| 5.04 | suspender **con motivo** |
| 5.05 | estado derivado a partir de **fechas y motivo** |
| 5.13 | mostrar **fecha de inicio** y estado |
| 5.14 | modal con **fecha de inicio** |
| 5.15 | modal que pide **motivo obligatorio** |

**Lo decidido el 2026-09-08:** se agregan `fechaInicio`, `fechaFin` y
`motivoSuspension`, y **se saca el `@@unique([pacienteId, medicamentoId])`**.

El `@@unique` se saca porque impide el historial: una droga suspendida y después
reiniciada son dos filas, no una sobrescrita. La regla "una sola vigente por
paciente y por droga" pasa al servicio, que es donde se puede expresar con la
precisión que hace falta. Es el mismo criterio del módulo de stock, donde los
movimientos son un libro mayor y nada se reescribe.

**Esa migración todavía no se hizo.** Va antes de la 5.04.

### Antes de arrancar, tener en cuenta

- **Ningún dato clínico se inventa.** Ni interacciones, ni severidades, ni
  descripciones. **Esto alcanza también a la 5.03:** "carga manual de 15 pares"
  no significa quince pares elegidos de memoria, significa quince pares de una
  fuente citable. La fuente adoptada es ONCHigh (decisión `0010`).
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **Una consulta de interacciones necesita al menos dos medicamentos.**
- **El sistema asiste, no decide.** Ante una interacción se informa; no se
  bloquea nada.
- **`Interaccion` tiene `@@unique([rxcui1, rxcui2])`** y el esquema aclara que
  el par se ordena en código antes de insertarlo. Sin eso, `(A,B)` y `(B,A)`
  entran las dos.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Las secciones nuevas se agregan en `SECCIONES`**, en
  `src/components/layout/BarraLateral.tsx`.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **Después de cambiar el esquema, `npm run setup` antes de `npm run check`.**

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
