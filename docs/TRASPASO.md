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
**Rama:** `feat/3.06-pantalla-medicamentos` (**sin mergear**)
**Commit:** de `540ee97` a `52a3d77`, más el que trae este traspaso

### Qué se hizo

**La fase 3 está completa: 3.01 a 3.08.** Con la 3.05 ya en `main`, este bloque
cierra las tres que faltaban, que son las tres la misma pantalla.

| Commit | Tarea | Qué dejó |
|---|---|---|
| `540ee97` | 3.06 | `/medicamentos`: tabla, buscador y botón de alta |
| `70847bc` | 3.07 | Modal de alta con errores por campo |
| `52a3d77` | 3.08 | Estados de carga, vacío y error con "Reintentar" |

Archivos nuevos, todos en `src/app/medicamentos/`:

- **`page.tsx`** — componente de servidor. Solo arma el encabezado.
- **`ListaMedicamentos.tsx`** — componente de cliente. Tabla, buscador, estados.
- **`ModalNuevoMedicamento.tsx`** — el formulario de alta.
- **`unidades.ts`** — nombres legibles de `UnidadMedida`.

**El catálogo funciona de punta a punta**: se listan los medicamentos, se busca
por nombre, se da de alta uno nuevo y aparece en la tabla sin recargar.

### Decisiones tomadas sobre la marcha

**El formulario no revalida nada.** Manda lo que la persona escribió y pinta lo
que el servidor conteste. Las reglas viven en un solo lugar —el esquema de Zod de
la 3.02 y el servicio de la 3.01— y repetirlas en el cliente garantiza que en
algún momento digan cosas distintas. Es lo que hace que el mensaje "el nombre es
el principio activo, sin dosis" llegue igual desde la API hasta el input.

**Los tres estados viven en la pantalla, no en `<Tabla>`.** La tabla no sabe que
existe una petición HTTP y no tiene por qué enterarse. `ListaMedicamentos` decide
si dibuja el indicador de carga, el panel de error o la tabla. Es lo que ya
estaba anotado en `Tabla.tsx` cuando se hizo la 3.05.

**Hay dos mensajes de tabla vacía, no uno.** Sin búsqueda dice "Todavía no hay
medicamentos cargados", que es lo que pide la tarea. Con búsqueda dice "No se
encontraron medicamentos que coincidan con «…»". Son situaciones distintas y el
primer mensaje sería falso en el segundo caso.

**El modal se desmonta al cerrarse.** La primera versión limpiaba el formulario
con un `useEffect`, y ESLint lo rechazó con `react-hooks/set-state-in-effect`.
La regla tiene razón: montarlo solo cuando hace falta es menos código, no
provoca un render extra por apertura, y cada apertura arranca limpia por
construcción. El listado lo renderiza con `{modalAbierto ? … : null}`.

**El buscador espera 250 ms antes de pedir.** Sin eso, escribir "clonazepam"
dispara diez consultas y las respuestas pueden llegar desordenadas, dejando en
pantalla el resultado de un texto viejo.

**El error del campo se borra apenas se lo toca.** Dejarlo mientras la persona
corrige es confuso: ya no describe lo que hay escrito.

**El `rxcui` ausente se muestra como "sin cargar", en gris.** No se deja la celda
vacía: un medicamento sin código no participa del cruce de interacciones, y eso
tiene que verse. Es la decisión 0005 hecha visible.

### Qué quedó sin hacer

- **La rama no está mergeada.** Otra persona le tiene que pasar el ojo.
- **No hay navegación.** A `/medicamentos` se llega escribiendo la URL: la barra
  lateral es la tarea **6.01** y la pantalla de inicio la **6.03**.
- **`/` sigue siendo la página de ejemplo de `create-next-app`**, con los logos
  de Next y Vercel. Es a propósito, por lo mismo.
- **No se puede editar ni borrar un medicamento.** Ninguna tarea del prototipo lo
  pide; el catálogo es de alta y consulta.
- **Toda la fase 4 de la 4.03 en adelante**, incluido el motor FEFO.

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`, entrando a
`http://localhost:3000/medicamentos`. Todo esto se probó en el navegador:

| Qué | Resultado |
|---|---|
| Listado | Los 10 del seed, con sus RxCUI, unidad y stock mínimo |
| Buscador | Escribir "pam" deja Clonazepam y Diazepam |
| Sin resultados | "No se encontraron medicamentos que coincidan con «zzz»." |
| Modal, envío vacío | Error debajo de cada campo, con el borde en rojo |
| Modal, nombre con dosis | "El nombre es el principio activo, sin dosis…" |
| Modal, alta válida | Se cierra, el listado se refresca y el nuevo aparece |
| Alta sin RxCUI | Entra, y en la tabla se ve **"sin cargar"** |
| **Estado de error** | Se detuvo el contenedor de PostgreSQL: aparece el panel rojo con "Reintentar" |
| **Reintentar** | Con la base de vuelta, recupera **conservando el filtro** que estaba puesto |

El estado de error no se simuló con código: se paró la base de verdad con
`docker compose stop` y se la volvió a levantar. Los datos de prueba que se
crearon desde la pantalla se borraron.

`npm run check` da 0.

### Qué sigue

**El merge de la rama**, con revisión de otro.

Después, la fase 4 desde la **4.03**, stock disponible por medicamento, que ya
tiene todo lo que necesita en `src/services/stock.ts`.

El camino sigue por la 4.04 —movimientos en transacción— y llega al **motor FEFO
(4.07)**, que es la tarea con más casos borde del proyecto. **No lleva pruebas
automatizadas**, así que hay que verificar a mano los cinco casos que lista el
roadmap y anotar el resultado en el PR: un solo lote alcanza, hay que repartir
entre dos, hay un lote vencido que se ignora, la existencia no alcanza, y dos
lotes vencen el mismo día.

### Antes de arrancar, tener en cuenta

- **Las pantallas consumen la API, no importan el servicio.** Si una pantalla
  necesita una regla, se agrega al servicio y se expone por la API; no se
  reescribe en el cliente.
- **Los cuatro componentes de `src/components/ui/` son los únicos que hay.** Si
  hace falta uno nuevo, se habla: la regla de la 3.05 es "solo esos cuatro".
- **Los mensajes de error los escribe el servidor.** Si un mensaje se lee mal en
  pantalla, se corrige en el servicio o en el esquema de Zod, no en el modal.
- **ESLint rechaza `setState` dentro de un `useEffect`.** Si aparece, casi
  siempre significa que el estado se puede derivar o que el componente se tiene
  que montar de cero.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **`npm run check` falla si `.next/` quedó de un build viejo.** `rm -rf .next`.
- **Después de cambiar el esquema, `npm run setup` antes de `npm run check`.**

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
