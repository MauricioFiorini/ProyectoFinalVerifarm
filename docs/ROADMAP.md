# VERIFARM — Roadmap del PROTOTIPO

**Este archivo contiene únicamente el alcance del prototipo.** Todo lo que quedó
fuera está en `docs/ROADMAP_PRODUCTO.md` y **no se implementa en esta etapa**.

Si sos un asistente de IA: trabajá solo con este archivo. No implementes nada de
`ROADMAP_PRODUCTO.md` aunque parezca una mejora obvia o quede a mano.

Ubicación en el repo: `docs/ROADMAP.md`

---

## Cómo leer este archivo

| Símbolo | Estado | Significado |
|---|---|---|
| `[ ]` | PENDIENTE | Todavía no se empezó. |
| `[~]` | EN CURSO | Alguien la está haciendo ahora. Figura en la tabla de abajo. |
| `[!]` | EN PAUSA | Alguien la empezó y no está trabajando ahora. **La puede continuar cualquiera**, avisando al equipo. Figura en la tabla de abajo. |
| `[x]` | HECHA | Terminada y mergeada a `main`. |
| `[?]` | A DECIDIR | Bloqueada: hace falta una decisión de equipo. |

**Tamaño:** S = menos de una hora · M = media jornada · L = una jornada o más.

**Identificadores:** cada tarea tiene un número tipo `3.04`. Las ramas y los
commits lo llevan (`feat/3.04-...`, `feat(3.04): ...`).

**Regla:** no se empieza una tarea cuyas dependencias no estén en `[x]`.

### En curso ahora

| Tarea | Integrante | Rama | Estado | Dónde quedó | Última actualización |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

### Reserva de tareas

**Ninguna tarea tiene dueño fijo.** Lo único que reserva una tarea es la tabla
"En curso ahora", y solo mientras alguien la está corriendo. Cualquiera puede
tomar una tarea libre cuyas dependencias estén en `[x]`, y cualquiera puede
continuar una que quedó en pausa.

La tabla de arriba es el mecanismo para que dos personas no agarren lo mismo. Se
mantiene con commits chicos, directo a `main`, separados del trabajo en sí.

**Al empezar una tarea:**

1. Anotarla en "En curso ahora": tarea, nombre, rama, estado `activa`, "Dónde
   quedó" en `—` y la fecha de hoy.
2. Marcarla como `[~]` en su fase.
3. Commitear **eso solo**, directo a `main`: `chore: tomar la tarea X.YY`.
4. **Pushear antes de empezar a trabajar.** Una reserva sin pushear no reserva
   nada.

**Al dejar de trabajar sin terminar:**

1. **Pushear la rama, aunque esté a medio camino y no compile.** Es lo que
   permite que otro la continúe: trabajo que vive solo en una máquina no lo puede
   retomar nadie.
2. Llenar "Dónde quedó" en la tabla: qué está hecho y cuál es el paso siguiente.
   Si no entra en una línea, se escribe en `docs/TRASPASO.md` y en la tabla se
   pone `ver traspaso`.
3. Pasar la tarea a `[!]`, poner el estado en `en pausa` y actualizar la fecha.
4. Commitear: `chore: pausar la tarea X.YY`.
5. Si además se suelta la tarea, vuelve a `[ ]` y se saca de la tabla. La rama
   queda pusheada igual.

**Al retomar una tarea que dejó otro:**

1. `git pull` y `checkout` de la rama que figura en la tabla. No se abre una rama
   nueva: se sigue sobre la misma.
2. Anotarse como integrante en "En curso ahora", poner el estado en `activa`,
   marcar la tarea `[~]` y actualizar la fecha. Ese commit va a `main` antes de
   seguir, igual que cualquier reserva.
3. Continuar sobre esa misma rama. Para traer lo nuevo de `main`, **merge**.
4. **Nunca `rebase`, `commit --amend` ni `push --force` sobre esa rama.** Los
   commits son de otra persona: reescribirlos le rompe el repositorio local.

**Al terminar:** la tarea pasa a `[x]` y se saca de la tabla. Eso va junto con el
resto del cierre de tarea, no en un commit aparte — ver "Definición de hecho" en
`docs/CONVENCIONES.md`.

**Antes de agarrar cualquier tarea:** `git pull` y mirar la tabla. Son tres
casos:

