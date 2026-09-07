# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-09-07
**Entrega:** Mauricio Mateo Fiorini
**Rama:** `feat/4.11-pantallas-de-stock` (**sin mergear**)
**Commit:** de `f51e60d` a `e19ce8b`, más el que trae este traspaso

### Qué se hizo

**La fase 4 está completa: 4.01 a 4.17.** El módulo de stock funciona de punta a
punta, con pantallas. Es uno de los dos argumentos centrales del proyecto y ya se
puede demostrar entero.

| Commit | Tarea | Qué dejó |
|---|---|---|
| `f51e60d` | 4.11 | Pantalla `/stock` con indicador de estado, y `GET /api/stock` |
| `0dcfce8` | 4.12 | Pantalla `/stock/[medicamentoId]` con sus lotes |
| `fda3ba9` | 4.13 | Modal de ingreso, y el alta de lote con su cantidad en transacción |
| `7927442` | 4.14, 4.15 | **Modal de dispensación FEFO** y aviso de faltante |
| `be445e1` | 4.16 | Historial de movimientos por lote |
| `e19ce8b` | 4.17 | Indicadores de vencimiento |

**El recorrido de la demostración ya existe:** entrar a `/stock`, ver qué está
bajo mínimo, abrir un medicamento, registrar un ingreso, dispensar una cantidad y
ver cómo el sistema reparte entre lotes empezando por el que vence antes.

### Lo que se encontró verificando, y se corrigió

Tres defectos que aparecieron probando en el navegador, no compilando:

**1. Las fechas se mostraban un día antes.** Se cargó un lote con ingreso 07/09 y
vencimiento 30/06, y la tabla mostraba 06/09 y 29/06. Un `<input type="date">`
manda `"2027-06-30"`, que se interpreta como medianoche **UTC**, y al mostrarlo en
hora local —Argentina es UTC−3— cae el día anterior. **Un día de diferencia en un
vencimiento define si un lote está vencido**, así que no es cosmético. Se resolvió
formateando en la misma zona en la que se guarda, con `src/lib/fechas.ts`.

**2. El total de la pantalla de lotes sumaba los lotes vencidos.** Decía "95 en
total" cuando la pantalla de stock decía 70 para el mismo medicamento. El mismo
dato con dos valores distintos es peor que no mostrarlo. Ahora dice **"70
disponibles en lotes vigentes · 25 en lotes vencidos"**, y lo vencido va en rojo:
no se esconde, se informa aparte porque hay que darlo de baja.

**3. El motor FEFO daba "alcanza" para una cantidad negativa.** Está contado en el
traspaso anterior; se corrigió antes de este bloque.

### Decisiones tomadas sobre la marcha

**El alta de lote con cantidad va en una transacción.** Son dos escrituras: la
fila del lote y su movimiento de INGRESO. Si la segunda fallara quedaría un lote
en cero, que parece existir y no tiene nada. El endpoint `POST /api/lotes` acepta
`cantidad` opcional: con ella entra todo junto o nada.

**En la dispensación se elige cantidad, no lote.** Es el punto del módulo: si la
persona eligiera el lote a mano, FEFO no serviría de nada. El plan lo calcula el
servidor y se muestra tal cual: "80 del lote L-UI-1, vence 30/06/2027 · 20 del
lote L-E-1, vence 12/10/2027", con una línea que explica por qué se reparte.

**El plan no se calcula en el cliente.** La misma lógica que lo propone es la que
lo ejecuta, así que no pueden discrepar. Y al confirmar el servidor replanifica
dentro de la transacción, por si entre la previsualización y el "Confirmar" entró
otro egreso.

**El historial no tiene botones de editar ni borrar, y hay una línea en pantalla
que lo dice.** No es una omisión de la interfaz: es la forma del dominio. Un error
se corrige con un movimiento nuevo.

**`Bajo mínimo` gana sobre `Lote por vencer`.** Un medicamento puede estar en las
dos, y hay que mostrar una: quedarse sin medicación es peor que desperdiciarla.
Cuando pasan las dos, el chip dice el estado crítico y al lado se aclara "y N por
vencer", para no perder el dato.

**El chip de vencimiento dice cuántos días.** "Vencido hace 11 d." y no solo
"Vencido": un lote vencido ayer y uno vencido hace un año piden acciones
distintas.

**Se movió `unidades.ts` a `src/lib/`.** Lo usan la pantalla de medicamentos y la
de stock; vivía dentro de la carpeta de una ruta y la otra tenía que importarlo
de ahí.

