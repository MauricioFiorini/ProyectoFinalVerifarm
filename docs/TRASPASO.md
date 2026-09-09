# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-09-09
**Entrega:** Mauricio Mateo Fiorini
**Rama:** `feat/5.20-listado-de-consultas` (**sin mergear**)

### Qué se hizo

**La 5.20: el listado de consultas.** Con esto **la barra lateral no tiene
ninguna sección pendiente**: las cinco son navegables.

| Archivo | Qué |
| --- | --- |
| `src/app/consultas/page.tsx` | El encabezado |
| `src/app/consultas/ListaConsultas.tsx` | La tabla. Nueva |
| `src/services/consultas.ts` | `listarConsultas()` y el seudónimo resuelto |
| `src/app/api/consultas/route.ts` | `GET` sin `id` devuelve el listado |
| `src/app/consultas/[id]/ResultadoDeConsulta.tsx` | Muestra de qué paciente era |
| `src/components/layout/BarraLateral.tsx` | Se le sacó `pendiente: true` |

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md`, sección **"Migraciones pendientes de aplicar"**, arriba de
todo. **Juan Pablo y Juan José tienen dos sin correr.**

### Las dos cuentas de cada fila no son adorno

Cada fila trae **cuántos medicamentos se evaluaron** y **cuántas interacciones
salieron**. Sin la primera, una consulta sin hallazgos se lee como una fila
rota; con ella se ve lo que es: se revisaron cuatro drogas y no salió nada.

Es la misma idea que atraviesa el módulo: que no se pueda confundir "no hay
nada" con "no se sabe".

Una consulta sin paciente dice **"Consulta suelta"** en vez de dejar la celda
vacía. No es un dato que falte: es el caso del médico de guardia, que el esquema
contempla desde la 2.02.

### Dos cosas que se agregaron con el listado

**`GET /api/consultas` sin `id` devuelve el listado.** Los dos casos conviven en
el mismo endpoint porque son la misma cosa mirada con distinto detalle.

**El resultado ahora dice de qué paciente era.** Estaba anotado como hueco en el
traspaso anterior, y con el listado se volvió un problema real: desde ahí se
entra a una consulta y la pantalla no decía a quién correspondía.
`obtenerConsulta` y `crearConsulta` devuelven el seudónimo resuelto, no solo el
`pacienteId`.

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`, en `/consultas`:

| Qué | Resultado |
| --- | --- |
| Dos consultas cargadas | Se listan de la más reciente a la más antigua |
| La del paciente | `PAC-001` · 3 evaluados · chip rojo "1 interacción" |
| La suelta | "Consulta suelta" · 4 evaluados · "Sin interacciones" |
| "Ver" | Lleva al resultado, y **es un `<a>` real** |
| El resultado | Ahora dice "· PAC-001" en el encabezado |
| Sin consultas | "Todavía no se hizo ninguna consulta" |
| **Barra lateral** | **Consultas ya no dice PENDIENTE** |

Los datos de prueba **se borraron**: 0 pacientes, 0 consultas, los 10
medicamentos del seed y las 1150 interacciones. `npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **Sin filtros ni paginado.** Lo pide así la tarea. Con volumen chico alcanza;
  un filtro que nadie usó todavía es una decisión tomada sin datos.
- **No hay precarga del paciente** al entrar desde la ficha: es la **5.17**.
- **El aviso clínico está como texto chico al pie.** Formalizarlo es la **5.19**.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.20-listado-de-consultas
```

### Dónde está el proyecto

```
Fase 5 — módulo clínico ....  18 de 21
Fase 6 — cierre ...........    1 de 10
```

**Los dos módulos del proyecto están funcionando de punta a punta.** El de stock
desde la fase 4; el clínico, con esta tarea. Se puede recorrer entero: cargar un
paciente, cargarle medicación, evaluar interacciones, leer el resultado y
volver a abrirlo desde el listado.

### Qué sigue

**Quedan dos tareas de la fase 5**, las dos chicas:

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.17** | M | Precarga: al elegir un paciente vienen sus medicamentos vigentes |
| **5.19** | S | Aviso obligatorio en toda pantalla clínica |

Y después **la fase 6 entera menos la 6.01**. De esas, la que no se puede
recortar es la **6.06**, el seed definitivo: sin datos que disparen
interacciones no hay demostración, y hoy **el catálogo cruza con una sola**
(decisión `0012`).

**Para la 5.17:** la ficha ya enlaza a `/consultas/nueva`. Alcanza con pasarle
`?pacienteId=…` y que la pantalla, al arrancar con ese parámetro, pida
`GET /api/medicacion?pacienteId=…` **sin** `incluirNoVigentes` —una droga
suspendida ya no la toma— y precargue esos medicamentos. La respuesta ya trae el
paciente resuelto, así que también sirve para dejarlo elegido.

**Para la 5.19:** el texto ya está, repetido al pie de las pantallas clínicas.
Lo que falta es que sea un componente y no cuatro copias, y que esté en todas.

### Antes de arrancar, tener en cuenta

- **Las pantallas consumen la API, no importan el servicio.**
- **"Sin interacciones" y "sin datos" no se pueden ver igual.** Es la regla que
  atraviesa todo el módulo (decisión `0012`).
- **La `evaluabilidad` viene resuelta del servidor.**
- **El texto de la observación viene guardado**, no se recompone al mostrar. La
  cobertura sí se recalcula al releer (decisión `0014`).
- **`src/components/ui/` tiene cinco componentes**: Boton, Campo, Tabla, Modal
  y Chip. Algo sube ahí cuando **dos** rutas necesitan lo mismo. **La 5.19 es
  candidata a un sexto**, porque el aviso va en varias pantallas.
- **Las pantallas cargan datos con `setTimeout(…, 0)` dentro de un
  `useEffect`.** Es un parche para el linter, documentado en
  `src/app/stock/TablaDeStock.tsx`.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.**
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