- **`activa`** — alguien la está corriendo ahora. No se toca.
- **`en pausa`** — se puede continuar. Avisar al equipo antes de arrancar; si
  nadie contesta en el día, se sigue igual. La tarea no es de nadie.
- **Libre pero con dependencias sin cerrar** — no se empieza. Primero tienen que
  estar en `[x]`.

### Decisiones abiertas

| # | Decisión | Bloquea |
|---|---|---|
| D2 | ¿Se adopta ONCHigh como fuente de interacciones? Está disponible en un repositorio público, pero sin RxCUI ni severidad: requiere mapeo y redacción propia. | 5.02 |

Mientras D2 siga abierta, la tarea 5.03 (carga manual de pares) permite avanzar
con todo el módulo clínico.

---

# FASE 0 — Preparación del entorno

Nadie escribe código hasta que las tres máquinas pasen la 0.09.

**Esta fase la hacen las personas, no la IA:** instalar programas, crear el
repositorio remoto y verificar la configuración de commits son cosas que un
asistente no puede hacer. La primera tarea de IA es la 1.01.

### Verificación por integrante de las tareas 0.01 a 0.06

Las tareas 0.01 a 0.06 se hacen **en cada máquina**. La columna Estado de la
tabla de abajo no puede expresar "hecha en una de tres", así que el detalle vive
acá: cada uno marca su casilla cuando la termina en la suya.

| Integrante | 0.01 | 0.02 | 0.03 | 0.04 | 0.05 | 0.06 |
|---|---|---|---|---|---|---|
| Juan Pablo | `[x]` | `[x]` | `[x]` | `[x]` | `[x]` | `[x]` |
| Mauricio | `[x]` | `[x]` | `[x]` | `[x]` | `[x]` | `[x]` |
| Juan José | `[x]` | `[x]` | `[x]` | `[x]` | `[x]` | `[x]` |

**Una tarea de esta fase pasa a `[x]` en la tabla de tareas solo cuando la
columna está completa para los tres.** Mientras haya una casilla vacía, queda en
`[ ]`, aunque en tu máquina esté resuelta.

La 0.05 es un caso particular: crear el repositorio se hace una sola vez, pero la
casilla de cada uno se marca cuando **esa persona** confirma que tiene acceso y
clonó.

| # | Tarea | Estado | Tamaño | Depende |
|---|---|---|---|---|
| 0.01 | Instalar **Node.js LTS**. Verificar con `node -v` y `npm -v`. | `[x]` | S | — |
| 0.02 | Instalar **Git** y configurar identidad local: `user.name` y `user.email` con el email de la cuenta de GitHub. | `[x]` | S | — |
| 0.03 | Instalar **Docker Desktop**. Verificar con `docker run hello-world`. | `[x]` | M | — |
| 0.04 | Instalar **VS Code** con extensiones: ESLint, Prettier, Prisma, Tailwind CSS IntelliSense. | `[x]` | S | — |
| 0.05 | Crear el repositorio en GitHub, dar acceso a los tres, `main` como rama por defecto. Clonarlo en cada máquina. | `[x]` | S | — |
| 0.06 | Configurar Claude Code / Antigravity y **desactivar el coautor automático de IA**. Hacer un commit de prueba y verificar con `git log --format=full` que **no aparece ningún trailer de coautoría de IA**. **Se verifica por máquina y por herramienta:** cada integrante la hace en la suya, y quien use Antigravity tiene que verificarla además con el ajuste propio de esa herramienta, que es aparte de `.claude/settings.json`. Hacerlo con el repositorio vacío: corregirlo después es mucho más caro. | `[x]` | M | 0.05 |
| 0.07 | Crear `.gitignore` (Node, Next.js, `.env`, `node_modules`, `.next`). | `[x]` | S | 0.05 |
| 0.08 | Subir la documentación al repositorio: `CLAUDE.md` en la raíz y `CONTEXTO.md`, `ROADMAP.md`, `ROADMAP_PRODUCTO.md`, `CONVENCIONES.md`, `REGLAS_IA.md`, `TRASPASO.md` y el modelo de dominio `MD_VERIFARM.drawio` dentro de `docs/`, más la carpeta vacía `docs/decisiones/`. **Ya están escritos**: solo hay que ubicarlos y commitearlos. | `[x]` | S | 0.05 |
| 0.09 | Prueba de humo: los tres clonan, ven la documentación en su lugar y confirman que el asistente lee `CLAUDE.md` al abrir la carpeta. | `[x]` | M | 0.01–0.08 |