### Un parche que conviene que el equipo mire

**Las tres pantallas cargan datos con `setTimeout(…, 0)` dentro de un
`useEffect`.** El timeout no aporta nada al comportamiento: está para que la regla
`react-hooks/set-state-in-effect` no rechace la llamada. **La regla tiene razón**
—cargar datos en un efecto provoca un render de más— y el timeout no lo arregla,
solo lo esconde del linter.

La solución de verdad sería renderizar estas pantallas en el servidor, que es lo
que el App Router espera para datos iniciales. No se hizo por dos razones: las
tres pantallas usan el mismo patrón y tener dos formas distintas de cargar datos
es peor que tener una imperfecta; y cambiarlo implica que las pantallas pasen a
importar el servicio en vez de consumir la API, que es lo contrario de lo que dice
`docs/ARQUITECTURA.md` sección 3.

**Es una decisión de equipo, no de una tarea.** Está anotado en el código, en
`src/app/stock/TablaDeStock.tsx`.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **No hay navegación.** A `/stock` y a `/medicamentos` se llega escribiendo la
  URL. La barra lateral es la **6.01**.
- **No hay endpoint de stock bajo ni de vencimientos próximos.** Los servicios
  existen desde la 4.05 y la 4.06; los va a necesitar la pantalla de inicio
  (**6.03**).
- **Toda la fase 5**, el módulo clínico, que es la más larga y la más importante
  para la defensa.
- **D8 sigue abierta.**

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`. Todo esto se probó en el navegador:

| Qué | Resultado |
|---|---|
| `/stock` | Los tres estados: Normal, Lote por vencer, Bajo mínimo |
| Prioridad de estados | Risperidona muestra "Bajo mínimo **y 1 por vencer**" |
| "Ver lotes" | Lleva a la pantalla del medicamento |
| Modal de ingreso, vencimiento anterior al ingreso | Error debajo del campo Vencimiento |
| Modal de ingreso, alta válida | Crea el lote con su cantidad; la tabla se refresca |
| **Dispensar 50** | Plan: 50 del lote que vence antes |
| **Dispensar 100** | Plan repartido: 80 + 20, con la explicación de por qué |
| **Dispensar 500** | Mensaje "se pidieron 500 y hay 130", y **el botón de confirmar deshabilitado** (comprobado en el DOM) |
| Confirmar 100 | El lote que vence antes queda en 0; el otro baja de 50 a 30 |
| Historial | Ingreso +80 en verde, Egreso −80 en rojo, usuario "Farm. Pérez" |
| Indicadores | "Vencido hace 11 d.", "Vence en 10 d.", "Vigente" |
| Lote vencido con unidades | Aparece en rojo y su cantidad se informa aparte del disponible |

Los datos de prueba se borraron: la base quedó con **0 lotes y 0 movimientos**.
Queda un medicamento `clonazepam2` cargado a mano durante una prueba; sale con
`npx prisma db seed`.

`npm run check` da 0 después de cada tarea.

### Qué sigue

**El merge**, y después la **fase 5**, el módulo clínico. Es la más larga y la más
importante para la defensa: si el tiempo aprieta, se recorta la fase 6 antes que
la 5.

El orden es **5.01** (servicio de pacientes) y **5.03** (carga manual de al menos
15 pares de interacciones en el seed). La 5.03 ya no está bloqueada: los RxCUI del
seed se verificaron en la 2.11.

Ojo con la **5.02**, la importación de ONCHigh: es de tamaño L y arrastra el mapeo
de DrugBank a RxCUI y la redacción de las descripciones de severidad. La 5.03
queda como red por si ese mapeo resuelve peor de lo esperado.

### Antes de arrancar, tener en cuenta

- **Ningún dato clínico se inventa.** Ni interacciones, ni severidades, ni
  descripciones. Lo que no venga de la fuente citada, no entra.
- **El paciente no tiene datos identificatorios.** Solo un seudónimo. Nunca
  nombre, documento ni fecha de nacimiento, en ninguna tabla.
- **Una consulta de interacciones necesita al menos dos medicamentos.**
- **El sistema asiste, no decide.** Ante una interacción se informa; no se
  bloquea nada.
- **Las fechas que son fechas se formatean con `src/lib/fechas.ts`.** Usar
  `toLocaleDateString` a mano vuelve a correr un día lo que se muestra.
- **Los cuatro componentes de `src/components/ui/` son los únicos que hay.**
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **Después de cambiar el esquema, `npm run setup` antes de `npm run check`.**

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
