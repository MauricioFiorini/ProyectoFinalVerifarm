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
**Rama:** `feat/2.10-modelo-segun-decisiones` (**sin mergear**)
**Commit:** de `c153296` a `761d922`, más el que trae este traspaso

### Qué se hizo

**Siete tareas: 2.10, 2.11, 3.02, 3.03, 3.04, 4.01 y 4.02.** Con eso la fase 2
queda cerrada, la fase 3 tiene toda su capa de servicio y API, y la fase 4
arrancó. Un commit por tarea.

| Commit | Tarea | Qué dejó |
|---|---|---|
| `c153296` | 2.10 | Migración: `rxcui` opcional, `Lote.fechaIngreso` |
| `1a850cc` | 2.11 | Seed corregido: nombres sin dosis, RxCUI verificados, ids fijos |
| `768b2f5` | 3.02 | `src/types/medicamento.ts` — validación con Zod |
| `7b50363` | 3.03 | `src/app/api/medicamentos/route.ts` — GET y POST |
| `05b306a` | 3.04 | `src/services/errores.ts` y `src/lib/respuestaHttp.ts` |
| `c20fa49` | 4.01 | `src/services/lotes.ts` |
| `761d922` | 4.02 | `src/services/stock.ts` |

**Dependencia nueva: Zod 4.5.4**, fijada exacta. Se agregó siguiendo el
procedimiento de la decisión 0003 —`--package-lock-only`, después `npm ci` como
control, después `npm run setup`— y el lock quedó instalable.

### El hallazgo grave: siete de los diez RxCUI estaban mal

La verificación de la 2.11 contra la API de RxNorm (RxNav) el 2026-09-07 encontró
esto:

| Seed decía | Código | RxNorm dice que es |
|---|---|---|
| Amoxicilina | `725` | **anfetamina** |
| Clonazepam | `32968` | **clopidogrel** |
| Sertralina | `36567` | **simvastatina** |
| Ibuprofeno | `200803` | no resuelve |
| Haloperidol | `5174` | no resuelve |
| Paracetamol | `198440` | un producto (TTY=SCD), no un ingrediente |

**Tres apuntaban a una droga completamente distinta.** Solo cuatro estaban bien
(diazepam, fluoxetina, risperidona, escitalopram).

Esto no es una anécdota: es el modo de falla que describe la decisión 0005. Un
código equivocado no rompe nada, no da error, y el motor de interacciones habría
cruzado clonazepam contra las interacciones del clopidogrel sin que nadie se
entere. **Es el argumento concreto de por qué el `rxcui` es opcional en vez de
obligatorio**, y conviene tenerlo a mano para la defensa.

Los diez códigos nuevos son todos de nivel ingrediente (TTY=IN) y están
verificados uno por uno. El seed los lleva junto al nombre que RxNorm les da, en
un campo `nombreRxNorm`, para poder reverificarlos sin adivinar.

### Decisiones tomadas sobre la marcha

**Dónde vive cada cosa nueva**, que no estaba definido y conviene respetarlo:

- `src/types/medicamento.ts` — los esquemas de Zod. Definen la forma de la
  entrada y de ahí sale el tipo con `z.infer`.
- `src/services/errores.ts` — `ErrorDeNegocio`, el contrato de error de la capa
  de servicio. **No tiene ni un número de estado HTTP**: los servicios siguen sin
  saber que existe HTTP.
- `src/lib/respuestaHttp.ts` — la traducción a códigos. Es el único lugar del
  proyecto donde un error se convierte en un número.
- `src/services/stock.ts` — los cálculos de existencias, separado de `lotes.ts`,
  que es el alta y la consulta de lotes.
- `src/lib/usuariosSemilla.ts` — los ids fijos del seed y la constante
  `USUARIO_PROVISORIO_ID`. El seed **importa de ahí**, así que hay una sola
  fuente.

**El error de negocio lleva un código, no un mensaje que haya que interpretar.**
La 3.03 dejó el alta con nombre repetido devolviendo **500**, porque el servicio
lanzaba `new Error("...ya existe")` y desde el handler no había forma de
distinguir eso de una caída real de la base. La alternativa —mirar el texto del
mensaje— se rompe la primera vez que alguien lo reescribe. Con
`ErrorDeNegocio("DUPLICADO", ...)` el duplicado ahora responde **409**.

**El error trae opcionalmente el campo al que corresponde.** Es lo que permite
que la pantalla de la 3.07 lo muestre al lado del input y no en un cartel suelto.

**La validación del nombre sin dosis es una ayuda, no una prueba.** Rechaza el
patrón común —un número seguido de una unidad— y no puede garantizar que no entre
una dosis escrita de otra forma. Está anotado en el propio archivo para que nadie
lo confunda con una garantía.

**El `rxcui` vacío se trata como ausente.** Un formulario manda `""` cuando el
campo quedó en blanco, y eso significa "no lo cargaron", no "el código es vacío".
Zod lo transforma a `null`.

**Los tres usuarios del seed llevan `id` fijo, no solo el farmacéutico.** La
decisión 0009 pedía el del farmacéutico; se hicieron los tres porque el problema
es el mismo y la fase 5 va a necesitar el del médico para las consultas.

### Qué quedó sin hacer