### Verificación por integrante de la 0.09

La 0.09 se corre **en cada máquina**, igual que las tareas 0.01 a 0.06, así que
el detalle individual vive acá: cada uno marca su casilla cuando la prueba de
humo le pasa en la suya. Es el mismo tratamiento que recibe la 1.11, que es la
otra prueba de humo del roadmap.

| Integrante | 0.09 |
|---|---|
| Juan Pablo | `[x]` |
| Mauricio | `[x]` |
| Juan José | `[x]` |

**La 0.09 pasa a `[x]` en la tabla de tareas solo cuando las tres filas están
completas.** Mientras haya una casilla vacía, queda en `[ ]`, aunque en tu
máquina pase.

---

# FASE 1 — Esqueleto técnico

Lo hace **una sola persona a la vez, la que esté disponible**; el resto parte de
ahí. No hace falta que sea siempre la misma: todo lo que produce esta fase son
archivos versionados, así que quien la continúe arranca de lo que ya está en la
rama.

| # | Tarea | Estado | Tamaño | Depende |
|---|---|---|---|---|
| 1.01 | `npx create-next-app` con TypeScript, App Router, Tailwind, ESLint, carpeta `src/`. | `[x]` | S | 0.09 |
| 1.02 | TypeScript estricto en `tsconfig.json` y regla de ESLint que prohíbe `any`. | `[x]` | S | 1.01 |
| 1.03 | Prettier y script `npm run check` (`tsc --noEmit` + eslint + prettier). | `[x]` | S | 1.02 |
| 1.04 | `docker-compose.yml` con PostgreSQL 16 y volumen persistente. Verificar que levanta. | `[x]` | M | 1.01 |
| 1.05 | `.env.example` con `DATABASE_URL` vacía y su explicación. | `[x]` | S | 1.04 |
| 1.06 | Instalar **Prisma 7.10.0 exacto** (`prisma` y `@prisma/client`). **No usar `latest`.** | `[x]` | S | 1.04 |
| 1.07 | `prisma.config.ts` con la URL de conexión y `dotenv/config`. Validar con `npx prisma validate`. | `[x]` | M | 1.06 |
| 1.08 | `src/lib/db.ts`: cliente Prisma singleton. | `[x]` | S | 1.07 |
| 1.09 | Estructura de carpetas definitiva: `src/app`, `src/components`, `src/lib`, `src/services`, `src/types`. | `[x]` | S | 1.01 |
| 1.10 | Paleta y tipografía en `globals.css`, declaradas con `@theme` (Tailwind 4 ya no usa `tailwind.config`): colores de marca y de estado (ok / advertencia / crítico). | `[x]` | M | 1.01 |
| 1.12 | **Script `npm run setup`** (`scripts/setup.mjs`), que deja el entorno listo despues de `npm ci`: verifica que exista `.env` y que `DATABASE_URL` **tenga valor** —no alcanza con que el archivo exista, porque `.env.example` la trae vacia y la URL que sirve esta comentada—, avisa si el puerto no es el 5433, y recien entonces corre `prisma generate`. **No crea el `.env` ni levanta Docker**: imprime cual es el paso siguiente. Tiene que poder correrse dos veces sin romperse ni ensuciar nada. Reemplaza al `postinstall`, que se probo y se descarto: ver `docs/decisiones/0001-generacion-del-cliente-prisma.md`. | `[x]` | M | 1.10 |
| 1.13 | **El arranque usa `npm ci`, no `npm install`.** `npm install` resuelve los rangos de `package.json` y **reescribe `package-lock.json`** cuando una dependencia transitiva con rango flotante tiene una versión nueva publicada; ya pasó una vez, en el commit `35559a5`. `npm ci` instala exactamente lo que dice el lock, no lo reescribe nunca, y **falla** si el lock y `package.json` se desincronizan en vez de reconciliarlos en silencio. `npm install` queda reservado para agregar o cambiar una dependencia **a propósito**, que es cuando el lock tiene que cambiar. **Incluye regenerar `package-lock.json`:** el commit `35559a5` lo dejó inconsistente y `npm ci` se niega a instalarlo, así que sin esa reparación el comando nuevo no arranca. El lock roto pasó desapercibido porque `npm install` lo reconcilia en silencio, que es justo lo que esta tarea elimina. `scripts/setup.mjs` no se toca. Ver `docs/decisiones/0002-el-lock-manda-y-el-comando-es-npm-ci.md`. | `[x]` | S | 1.12 |
| 1.11 | **Prueba de humo del entorno.** Los tres, cada uno en su máquina: clonar o hacer `git pull` de la fase 1 completa, y correr `npm ci`, `npm run setup`, `docker compose up -d`, la prueba de conexión a la base y `npm run dev`, confirmando que la aplicación levanta sin errores. La prueba de conexión es `echo "SELECT 1;" \| npx prisma db execute --stdin`: **lo único que verifica es que Prisma llega a PostgreSQL en Docker con la `DATABASE_URL` configurada**, y no escribe nada en la base. Si la versión instalada pide el esquema explícito, agregar `--schema prisma/schema.prisma`. **No se usa `npx prisma migrate dev` acá, a propósito:** el esquema recién se escribe en la fase 2, así que acá generaría una migración vacía que queda como ruido permanente en el historial, delante de la inicial de la 2.07. Además `npm run check` tiene que pasar limpio en las tres. **Antes de correrla, hacer los "Pasos previos de la 1.11" de acá abajo: sin esos tres pasos falla, y ninguno de los errores apunta a su causa.** | `[x]` | M | 1.10, 1.12, 1.13 |

