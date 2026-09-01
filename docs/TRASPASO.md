# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-09-01
**Entrega:** Juan Pablo Malizani
**Rama:** `docs/1.15-driver-adapter-y-comentario-de-db`
**Commit:** la reserva `5c1f224` en `main`, más los dos de la rama

> **Ojo con el orden de merge.** La tarea **1.14** está terminada y en revisión
> de Mauricio sobre `fix/1.14-lock-y-procedimiento-de-dependencias`, **sin
> mergear todavía**. Esta rama salió de `main`, así que las dos tocan
> `docs/TRASPASO.md` y `docs/ROADMAP.md` y **van a dar conflicto**. La 1.14 se
> mergea primero; al resolver el conflicto de este archivo, **se queda esta
> versión**, que ya incluye todo lo que decía la de la 1.14. En el roadmap, la
> tabla "En curso ahora" queda **vacía** y las dos filas en `[x]`.

### Qué se hizo

**La tarea 1.15: escribir la decisión `0004` y restituir el comentario de
`src/lib/db.ts`.**

Las dos mitades vienen de la misma revisión de la fase 2 y la 3.01, y las dos
son documentación: **no se cambió el comportamiento de nada.**

**La decisión `0004`, sobre las cuatro dependencias del driver adapter.** Entre
la 2.08 y la 3.01 entraron `pg`, `@prisma/adapter-pg`, `@types/pg` y `dotenv`,
que no están en el stack que `CONVENCIONES.md` declara cerrado, y no había nada
escrito sobre por qué. Están perfectamente justificadas; el problema era que
nadie podía saberlo.

**El punto que hacía falta verificar, y se verificó.** El traspaso de la 3.01
afirmaba que el adapter es "estrictamente obligatorio en Prisma 7". Es cierto, y
ahora está probado en vez de repetido: los mensajes salen del runtime del
paquete instalado, `@prisma/client@7.10.0`.

```
PrismaClient requires a driver adapter to connect to your database,
but none was provided.
```

Hay una segunda evidencia, dentro del repositorio: el bloque `datasource` de
`prisma/schema.prisma` **no tiene `url`**. La URL vive en `prisma.config.ts`, que
alcanza para la CLI pero no lo lee el cliente que corre en la aplicación. Sin
`url` en el esquema y sin adaptador, el cliente no tiene de dónde sacar la
conexión. No hay otra salida.

**El comentario de `src/lib/db.ts`.** El commit `d373370` borró nueve líneas que
explicaban por qué el cliente vive en `globalThis` —el pool de conexiones y las
recargas de Next—, fuera del alcance de la 3.01. Se restituyeron **y se
ampliaron**, porque con Prisma 7 el argumento es más fuerte que antes: el pool ya
no lo maneja Prisma por dentro, lo crea el proyecto con `new Pool()`. Sin el
singleton, cada recarga de Next en desarrollo deja un pool abierto que nadie
cierra.

| Commit | Qué trae |
|---|---|
| `docs(1.15)` | La decisión `0004` y el comentario restituido en `src/lib/db.ts` |
| `docs(1.15)` | El cierre: roadmap y este traspaso |

### Decisiones tomadas sobre la marcha

**1. El comentario se amplió, no se pegó igual.** Restituir las nueve líneas
originales tal cual habría dejado un comentario correcto pero desactualizado:
describía un `new PrismaClient()` que ya no es como se instancia. Se conservó el
texto original entero y se le agregó lo que cambió con la 7.

**2. La afirmación sobre el adapter se verificó antes de escribirla.** Venía del
traspaso de otra persona y `REGLAS_IA.md` pide no repetir lo que no se comprobó.
Se comprobó contra el paquete instalado.

**3. No se agregó `dotenv/config` a `src/lib/db.ts`.** Es una mejora real y está
identificada, pero **no era parte de esta tarea**: la 1.15 dice explícitamente
que no se toca el comportamiento del cliente. Queda anotada como consecuencia en
la propia decisión 0004, para que quien la lea sepa que se vio y se dejó a
propósito.

**4. La `0004` se escribió sabiendo que la `0003` todavía no está en `main`.**
Vive en la rama de la 1.14. Los dos archivos son distintos y no conflictúan; el
único efecto es que hasta que la 1.14 se mergee, la referencia cruzada de
`CONVENCIONES.md` a la 0003 apunta a un archivo que no está.

### Qué quedó sin hacer

**De la 1.15, nada.** La tarea está completa y verificada.

**Del ordenamiento que salió de la revisión, dos cosas:**

1. **Tabla de verificación por integrante en la 2.09, y volverla a `[ ]`.** La
   tarea dice "verificar que **los tres** aplican la migración" y la cerró una
   persona con un commit de una línea. Es el mismo tratamiento que ya tienen la
   0.09 y la 1.11. **Va directo a `main`**, es corrección de documentación.
2. **Mauricio y Juan José tienen que correr `npm ci` con el lock reparado.** Va
   después de que se mergee la 1.14. Hasta entonces, lo único verificado es que
   el lock anda en una máquina.

**Y los cinco temas de reunión**, que lleva Juan Pablo. Están en "Bloqueos".

**Las tres vulnerabilidades `high` de `npm audit` siguen como estaban, a
propósito.** Son `deepmerge-ts <8.0.0`, que entra por `@prisma/config` y por
`prisma`. `npm audit fix --force` instala `prisma@6.12.0`: un downgrade que rompe
y contradice el "Prisma queda clavado en 7.10.0" de `CONVENCIONES.md`.

### Cómo verificarlo

```
npm ci
npm run setup
npm run check
```