- **La rama no está mergeada.** Otra persona le tiene que pasar el ojo antes.
- **Fase 3, interfaz: 3.05, 3.06, 3.07 y 3.08.** Toda la parte visual. La 3.05
  —los cuatro componentes base de `src/components/ui/`— no depende de nada de
  esto y se puede tomar en paralelo.
- **Fase 4, de la 4.03 en adelante**, incluido el motor FEFO (4.07), que es la
  tarea con más casos borde del proyecto.
- **`crearLote` deja el lote en cero.** Es correcto: la cantidad entra como
  movimiento de tipo `INGRESO`, y eso es la tarea 4.04. La pantalla de alta
  (4.13) va a tener que hacer las dos cosas en una transacción.
- **La constante `USUARIO_PROVISORIO_ID` todavía no la usa ningún servicio.**
  La va a usar la 4.04, que es la que escribe movimientos.
- **D8 sigue abierta.**

### Cómo verificarlo

Todo se probó corriendo, contra la base local.

**2.10 — la migración.** Se generó `20260907134105_rxcui_opcional_y_fecha_ingreso`
y aplicó sin errores; `prisma migrate status` responde `Database schema is up to
date!`. Se comprobó además, con transacciones que se revirtieron, que:

- **dos `rxcui` en `NULL` conviven** (`INSERT 0 2`), que es de lo que depende que
  el campo pueda ser opcional;
- **un `rxcui` repetido se sigue rechazando**
  (`duplicate key value violates unique constraint "Medicamento_rxcui_key"`).

**2.11 — el seed.** Corre y carga 3 usuarios y 10 medicamentos con los nombres
sin dosis. Se ejecutó **dos veces seguidas** y los tres ids de usuario quedaron
idénticos, que es el bug que la decisión 0009 venía a cerrar.

**3.02 — la validación.** Nueve casos, todos con el resultado esperado: acepta
con y sin `rxcui`, convierte `""` a `null`, y rechaza nombre con dosis, nombre
vacío, `rxcui` no numérico, unidad inválida, `stockMinimo` negativo y
`stockMinimo` decimal.

**3.03 y 3.04 — el endpoint**, contra el servidor levantado:

| Pedido | Respuesta |
|---|---|
| `GET /api/medicamentos` | 200, los 10 |
| `GET /api/medicamentos?buscar=ser` | 200, solo Sertralina |
| `POST` válido **sin `rxcui`** | **201**, con `"rxcui": null` |
| `POST` con nombre repetido | **409** y el campo `nombre` |
| `POST` con `rxcui` repetido | **409** y el campo `rxcui` |
| `POST` con dosis en el nombre | **400** y el campo `nombre` |
| `POST` con JSON roto | 400 |

**4.01 y 4.02.** La función pura `calcularDisponible` devuelve 0 sin movimientos,
100 con un ingreso de 100, 70 tras un egreso de 30, y 120 tras otro ingreso de
50. Contra la base: las cuatro reglas de `crearLote` rechazan lo que tienen que
rechazar —fecha de ingreso futura, vencimiento anterior al ingreso, medicamento
inexistente y número vacío—, el alta válida entra, el número repetido para el
mismo medicamento da `DUPLICADO`, y el disponible de un lote pasa de 0 a **75**
tras registrar 120 de ingreso y 45 de egreso. Todos los datos de prueba se
borraron: la base quedó con 0 lotes.

**`npm run check` da 0** después de cada tarea.

### Qué sigue

**El merge de la rama**, con revisión de otro.

Después, dos frentes que no se pisan:

- **Interfaz de la fase 3:** la **3.05** primero —los cuatro componentes base,
  `Boton`, `Campo`, `Tabla` y `Modal`, y solo esos cuatro—, después la 3.06, la
  3.07 y la 3.08.
- **Lógica de la fase 4:** la **4.03**, stock disponible por medicamento, que ya
  tiene todo lo que necesita en `src/services/stock.ts`.

El **motor FEFO (4.07)** es la tarea con más casos borde del proyecto y no lleva
pruebas automatizadas: los casos a verificar a mano están listados en el roadmap
y hay que anotar el resultado en el PR.

### Antes de arrancar, tener en cuenta

- **Hay una migración nueva.** Después de hacer `git pull` hay que correr
  `npx prisma migrate dev`, o la base local queda vieja.
- **`prisma migrate dev` no dejó el cliente regenerado.** Pasó en esta máquina:
  después de cambiar el esquema, `npm run check` falló con
  `Type 'string | null' is not assignable to type 'string'` porque los tipos del
  cliente seguían siendo los viejos. **Se arregla con `npm run setup`.** Si
  cambiás el esquema, corré `npm run setup` antes de `npm run check`.
- **Hay una dependencia nueva, Zod**, así que después del `git pull` va `npm ci`.
- **Los errores de negocio van con `ErrorDeNegocio`, no con `new Error`.** Si un
  servicio nuevo lanza un `Error` pelado, el handler lo va a responder como 500.
- **Los route handlers no escriben números de estado en los caminos de error.**
  Usan `respuestaDeError` y `respuestaDeValidacion` de `src/lib/respuestaHttp.ts`.
- **Ningún `rxcui` se completa de memoria.** Los del seed salieron de consultar
  RxNorm; siete de los diez anteriores estaban mal, tres apuntando a otra droga.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **`npm run check` falla si `.next/` quedó de un build viejo.** Se arregla con
  `rm -rf .next`.

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