**La 1.12 y la 1.13 van antes que la 1.11 a propósito, aunque los números sean
mayores.** Los identificadores no se reciclan ni se renumeran: la 1.11 ya está
referenciada en la documentación y en el historial. El orden de ejecución lo
manda la columna "Depende", no el número, y la 1.11 depende de las dos.

Las dos fijan el procedimiento de arranque: la 1.12 agrega `npm run setup` y la
1.13 cambia `npm install` por `npm ci`. La prueba de humo se corre **recién
cuando el procedimiento está cerrado**: si se corriera antes, cada uno probaría
a mano algo distinto de lo que va a quedar documentado, que es justo lo que la
prueba tendría que estar verificando. Ya pasó una vez —ver la tabla de
verificación de más abajo— y hubo que descartar lo verificado.

### Pasos previos de la 1.11, en un clon limpio

En una máquina donde el proyecto nunca corrió, antes de la prueba de humo:

```bash
cp .env.example .env    # y completar DATABASE_URL (viene vacia y comentada)
npm ci
npm run setup           # verifica el .env y genera el cliente Prisma
```

**El `.env` hay que crearlo y completarlo a mano.** El script no lo genera a
propósito: `.env.example` trae `DATABASE_URL` vacía y la URL buena comentada,
así que un `cp` sin editar dejaría un archivo roto, y configurar la conexión es
algo que cada uno tiene que entender una vez. Lo que sí hace el script es
verificar que la variable tenga valor y cortar con un mensaje que dice qué
hacer.

**El puerto es el 5433, no el 5432.** Si tenés PostgreSQL instalado en Windows y
usás el 5432, no falla por puerto ocupado: conecta contra el PostgreSQL de tu
máquina y responde `Authentication failed against database server`. El script
avisa si la URL apunta a otro puerto.

Sin estos pasos la 1.11 falla, y **ninguno de los errores apunta a su causa
real**: están listados uno por uno, con su síntoma, en la sección 14 de
`docs/CONVENCIONES.md`.

Además, **Prisma 7 exige Node 20.19+, 22.12+ o 24.0+**. Con una versión anterior
la instalación corta en el `preinstall` de Prisma, y ese error sí dice
exactamente qué pasa.

### Verificación por integrante de la 1.11

La 1.11 se corre **en cada máquina**, igual que las tareas 0.01 a 0.06, así que
el detalle individual vive acá: cada uno marca su casilla cuando le levanta en la
suya. Es la excepción al "una sola persona a la vez" de esta fase: el resto de la
1.01 a la 1.10 lo escribe una persona, pero la 1.11 la corren los tres.

| Integrante | 1.11 |
|---|---|
| Juan Pablo | `[x]` |
| Mauricio | `[x]` |
| Juan José | `[x]` |

