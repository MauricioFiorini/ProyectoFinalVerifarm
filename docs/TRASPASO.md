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
**Rama:** `feat/5.11-pantalla-de-pacientes` (**sin mergear**)

### Qué se hizo

**La 5.11: la pantalla `/pacientes`.** Es la primera pantalla del módulo
clínico, y con ella **la sección Pacientes de la barra lateral deja de estar
pendiente**.

| Archivo | Qué |
| --- | --- |
| `src/app/pacientes/page.tsx` | El encabezado. Componente de servidor |
| `src/app/pacientes/ListaPacientes.tsx` | La tabla, el buscador y los estados |
| `src/services/pacientes.ts` | **Modificado**: los listados traen la cuenta |
| `src/components/layout/BarraLateral.tsx` | Se le sacó `pendiente: true` |

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md`, sección **"Migraciones pendientes de aplicar"**, arriba de
todo. **Juan Pablo y Juan José tienen dos sin correr.**

### La cuenta de medicación viene con el paciente, y eso es el punto

La tarea pide mostrar cuántos medicamentos vigentes tiene cada paciente. La
forma directa —pedir la medicación de cada uno— sería **una consulta por fila**:
con veinte pacientes, veintiún viajes a la base para dibujar una tabla.

Se resolvió con el `_count` filtrado de Prisma, que lo trae en la misma
consulta. Es el mismo problema que resolvió `obtenerDisponiblePorLote` en el
módulo de stock, y la misma salida.

`listarPacientes` y `buscarPacientesPorSeudonimo` ahora devuelven
`PacienteConMedicacion`, que es el paciente más `medicacionVigente: number`.

### Detalles de la pantalla

**El cero va en gris.** Un paciente sin medicación cargada no tiene nada que
evaluar, y conviene que se note de un vistazo cuáles son.

**El estado vacío distingue dos cosas.** "Todavía no hay pacientes cargados" no
es lo mismo que "No se encontraron pacientes que coincidan con «PAC-001ZZZ»", y
la pantalla guarda el texto con el que trajo lo que está mostrando para poder
decir cuál de las dos.

**El botón "Nuevo paciente" está deshabilitado**, con un `title` que dice
"Todavía no implementado (tarea 5.12)". El modal es esa tarea. Va deshabilitado
en vez de no estar, por lo mismo que las secciones pendientes de la barra
lateral: la pantalla ya muestra por dónde se da de alta, y un clic no se queda
sin respuesta. **Cuando entre la 5.12 se le saca el `disabled` y se le pone el
`onClick`.**

**No hay columna de nombre ni de documento, y no es que falten:** esos campos no
existen en la base. La leyenda del encabezado lo dice en pantalla, para que
quien vea el sistema por primera vez no lo lea como un dato sin cargar.

### Cómo verificarlo

Con `docker compose up -d` y `npm run dev`, en `/pacientes`:

| Qué | Resultado |
| --- | --- |
| Tres pacientes con 3, 1 y 0 drogas | La cuenta sale bien, y el 0 en gris |
| Buscar `PAC-001` | Filtra a uno |
| Buscar `PAC-001ZZZ` | "No se encontraron pacientes que coincidan con «…»" |
| Sin pacientes en la base | "Todavía no hay pacientes cargados" |
| Botón "Nuevo paciente" | `disabled` en el DOM, con su `title` |
| Barra lateral | **Pacientes** resaltado y ya no dice PENDIENTE |
| 375 px | La barra pasa arriba, la tabla entra sin romper |
| Consola | Sin errores |

Los pacientes de prueba se crearon por la API y **se borraron al terminar**: la
base quedó con 0 pacientes. Para rehacerlos, tres `POST /api/pacientes` y unos
`POST /api/medicacion`.

`npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **El alta de paciente**, que es la 5.12.
- **La fila no lleva a ningún lado.** La ficha del paciente es la 5.13, y
  recién ahí la tabla necesita un botón "Ver ficha" por fila.
- **No hay listado de consultas.** `GET /api/consultas` devuelve una por id. La
  5.20 va a necesitar una `listarConsultas` en `src/services/consultas.ts`.
- **La 5.12 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.11-pantalla-de-pacientes
```

### Qué sigue

**La 5.12: el modal de alta de paciente.** Es de tamaño S y desbloquea el botón
que quedó deshabilitado. Después viene la cadena de la ficha: 5.13 → 5.14 →
5.15.

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.12** | S | Modal de alta: solo el identificador, con nota sobre la seudonimización |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.04** | M | Manejo de errores global |

**Si trabajan dos en paralelo: 5.12 con 6.02, o 5.12 con 6.04.**

**Para la 5.12**, el modelo a copiar es `ModalNuevoMedicamento.tsx`: manda lo que
la persona escribió y pinta lo que el servidor conteste, sin revalidar las reglas
en el cliente. El servidor ya devuelve el error por campo —409 con
`campos.seudonimo` para el duplicado, 422 para un DNI—, comprobado en la 5.10.

### Antes de arrancar, tener en cuenta

- **Las pantallas consumen la API, no importan el servicio.**
- **Las pantallas no revalidan reglas del dominio.** Mandan y pintan la
  respuesta. El servidor ya manda el mensaje escrito para que lo lea una
  persona, y con el campo al que corresponde.
- **`incluirNoVigentes` es `false` por defecto** en `GET /api/medicacion`. Para
  evaluar interacciones no se toca; para la ficha (5.13) se pide en `true`.
- **La `evaluabilidad` ya viene resuelta** en la respuesta de la consulta:
  `EVALUADO`, `SIN_RXCUI` o `SIN_COBERTURA`. La 5.13, la 5.16 y la 5.18 tienen
  que mostrarla.
- **Las pantallas cargan datos con `setTimeout(…, 0)` dentro de un
  `useEffect`.** Es un parche para el linter, está documentado en
  `src/app/stock/TablaDeStock.tsx`, y conviene que las nuevas sigan el mismo
  patrón: dos formas distintas de cargar datos es peor que una imperfecta.
- **Los cuatro componentes de `src/components/ui/` son los únicos que hay.**
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.**
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
