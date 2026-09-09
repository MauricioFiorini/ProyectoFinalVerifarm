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
**Rama:** `feat/5.13-ficha-del-paciente` (**sin mergear**)

### Qué se hizo

**La 5.13: la ficha del paciente**, en `/pacientes/[id]`. Es la pantalla donde
se ve qué está tomando alguien y **cuál de esas drogas el sistema no puede
evaluar**.

| Archivo | Qué |
| --- | --- |
| `src/app/pacientes/[id]/page.tsx` | El "volver". Componente de servidor |
| `src/app/pacientes/[id]/MedicacionDelPaciente.tsx` | La ficha entera |
| `src/components/ui/Chip.tsx` | **Nuevo**: `Chip` se mudó acá |
| `src/services/interacciones.ts` | `Evaluabilidad` y `calcularEvaluabilidad` |
| `src/services/medicacion.ts` | Las filas traen `evaluabilidad`; se corrigió el orden |
| `src/services/consultas.ts` | Usa el `Evaluabilidad` compartido |
| `src/app/api/medicacion/route.ts` | `GET` devuelve `{ paciente, medicacion }` |
| `src/app/pacientes/ListaPacientes.tsx` | Enlace **"Ver ficha"** por fila |
| `src/app/stock/indicadores.tsx` | Importa el `Chip` mudado |

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md`, sección **"Migraciones pendientes de aplicar"**, arriba de
todo. **Juan Pablo y Juan José tienen dos sin correr.**

### La columna "Interacciones" es el punto de la pantalla

Una lista de medicación vigente, a secas, **parece revisada y no lo está**. Si
una de las drogas no figura en la fuente, el paciente puede tener una
interacción que el sistema nunca va a ver, y nada lo diría.

Por eso cada fila dice si esa droga se puede cruzar, y por qué no:

| Marca | Qué significa |
| --- | --- |
| "Se evalúa" (gris, sin chip) | Tiene RxCUI y la fuente lo cubre |
| **"Sin datos en la fuente"** | Tiene RxCUI, pero ONCHigh no lo trae. Le pasa al **clonazepam** |
| **"Sin RxCUI cargado"** | No tiene código, no hay por dónde cruzarlo |

El caso corriente va sin chip a propósito: si todo lleva etiqueta, ninguna se
lee.

### Cuatro decisiones de estructura

**`Evaluabilidad` se mudó a `interacciones.ts`.** Estaba definida en
`consultas.ts`, y la ficha necesitaba el mismo concepto. Vive junto a
`rxcuisConCobertura`, que es de donde sale. Tener el mismo concepto escrito dos
veces es la forma segura de que un día digan cosas distintas.

**La medicación trae la cobertura con cada fila**, resuelta en el servidor. Se
pide **una** consulta para toda la lista, no una por fila: con diez drogas
serían once viajes para dibujar una tabla. Mismo problema y misma salida que
`obtenerDisponiblePorLote` en stock, y que la cuenta de la 5.11.

**`GET /api/medicacion` ahora devuelve `{ paciente, medicacion }`.** El paciente
viene en la misma respuesta, igual que en `/api/lotes`: la ficha necesita el
seudónimo para el encabezado y pedirlo aparte serían dos viajes. Además es lo
que permite contestar **404** cuando el id no existe, en vez de una lista vacía
que se leería como "este paciente no toma nada".

**`Chip` se mudó a `src/components/ui/Chip.tsx`.** Vivía en
`src/app/stock/indicadores.tsx`, o sea dentro de la carpeta de una ruta, y la
ficha tenía que importarlo desde ahí o copiarlo. Es el mismo caso de
`unidades.ts` en la fase 4 y se resolvió igual: lo compartido sube.

> **Ojo con esto:** `src/components/ui/` pasó de **cuatro archivos a cinco**.
> Los otros son `Boton`, `Campo`, `Tabla` y `Modal`. No se agrega un sexto sin
> una razón del mismo tipo: que dos rutas distintas necesiten lo mismo.
> `ChipDeEstado` y `ChipDeVencimiento` **no** se movieron: traducen estados del
> módulo de stock y siguen en `indicadores.tsx`.

Se le agregó un tono `neutro` al `Chip`. Una medicación **finalizada** no es una
alarma ni una buena noticia: sin ese tono había que elegir entre pintarla de
verde, que dice "todo bien", o de amarillo, que avisa de algo que no pasa.

### Un defecto que apareció al armar la pantalla

`listarMedicacionDePaciente` ordenaba por `fechaFin` ascendente. **PostgreSQL
manda los NULL al final en un ASC**, y `fechaFin` es NULL justamente en las
vigentes: la ficha abría mostrando las drogas suspendidas por encima de las que
el paciente realmente está tomando.

Se corrigió con `{ sort: "asc", nulls: "first" }`. **Se vio en el navegador, no
compilando** — el orden se escribió en la 5.04, cuando todavía no había pantalla
que lo mostrara.

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`. Se cargó un paciente con las cinco
situaciones a la vez:

| Qué | Resultado |
| --- | --- |
| Encabezado | "PAC-001 · 4 drogas vigentes · 1 en el historial" |
| Orden | Las vigentes primero, la suspendida al final |
| Escitalopram y Haloperidol | "Se evalúa" |
| Clonazepam y Diazepam | **"Sin datos en la fuente"** |
| Un medicamento sin RxCUI | **"Sin RxCUI cargado"** |
| Diazepam suspendido | Chip rojo, y debajo "Somnolencia diurna marcada · 09/07/2026" |
| La cuenta del listado | Dice **4**, no 5: la suspendida no cuenta |
| "Ver ficha" desde el listado | Navega bien, y es un `<a>` real |
| Un id que no existe | **"Ese paciente no existe"**, no la pantalla de error |
| Los dos botones | `disabled` en el DOM, con su `title` |
| 375 px | La tabla se desplaza dentro de su caja |
| Consola | Solo el 404 que se disparó a propósito |

Los datos de prueba **se borraron**: 0 pacientes, los 10 medicamentos del seed y
las 1150 interacciones.

`npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **Los dos botones de la ficha están deshabilitados**: "Agregar medicamento" es
  la 5.14 y "Evaluar interacciones" la 5.16.
- **En 375 px la columna "Interacciones" queda fuera de la vista** hasta que se
  desplaza la tabla. Es el mismo comportamiento que las tablas de stock y la
  revisión responsive es la **6.05**; conviene mirarlo ahí, porque en esta
  pantalla esa columna es lo importante.
- **No hay listado de consultas.** `GET /api/consultas` devuelve una por id. La
  5.20 va a necesitar una `listarConsultas` en `src/services/consultas.ts`.
- **No hay baja de paciente.**
- **La 5.14 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.13-ficha-del-paciente
```

### Qué sigue

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.14** | M | Modal de alta de medicación: selector con buscador y fecha de inicio |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.04** | M | Manejo de errores global |

La 5.14 habilita el primer botón de la ficha, y la **5.15** (suspender, tamaño
S) cierra la cadena. Después la ficha queda completa y sigue la **5.16**, la
pantalla de consulta.

**Si trabajan dos en paralelo: 5.14 con 6.02, o 5.14 con 6.04.**

**Para la 5.14:** el endpoint ya existe y está probado —`POST /api/medicacion`
con `pacienteId`, `medicamentoId` y `fechaInicio`—, y devuelve 409 si la droga
ya está vigente y 422 si la fecha es futura. El selector de medicamento puede
usar `GET /api/medicamentos?buscar=…`, que ya filtra por nombre.

### Antes de arrancar, tener en cuenta

- **Las pantallas consumen la API, no importan el servicio.**
- **Las pantallas no revalidan reglas del dominio.** Mandan y pintan la
  respuesta.
- **`incluirNoVigentes` es `false` por defecto** en `GET /api/medicacion`. La
  ficha lo pide en `true`; la evaluación de interacciones no lo toca.
- **La `evaluabilidad` viene resuelta del servidor**, tanto en la medicación
  como en el resultado de una consulta. Las pantallas no la calculan.
- **`src/components/ui/` tiene cinco componentes**: Boton, Campo, Tabla, Modal
  y Chip.
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