**Las tres filas se vaciaron el 2026-08-31, después de cerrar la 1.13.**
Mauricio y Juan José habían marcado las suyas contra un `main` que todavía no
tenía ni la 1.12 ni la 1.13, así que lo que probaron fue un procedimiento que
ya cambió dos veces. No es trabajo tirado —confirma que el entorno les
levanta—, pero como verificación de la 1.11 no vale. Ahora el procedimiento
está cerrado y la prueba se corre una sola vez.

**La 1.11 pasa a `[x]` en la tabla de tareas solo cuando las tres filas están
completas.** Mientras haya una casilla vacía, queda en `[ ]`, aunque en tu máquina
levante.

### Por qué la prueba de humo del entorno va acá y no antes

La 0.09 verifica que los tres clonaron y tienen las herramientas instaladas, pero
**no puede verificar lo que importa** —que el proyecto levante y se conecte a la
base— porque en ese momento el proyecto todavía no existe. La 1.11 cubre eso, y
va al final de la fase 1 porque es el primer punto del roadmap donde hay algo que
levantar.

Ponerla acá es lo que evita el peor escenario: **si alguien descubre en la fase 3
que nunca le anduvo Docker, ya perdió el trabajo de dos fases** sin saber si el
problema era el código o su máquina. Correr `npm run check` en las tres es además
donde se ve si el tema de los finales de línea quedó bien resuelto: es el primer
momento en que Prettier revisa archivos generados en tres máquinas distintas.

---

# FASE 2 — Modelo de datos

**Lo hace una sola persona a la vez**; el resto espera. Es el punto de conflicto
más caro del proyecto. Acá sí conviene que sea la misma de punta a punta, porque
las migraciones encadenan y el orden en que se generan importa. Quién la lleva se
decide cuando se empieza, no antes.

| # | Tarea | Estado | Tamaño | Depende |
|---|---|---|---|---|
| 2.01 | Enums: `TipoUsuario`, `TipoMovimiento`, `UnidadMedida` y `Severidad`. **`Severidad` es la única escala de gravedad**: vive en `Interaccion` y la observación hereda ese valor. No se crea `NivelCriticidad` — dos escalas paralelas son sobreingeniería para un prototipo. | `[x]` | S | 1.11 |
| 2.02 | Modelo `Medicamento`. Comentar cada decisión en el propio archivo. | `[x]` | S | 2.01 |
| 2.03 | Modelos de stock: `Lote` y `MovimientoStock`, con relaciones y `onDelete: Cascade`. | `[x]` | M | 2.02 |
| 2.04 | Modelos clínicos: `Paciente`, `MedicacionVigente`, `ConsultaInteraccion`, `ObservacionInteraccion`. | `[x]` | M | 2.02 |
| 2.05 | Modelo `Interaccion` (par de drogas por RxCUI, severidad, descripción, fuente). | `[x]` | M | 2.02 |
| 2.06 | Modelos transversales: `Usuario` y `RegistroAuditoria`. **`RegistroAuditoria` se crea pero no se usa en el prototipo** — está en el modelo de dominio y sacarla contradiría la documentación. | `[x]` | S | 2.01 |
| 2.07 | Primera migración: `npx prisma migrate dev --name inicial`. Verificar con Prisma Studio. | `[x]` | M | 2.02–2.06 |
| 2.08 | `seed.ts` mínimo: 3 usuarios y 10 medicamentos. Suficiente para desarrollar. | `[ ]` | M | 2.07 |
| 2.09 | Verificar que los tres aplican la migración en su base local sin errores. | `[ ]` | M | 2.07 |

---

# FASE 3 — Catálogo de medicamentos

Es el módulo más simple y va primero **a propósito**: fija el patrón de las tres
capas (servicio → route handler → pantalla) que copian las fases 4 y 5.