| Qué se probó | Resultado |
|---|---|
| `npm run check` sobre esta rama | Código 0: `tsc`, `eslint` y `prettier` |
| Los mensajes del runtime de Prisma | Encontrados en `@prisma/client@7.10.0` instalado |
| `datasource` de `schema.prisma` | Confirmado sin `url` |
| Cambios de comportamiento | **Ninguno**: solo comentarios y un archivo nuevo en `docs/decisiones/` |

La 1.15 no toca código ejecutable. El diff de `src/lib/db.ts` es enteramente
comentario.

### Qué sigue

**Primero, las dos cosas de "Qué quedó sin hacer"**: la tabla de la 2.09 directo
a `main`, y el `npm ci` de Mauricio y Juan José una vez mergeada la 1.14.

**Después, la fase 3.** La próxima tarea libre es la **3.02**, validación con
Zod, que depende de la 3.01 ya cerrada — pero **necesita antes la decisión sobre
`rxcui`**, que está en "Bloqueos". Zod está en el stack acordado pero todavía no
está instalada; cuando toque, se agrega con el procedimiento de la sección 11 de
`CONVENCIONES.md`, que ahora es obligatorio.

La **3.05** —los cuatro componentes base de `src/components/ui/`— solo depende de
la 1.10, así que la puede tomar otra persona en paralelo sin pisar a nadie, y no
está bloqueada por ninguna decisión de reunión. **Es lo más sano para arrancar.**

### Antes de arrancar, tener en cuenta

- **Para agregar o cambiar una dependencia son tres pasos:**
  `npm install <paquete> --package-lock-only`, después `npm ci`, y **recién ahí**
  commitear. No es opcional: sin el flag el lock queda roto, y sin el `npm ci` no
  hay forma de enterarse. Sección 11 de `CONVENCIONES.md` y decisión 0003.
- **El comando de arranque sigue siendo `npm ci`, no `npm install`.** Decisión
  0002.
- **Después de cada `npm ci` hay que correr `npm run setup`.** `npm ci` borra
  `node_modules` entero y se lleva el cliente Prisma generado.
- **`npm run setup` también hace falta cada vez que cambia
  `prisma/schema.prisma`.**
- **Si `npm ci` falla con `EUSAGE` y "Missing: ... from lock file"**, es el lock
  roto otra vez. **No lo arregles con `npm install` a secas.** Trampas, sección
  14.
- **El cliente Prisma se instancia en un solo lugar, `src/lib/db.ts`.** No
  construyas un `PrismaClient` por tu cuenta en otro archivo: sin el adaptador no
  se conecta, y sin el singleton se acumulan pools. `prisma/seed.ts` es la única
  excepción y está explicada en la decisión 0004.
- **Verificá tu versión de Node antes que nada.** Prisma 7 pide 20.19+, 22.12+ o
  24.0+. Si usás `fnm` o `nvm`, revisá cuál es tu versión **por defecto**.
- **Los avisos de `npm warn install-scripts` son esperables.** De eso se encarga
  `npm run setup`. No hay que aprobarlos.
- **`npm audit` reporta tres `high`. No correr `npm audit fix --force`.**
- **El puerto de PostgreSQL es el 5433, no el 5432.**
- **Docker Desktop tiene que estar abierto.** No arranca solo en Windows.
- **`prisma generate` sugiere actualizar a `@latest`. No hacerlo.** Hoy `latest`
  es un release candidate de la 8. Prisma queda clavado en `7.10.0`.
- **El bloque `nextjs-agent-rules` vive en `AGENTS.md`, no en `CLAUDE.md`.**
- **En Tailwind 4 la paleta se toca en `src/app/globals.css`**, en el bloque
  `@theme`. No existe `tailwind.config`.
- **La lógica de negocio va en `src/services/`**, nunca en componentes ni en route
  handlers, y son Route Handlers, no Server Actions.
- **Preguntar antes de tocar `prisma/schema.prisma`.** Cada cambio genera
  migraciones, y **nunca se edita una ya mergeada**: si está mal, se corrige con
  una migración nueva.
- **Código va en rama, una tarea por rama, y otra persona le pasa el ojo al
  diff.** La fase 2 entera y la 3.01 entraron directo a `main` sin eso; el
  traspaso de la 3.01 declaraba una rama `feat/3.01-servicio-medicamentos` que
  **nunca existió**. Si el equipo decide que la regla no se sostiene, se cambia el
  documento; lo que no sirve es tener una regla escrita que nadie sigue.
- La lista de lo que **no** se implementa está en `docs/CONTEXTO.md` sección 6 y
  en `docs/ROADMAP_PRODUCTO.md`. Los mockups de `concpeto/` son referencia
  visual, no una especificación.

### Bloqueos

**La 1.15 no dejó ninguno.**

**Cinco decisiones de equipo, pendientes de reunión.** Las lleva Juan Pablo.
Cada una traba algo:

| Decisión | Traba |
|---|---|
| **Identidad del medicamento** — `rxcui` obligatorio u opcional, y si la dosis va dentro del nombre | 3.02 y 3.07 |
| **Modelo de `Lote`** — faltan `fechaIngreso` y `cantidadIngresada`, que el modelo de dominio sí tiene | 4.01 |
| **Los diez RxCUI del seed** — mezclan códigos de ingrediente con códigos de producto, y hay que verificarlos contra RxNav | 5.02 y 5.03 |
| **Usuario de los movimientos** — `MovimientoStock.usuarioId` es obligatorio y no hay autenticación en el alcance | 4.02 |
| **Ramas y revisión** — se sostiene la regla o se cambia el documento | nada, pero se repite |

**D2 sigue abierta** y sigue sin frenar nada: la tarea 5.03, carga manual de al
menos 15 pares de psicofármacos en el seed, permite avanzar con todo el módulo
clínico sin esperarla.

---
