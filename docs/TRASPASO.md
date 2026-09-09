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
**Rama:** `feat/5.18-pantalla-de-resultado` (**sin mergear**)

### Qué se hizo

**La 5.18: la pantalla de resultado.** Reemplaza la pantalla provisoria que
había dejado la 5.16. **El módulo clínico ya se puede demostrar entero**: cargar
un paciente, cargarle medicación, evaluar interacciones y leer el resultado.

| Archivo | Qué |
| --- | --- |
| `src/app/consultas/[id]/ResultadoDeConsulta.tsx` | La pantalla. Nueva |
| `src/app/consultas/[id]/page.tsx` | **Reescrito**: ya no es provisorio |

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md`, sección **"Migraciones pendientes de aplicar"**, arriba de
todo. **Juan Pablo y Juan José tienen dos sin correr.**

### La regla que organiza toda la pantalla

**"Sin interacciones" y "sin datos" no se pueden ver igual.**

- *"No se encontraron interacciones"* significa que se cruzaron las drogas
  contra la fuente y no había ningún par cargado.
- *"Sin datos en la fuente"* significa que esa droga **nunca entró al cruce**.
  No se revisó. No se sabe.

Por eso el bloque de drogas sin cobertura **aparece siempre que haya alguna, no
solo cuando el resultado viene vacío**. Un resultado con tres interacciones y
una droga sin datos tampoco está completo.

Va con `role="alert"`: es lo que le falta al resultado, y quien use un lector de
pantalla tiene que enterarse sin ir a buscarlo.

### Un caso que la tarea no pedía y conviene que esté

Cuando el resultado viene vacío **y además hay menos de dos drogas cruzables**,
debajo del texto obligatorio aparece la razón:

> Solo uno de los medicamentos evaluados se pudo cruzar contra la fuente, así
> que no hubo ningún par que revisar.

Sin eso, una consulta de dos drogas donde una no tiene RxCUI diría solamente "no
se encontraron interacciones", que es cierto y engañoso al mismo tiempo: no se
encontró nada porque no hubo nada que buscar.

### Sobre el color por severidad

Está escrito para las tres —`ALTA` crítico, `MEDIA` advertencia, `BAJA` neutro—,
pero hoy todas las filas de la fuente entran como `ALTA`. **En la práctica se ve
un solo color, y no es un defecto de esta pantalla**: ONCHigh no publica una
escala y graduarla sería inventarla (decisión `0011`).

`BAJA` va en neutro y no en verde: una interacción de severidad baja sigue
siendo una interacción, y verde diría "esto está bien".

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`. Se armaron tres consultas:

**A — con hallazgos, y con drogas sin cobertura:**

```
1 interacción encontrada
  Escitalopram + Haloperidol            [Severidad alta]
  Escitalopram + Haloperidol: interaccion de severidad alta.
  Ambos farmacos prolongan el intervalo QT. Par de alta prioridad…
  Fuente: ONC High Priority List (Phansalkar et al., JAMIA 2012)…

Sin datos en la fuente: no se pudo revisar esta droga
  Clonazepam       — la fuente no tiene datos de esta droga
  PRUEBA-Zopiclona — no tiene RxCUI cargado, no hay por dónde cruzarla
```

**Ese segundo bloque saliendo junto con una interacción encontrada es el
requisito central de la tarea.**

**B — sin hallazgos, ninguna cruzable:** el texto obligatorio, más "Ninguno de
los medicamentos evaluados se pudo cruzar contra la fuente", más el bloque de
sin datos.

**C — sin hallazgos, una sola cruzable:** el texto obligatorio, más "Solo uno de
los medicamentos evaluados se pudo cruzar…".

**Una consulta que no existe** muestra "Esa consulta no existe", no la pantalla
de error.

### Un defecto que se corrigió al verificar

La frase de cierre del bloque de sin cobertura decía, con **una sola** droga:

> El resultado de arriba no dice nada sobre esta droga: no que **estén** bien,
> sino que no se **revisaron**.

Singular y plural mezclados, justo en la frase donde más importa que se entienda.
Ahora concuerda de punta a punta en los dos casos. **Se vio leyendo la pantalla,
no compilando.**

Los datos de prueba **se borraron**: 0 pacientes, 0 consultas, los 10
medicamentos del seed y las 1150 interacciones. `npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **No hay precarga del paciente** al entrar desde la ficha: es la **5.17**.
- **"Consultas" sigue pendiente en la barra lateral**, porque `/consultas` —el
  listado— es la **5.20**. Hoy se llega desde la ficha de un paciente o
  escribiendo la URL.
- **El aviso de "el sistema asiste, no decide" está como texto chico al pie**
  de las pantallas clínicas. Formalizarlo es la **5.19**.
- **La consulta no muestra el paciente.** El resultado trae `pacienteId` pero no
  el seudónimo, así que la pantalla no lo dibuja. Si la 5.20 lo necesita,
  conviene que `obtenerConsulta` lo traiga resuelto, como hace
  `GET /api/medicacion`.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.18-pantalla-de-resultado
```

### Qué sigue

**Quedan tres tareas de la fase 5**, y ninguna es grande:

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.20** | M | Pantalla `/consultas`: lista por fecha. **Habilita la barra lateral** |
| **5.17** | M | Precarga: al elegir un paciente vienen sus medicamentos vigentes |
| **5.19** | S | Aviso obligatorio en toda pantalla clínica |

**La 5.20 primero**, porque es la que destraba la última sección pendiente de la
barra lateral y cierra el recorrido: hoy una consulta guardada solo se puede
volver a abrir si alguien anotó la dirección.

**Le va a hacer falta una `listarConsultas` en `src/services/consultas.ts`**, y
que `GET /api/consultas` sin `id` devuelva el listado. Conviene que cada fila
traiga la fecha, el seudónimo del paciente si lo hay, y la cantidad de
observaciones.

### Antes de arrancar, tener en cuenta

- **Las pantallas consumen la API, no importan el servicio.**
- **"Sin interacciones" y "sin datos" no se pueden ver igual.** Es la regla que
  atraviesa todo el módulo (decisión `0012`).
- **La `evaluabilidad` viene resuelta del servidor.**
- **El texto de la observación viene guardado**, no se recompone al mostrar. La
  cobertura sí se recalcula al releer (decisión `0014`).
- **`src/components/ui/` tiene cinco componentes**: Boton, Campo, Tabla, Modal
  y Chip. Algo sube ahí cuando **dos** rutas necesitan lo mismo.
- **Las pantallas cargan datos con `setTimeout(…, 0)` dentro de un
  `useEffect`.** Es un parche para el linter, documentado en
  `src/app/stock/TablaDeStock.tsx`.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.**
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