| # | Tarea | Estado | Tamaño | Depende |
|---|---|---|---|---|
| 3.01 | `src/services/medicamentos.ts`: listar, buscar por nombre, obtener por id, crear. Validar nombre de droga único. | `[ ]` | M | 2.09 |
| 3.02 | Validación de entrada (Zod) para medicamento. | `[ ]` | S | 3.01 |
| 3.03 | `app/api/medicamentos/route.ts`: GET (listado con filtro) y POST (alta). | `[ ]` | M | 3.02 |
| 3.04 | Manejo de errores unificado: función que traduce error de servicio a respuesta HTTP. | `[ ]` | M | 3.03 |
| 3.05 | Componentes base en `src/components/ui/`: `Boton`, `Campo`, `Tabla`, `Modal`. **Solo esos cuatro.** | `[ ]` | L | 1.10 |
| 3.06 | Pantalla `/medicamentos`: tabla con nombre de droga, RxCUI, unidad y stock mínimo. Buscador arriba. Botón **"Nuevo medicamento"**. | `[ ]` | M | 3.05, 3.03 |
| 3.07 | Modal de alta: nombre de droga, unidad de medida (select), stock mínimo, RxCUI opcional **cargado a mano**. Botones **"Guardar"** y **"Cancelar"**. Errores por campo. | `[ ]` | M | 3.06 |
| 3.08 | Estados de la tabla: cargando, vacía ("Todavía no hay medicamentos cargados") y error con botón **"Reintentar"**. | `[ ]` | M | 3.06 |

---

# FASE 4 — Stock, trazabilidad y FEFO

Uno de los dos argumentos centrales del proyecto.

### Lógica

| # | Tarea | Estado | Tamaño | Depende |
|---|---|---|---|---|
| 4.01 | `src/services/lotes.ts`: alta de lote (número, ingreso, vencimiento, cantidad ingresada). Unicidad de número por medicamento. | `[ ]` | M | 3.04 |
| 4.02 | Cálculo de **cantidad disponible por lote**: cantidad ingresada menos egresos. Función pura. | `[ ]` | M | 4.01 |
| 4.03 | Cálculo de **stock disponible por medicamento**: suma de lotes no vencidos. | `[ ]` | M | 4.02 |
| 4.04 | `src/services/movimientos.ts`: registrar ingreso y egreso **en transacción**. Un egreso nunca puede dejar el lote en negativo. | `[ ]` | L | 4.02 |
| 4.05 | Consulta de **stock bajo**: medicamentos por debajo del mínimo. | `[ ]` | M | 4.03 |
| 4.06 | Consulta de **vencimientos próximos**: lotes con disponible mayor a cero que vencen dentro de N días. N configurable. | `[ ]` | M | 4.03 |
| 4.07 | **Motor FEFO**: dado un medicamento y una cantidad, devolver el plan de egreso — qué lote y cuánto de cada uno — priorizando el vencimiento más próximo. **Función pura**: recibe los lotes y devuelve el plan, sin tocar la base. Excluye lotes vencidos y con disponible cero. | `[ ]` | L | 4.04 |
| 4.08 | Reparto entre varios lotes cuando el primero no alcanza, y error explícito de existencia insuficiente. | `[ ]` | M | 4.07 |
| 4.09 | Ejecución del plan: convertir el plan en N movimientos **en una única transacción**. O entran todos o ninguno. | `[ ]` | M | 4.08 |
| 4.10 | Route handlers de lotes, movimientos y dispensación. La dispensación devuelve el plan sin ejecutarlo (previsualización) o lo ejecuta, según parámetro. | `[ ]` | M | 4.09 |

> **Nota sobre FEFO sin pruebas automatizadas.** El prototipo no lleva tests, así
> que los casos borde hay que verificarlos a mano antes de dar la tarea por
> hecha: un solo lote alcanza; hay que repartir entre dos; hay un lote vencido
> que debe ignorarse; la existencia total no alcanza; dos lotes vencen el mismo
> día. Anotar el resultado en el PR.

### Interfaz

| # | Tarea | Estado | Tamaño | Depende |
|---|---|---|---|---|
| 4.11 | Pantalla `/stock`: tabla de medicamentos con disponible, mínimo e **indicador de estado** (bajo mínimo / lote por vencer / normal). Botón **"Ver lotes"** por fila. | `[ ]` | M | 4.10, 3.05 |
| 4.12 | Pantalla `/stock/[medicamentoId]`: lotes con número, vencimiento y disponible. Botones **"Registrar ingreso"** y **"Dispensar"**. | `[ ]` | M | 4.11 |
| 4.13 | Modal de ingreso: número de lote, fecha de ingreso, vencimiento, cantidad. Botones **"Registrar"** y **"Cancelar"**. Validar que el vencimiento sea futuro. | `[ ]` | M | 4.12 |
| 4.14 | Modal de dispensación con FEFO: se elige **cantidad, no lote**. El sistema muestra el plan propuesto ("60 del lote A, vence 03/2027 · 40 del lote B, vence 11/2027"). Botones **"Confirmar egreso"** y **"Cancelar"**. | `[ ]` | M | 4.13, 4.10 |
| 4.15 | Aviso de existencia insuficiente: mensaje con el disponible real y botón de confirmar deshabilitado. | `[ ]` | S | 4.14 |
| 4.16 | Historial de movimientos por lote: fecha, tipo, cantidad, usuario. **Sin botones de editar ni borrar** (es un libro mayor). | `[ ]` | M | 4.12 |
| 4.17 | Indicadores visuales de vencimiento: vencido, vence en menos de 30 días, vigente. | `[ ]` | S | 4.12 |

