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
**Rama:** `feat/5.10-route-handlers-clinicos` (**sin mergear**)

### Qué se hizo

**La 5.10: los route handlers del módulo clínico.** Con esto **el backend del
módulo está completo**: de acá en adelante la fase 5 es toda interfaz.

| Archivo | Qué |
| --- | --- |
| `src/types/clinico.ts` | Los esquemas de Zod. Nuevo |
| `src/app/api/pacientes/route.ts` | `GET` (listar y buscar), `POST` |
| `src/app/api/medicacion/route.ts` | `GET`, `POST`, **`PATCH`** |
| `src/app/api/consultas/route.ts` | `GET` (por id), `POST` |

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md` tiene arriba de todo la sección **"Migraciones pendientes de
aplicar"**, con una casilla por integrante. **Juan Pablo y Juan José tienen dos
sin correr.** Sin aplicarlas, `npm run check` falla con errores de tipo que no
mencionan a Prisma por ningún lado.

### Tres decisiones que conviene conocer

**`/api/medicacion` tiene `PATCH`, y `/api/movimientos` no tiene ninguno.** No
es una inconsistencia. El historial de movimientos es un libro mayor: un asiento
no se corrige, se compensa con otro. La medicación no es eso — una fila es un
tramo, y suspenderla **cierra el tramo que ya estaba abierto** en vez de agregar
un hecho nuevo. Eso es una modificación y le corresponde un `PATCH`. El
historial no se pierde igual: la fila no se borra ni se reutiliza cuando la
droga se reinicia.

**`/api/consultas` no tiene previsualización, a diferencia de
`/api/dispensaciones`.** La dispensación separa calcular el plan de ejecutarlo
porque una escribe en el historial de stock y la otra no. Una consulta no tiene
esa división: **evaluar es la operación**, y que quede registrada es parte del
punto. Una evaluación que no se guarda no sería una consulta, sería una cuenta.

**`medicamentoIds` no lleva `.min(2)` en Zod.** Es la restricción `2..*` del
modelo, o sea una regla del dominio, y la aplica el servicio. No es una
distinción académica: **cambia lo que ve el usuario.** Con Zod la respuesta
sería 400 "los datos enviados no son válidos", que suena a que el programa está
roto. Desde el servicio es **422** con *"una consulta necesita al menos 2
medicamentos"*, que es lo que hay que leer. Comprobado.

### Un defecto que el defecto de `GET /api/medicacion` evita

El parámetro `incluirNoVigentes` **es `false` por defecto**. El valor seguro es
el más chico: la evaluación de interacciones corre sobre la medicación vigente,
y si el defecto trajera el historial, olvidarse el parámetro daría un aviso por
una droga que el paciente ya no toma. La ficha del paciente (5.13), que sí
quiere todo, lo pide explícitamente.

### Cómo verificarlo

Script descartable contra el servidor levantado, **39 casos por HTTP real**,
todos dan lo esperado. No compilando: pidiéndole al servidor.

| Endpoint | Qué se probó |
| --- | --- |
| `/api/pacientes` | alta 201; duplicado 409 con error por campo; **un DNI da 422 y no 400**; sin seudónimo 400; listado; búsqueda |
| `/api/medicacion` | alta 201; misma droga vigente 409; fecha futura 422; fecha ilegible 400; vigentes con **estado calculado** y medicamento resuelto; motivo corto 422; suspensión 200; doble suspensión 422; el historial trae el motivo; sin `pacienteId` 400 |
| `/api/consultas` | **un solo medicamento da 422 y no 400**; el mismo dos veces 422; lista mal formada 400; medicamento inexistente 404; paciente inexistente 404; consulta válida 201 con su observación y **el clonazepam marcado `SIN_COBERTURA`**; relectura 200; inexistente 404; sin id 400 |
| Métodos | `PUT` y `DELETE` sobre consultas y pacientes dan **405** |

También se comprobó que el alta de paciente **no devuelve ningún dato
filiatorio**: la respuesta trae `id`, `seudonimo`, `activo` y las marcas de
tiempo, nada más.

El log del servidor quedó **sin errores**, y los datos de prueba se borraron: la
base quedó con 0 pacientes, 0 consultas y las 1150 interacciones.

`npm run check` da 0.

### Qué quedó sin hacer

- **La rama no está mergeada.**
- **No hay listado de consultas.** `GET /api/consultas` devuelve una por id. La
  pantalla que necesita el listado es la 5.20, y el servicio no expone esa
  función: agregarla al route handler significaría consultar la base desde ahí,
  que es lo que la arquitectura no permite. **Le va a hacer falta una
  `listarConsultas` en `src/services/consultas.ts`.**
- **No hay baja de paciente.** `Paciente` tiene `activo` pero ningún endpoint lo
  apaga. Ninguna tarea lo pide todavía.
- **La 5.11 en adelante**, y toda la fase 6 salvo la 6.01.
- **D8 sigue abierta.**

### Antes de mergear

`docs/CONVENCIONES.md` sección 14:

```bash
git fetch origin
git diff --name-only origin/main...origin/feat/5.10-route-handlers-clinicos
```

Tiene que listar los cuatro archivos nuevos.

### Qué sigue

**De acá en adelante la fase 5 es interfaz.** Y hay dos caminos que no se pisan:

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **5.11** | M | Pantalla `/pacientes`: tabla de seudónimos con cantidad de medicamentos vigentes |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.04** | M | Manejo de errores global |

La 5.11 abre la cadena 5.12 → 5.13 → 5.14 → 5.15, que es toda la ficha del
paciente.

**La 6.02 se volvió más relevante:** `POST /api/consultas` ya acepta `usuarioId`
y hoy cae en el médico del seed. Con el selector, ese campo pasa a tener un valor
real sin tocar ni el servicio ni el endpoint.

**Ojo con la 5.11:** pide "cantidad de medicamentos vigentes" por paciente.
`GET /api/pacientes` no la trae, y pedir la medicación de cada paciente por
separado sería una consulta por fila. Conviene resolverlo en el servicio, como se
hizo con `obtenerDisponiblePorLote` en la 4.05 para no caer en el mismo problema.

### Antes de arrancar, tener en cuenta

- **Las pantallas consumen la API, no importan el servicio.** Ver
  `docs/ARQUITECTURA.md` sección 3.
- **`incluirNoVigentes` es `false` por defecto.** Para evaluar interacciones no
  se toca; para la ficha del paciente se pide en `true`.
- **La `evaluabilidad` ya viene resuelta** en la respuesta de la consulta:
  `EVALUADO`, `SIN_RXCUI` o `SIN_COBERTURA`. Las pantallas no la calculan, y la
  5.13, la 5.16 y la 5.18 tienen que mostrarla.
- **El texto de la observación ya está guardado.** No se recompone al mostrar.
- **Las tres pantallas existentes cargan datos con `setTimeout(…, 0)` dentro de
  un `useEffect`.** Es un parche para que el linter no rechace la llamada, está
  documentado en `src/app/stock/TablaDeStock.tsx` y las pantallas nuevas
  conviene que sigan el mismo patrón: tener dos formas distintas de cargar datos
  es peor que tener una imperfecta.
- **Los cuatro componentes de `src/components/ui/` son los únicos que hay:**
  `Boton`, `Campo`, `Tabla`, `Modal`.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.**
- **Todas las interacciones tienen severidad `ALTA`.** La 5.18 va a mostrar un
  solo color y está asumido.
- **El catálogo actual cruza con una sola interacción.** Se arregla en la 6.06
  (decisión `0012`). No es un error del código.
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