---

# FASE 5 — Módulo clínico

El otro argumento central. Detección determinística sobre base propia; RxNorm
queda fuera del prototipo (el RxCUI se carga a mano).

| # | Tarea | Estado | Tamaño | Depende |
|---|---|---|---|---|
| 5.01 | `src/services/pacientes.ts`: alta con seudónimo, listado, búsqueda. **Sin datos filiatorios.** | `[ ]` | M | 3.04 |
| 5.02 | `[?]` Importar el conjunto **ONCHigh** a la tabla `Interaccion`: mapear nombres a RxCUI y redactar las descripciones de severidad. **Bloqueada por D2.** | `[?]` | L | D2 |
| 5.03 | **Carga manual de al menos 15 pares** de psicofármacos que interactúan, con severidad y descripción, dentro del seed. Permite avanzar sin esperar a D2. | `[ ]` | M | 2.07 |
| 5.04 | `src/services/medicacion.ts`: agregar medicamento a un paciente, suspender con motivo, listar vigentes. | `[ ]` | M | 5.01 |
| 5.05 | Cálculo del **estado derivado** de la medicación (vigente / suspendida / finalizada) a partir de fechas y motivo. | `[ ]` | S | 5.04 |
| 5.06 | **Motor de interacciones**: dada una lista de RxCUI, devolver todos los pares que interactúan. Determinístico. | `[ ]` | L | 5.03 |
| 5.07 | Validación de que una consulta requiere al menos dos medicamentos (restricción `2..*` del modelo). | `[ ]` | S | 5.06 |
| 5.08 | `src/lib/redaccion/`: composición del texto de la observación **por plantilla**, a partir del par de drogas, la severidad y la descripción. Interfaz preparada para sustituir por un modelo generativo más adelante. | `[ ]` | M | 5.06 |
| 5.09 | `src/services/consultas.ts`: crear consulta, generar observaciones y persistir, todo en transacción. | `[ ]` | L | 5.08 |
| 5.10 | Route handlers de pacientes, medicación y consultas. | `[ ]` | M | 5.09 |
| 5.11 | Pantalla `/pacientes`: tabla de seudónimos con cantidad de medicamentos vigentes. Botón **"Nuevo paciente"**. | `[ ]` | M | 5.10, 3.05 |
| 5.12 | Modal de alta de paciente: solo el identificador, con nota visible explicando la seudonimización. Botón **"Crear"**. | `[ ]` | S | 5.11 |
| 5.13 | Pantalla `/pacientes/[id]`: medicación vigente con fecha de inicio y estado. Botones **"Agregar medicamento"** y **"Evaluar interacciones"**. | `[ ]` | M | 5.11 |
| 5.14 | Modal de alta de medicación: selector de medicamento con buscador y fecha de inicio. Botón **"Agregar"**. | `[ ]` | M | 5.13 |
| 5.15 | Botón **"Suspender"** por fila, con modal que pide motivo obligatorio. | `[ ]` | S | 5.14 |
| 5.16 | Pantalla `/consultas/nueva`: paciente (opcional, para el médico de guardia) y medicamentos a evaluar. Botón **"Evaluar interacciones"**, deshabilitado con menos de dos. | `[ ]` | L | 5.13 |
| 5.17 | Precarga: al elegir un paciente, sus medicamentos vigentes vienen seleccionados y se pueden agregar otros. | `[ ]` | M | 5.16 |
| 5.18 | Pantalla de resultado: observaciones ordenadas por severidad, con color según ese valor. Estado vacío explícito: **"No se encontraron interacciones registradas entre los medicamentos evaluados"**. | `[ ]` | L | 5.16 |
| 5.19 | Aviso obligatorio en toda pantalla clínica: el sistema asiste, no reemplaza el criterio profesional. | `[ ]` | S | 5.18 |
| 5.20 | Pantalla `/consultas`: lista simple de consultas por fecha, sin filtros. | `[ ]` | M | 5.10 |

---

# FASE 6 — Interfaz transversal y cierre

| # | Tarea | Estado | Tamaño | Depende |
|---|---|---|---|---|
| 6.01 | Layout general: barra lateral con navegación a Inicio, Medicamentos, Stock, Pacientes y Consultas. | `[ ]` | M | 3.05 |
| 6.02 | Selector de usuario simulado en la barra superior (reemplaza al login, que está fuera del prototipo). | `[ ]` | M | 6.01 |
| 6.03 | **Pantalla de inicio**: tarjetas con medicamentos bajo mínimo, lotes por vencer y consultas del día. Cada una lleva a su pantalla. | `[ ]` | L | 4.11, 5.20 |
| 6.04 | Manejo de errores global: página de error y componente de error por sección. | `[ ]` | M | 6.01 |
| 6.05 | Revisión responsive: usable en la notebook con la que se hace la defensa. | `[ ]` | M | 6.03 |
| 6.06 | `seed.ts` **definitivo**: psicofármacos reales con RxCUI, **un medicamento con dos lotes de distinto vencimiento** (para poder mostrar FEFO repartiendo) y pacientes cuya medicación **efectivamente dispara interacciones**. | `[ ]` | L | 5.09 |
| 6.07 | `README.md`: qué resuelve, cómo se levanta, decisiones de arquitectura. | `[ ]` | M | 6.05 |
| 6.08 | Guion de demostración: recorrido de cinco minutos con trazabilidad de lote, un egreso FEFO que reparte entre dos lotes y una detección de interacción. | `[ ]` | M | 6.06 |
| 6.09 | Ensayo de la demostración en la máquina de la defensa, con la base cargada desde cero. | `[ ]` | M | 6.08 |
| 6.10 | Preparar respuestas a las preguntas previsibles: por qué no hay receta, por qué no hay proveedor, por qué las interacciones no vienen de una API en vivo, por qué no hay auditoría implementada, por qué no hay validación médica registrada. | `[ ]` | M | 6.08 |

---

## Reparto sugerido

**Es una preferencia de continuidad, no una asignación.** Que la misma persona
siga las tareas de un módulo evita conflictos sobre los mismos archivos, pero
**no reserva nada**: lo único que reserva una tarea es la tabla "En curso ahora".
Si quien figura acá no está disponible, la toma otro.

- **Persona A:** Fases 0 y 1, luego Fase 3 (catálogo) y Fase 6 (interfaz y cierre).
- **Persona B:** Fase 2 (modelo de datos, en solitario), luego Fase 4 (stock y FEFO).
- **Persona C:** Fase 5 (clínico), arrancando por 5.03.

Mientras la Fase 2 está en curso, las otras dos personas pueden tomar la **3.05**
(componentes base), que solo depende de la 1.10 y no toca el modelo de datos, o
trabajar en la corrección de la documentación de las entregas, que es paralela a
todo. **La Fase 0 ya no es una opción en ese momento:** tiene que estar cerrada
para empezar la 1.01, y la 1.11 tiene que estar verificada en las tres máquinas
para empezar la 2.01.

## Riesgos

1. **FEFO es la tarea con más casos borde y no lleva pruebas automatizadas.** Por
   eso el motor (4.07) es una función pura separada de la escritura (4.09):
   permite verificarlo a mano con datos inventados, sin base de datos.
2. **El seed definitivo (6.06) no es opcional.** Sin datos que disparen
   interacciones y sin dos lotes de distinto vencimiento, no hay demostración.
3. **La Fase 5 es la más larga y la más importante para la defensa.** Si el
   tiempo aprieta, recortar la Fase 6 antes que la 5.
4. **Hay cosas conscientemente afuera** (auditoría, validación médica, pruebas,
   RxNorm en vivo). Están en `ROADMAP_PRODUCTO.md`. Que estén afuera es una
   decisión, no un olvido, y hay que poder sostenerlo — ver 6.10.
