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
**Rama:** `fix/1.14-lock-y-procedimiento-de-dependencias`
**Commit:** la reserva `9c498ec` en `main`, más los tres de la rama

### Qué se hizo

**La tarea 1.14: reparar `package-lock.json` por segunda vez, declarar `tsx` y
fijar el procedimiento para agregar dependencias.**

La tarea no estaba en el roadmap: salió de una revisión de la fase 2 y de la
3.01, que se hizo antes y no tocó nada. El resto de esa revisión está sin
resolver y se detalla más abajo.

**El problema.** `npm ci` volvió a fallar con `EUSAGE`, reclamando
`@emnapi/runtime@1.11.3` y `@emnapi/core@1.11.3`: **exactamente las dos entradas
que había reparado la 1.13**, un día antes.

| Commit | Tarea | Qué le hizo al lock |
|---|---|---|
| `03aafb8` | 1.13 | Agregó exactamente esos 2 nodos |
| `ca338f5` | 2.08 | Eliminó exactamente esos 2, y agregó 18 |

**La causa.** Son dependencias transitivas de paquetes **opcionales de
plataforma** —`@img/sharp-wasm32`, `@tailwindcss/oxide-wasm32-wasi`— que no se
instalan en ninguna de las tres máquinas. `npm install`, corrido sin
`--package-lock-only`, poda del lock esos hijos pero **deja los padres**, que sí
quedan porque llevan metadata de `os` y `cpu`. El lock queda declarando una
dependencia sin el nodo que la satisface. `npm ci` valida el árbol y aborta;
`npm install` reconcilia en silencio, y por eso el daño no se ve hasta que
alguien clona limpio.

**No es cosa de la máquina de nadie.** Se descartó con una prueba: en una misma
máquina, sobre una copia del lock roto, `npm install --package-lock-only`
**vuelve a agregar las dos entradas**. La misma máquina da los dos resultados
según cómo se corra el comando.

**Los tres pedazos de la tarea:**

| Commit | Qué trae |
|---|---|
| `fix(1.14)` | El lock reparado y `tsx@4.23.13` declarada, en un solo movimiento |
| `docs(1.14)` | El procedimiento en la sección 11 de `CONVENCIONES.md`, la trampa nueva en la 14, y la decisión `0003` |
| `docs(1.14)` | El cierre: roadmap y este traspaso |

**Por qué `tsx` entra acá.** `package.json` y `prisma.config.ts` ejecutan
`npx tsx prisma/seed.ts`, pero `tsx` no estaba declarada ni en `package.json` ni
en el lock. En la máquina donde se escribió el seed anda porque `npx` la dejó
cacheada; en un clon limpio la baja de la red sin versión fijada, y sin conexión
el seed no corre. Se declaró en el mismo `npm install --package-lock-only` que
reparó el lock, porque es una sola operación y no dos.

### Decisiones tomadas sobre la marcha

**1. La tarea recibió número propio en vez de arreglarse al pasar.** Es la
segunda vez que el lock se rompe igual. Un arreglo silencioso habría dejado el
repositorio sano y la causa sin registrar, que es exactamente lo que pasó
después de la 1.13.

**2. `tsx` se fijó sin `^`**, igual que Prisma. Corre el seed, que es
infraestructura de arranque. Esto **no** reinstala el `save-exact` de `.npmrc`
que la decisión 0002 descartó: es una versión exacta escrita a mano para un
paquete, no una configuración global.

**3. Se evaluó y se descartó nombrar un dueño de dependencias.** Quien agregó
`pg` y compañía corrió el comando correcto para lo que quería hacer, y el lock
se rompió igual. El "quién" no ataca la causa; el "cómo" sí.

**4. La decisión de dependencias es la `0003`.** La del driver adapter de
Prisma 7, que estaba planificada como 0003, pasa a ser la **0004** y todavía no
está escrita.

**5. Este traspaso corrige uno anterior.** El traspaso de la 3.01 declaraba la
rama `feat/3.01-servicio-medicamentos`, **que nunca existió**: toda la fase 2 y
la 3.01 se commitearon directo a `main`, sin rama y sin que otra persona
revisara el diff. Queda asentado acá porque el archivo se sobrescribe y esa
información se perdía.

### Qué quedó sin hacer

**De la 1.14, nada.** La tarea está completa y verificada.

**Del ordenamiento que la originó, cinco cosas**, en este orden:

1. **La decisión `0004`**, sobre el driver adapter de Prisma 7 y las cuatro
   dependencias que entraron con la 2.08 (`pg`, `@prisma/adapter-pg`,
   `@types/pg`, `dotenv`). Están bien justificadas y no hay nada escrito.
2. **Restituir el comentario de `src/lib/db.ts`.** El commit `d373370` borró las
   nueve líneas que explicaban por qué el cliente vive en `globalThis` —el pool
   de conexiones y las recargas de Next—, fuera del alcance de la 3.01.
3. **Tabla de verificación por integrante en la 2.09, y volverla a `[ ]`.** La
   tarea dice "verificar que **los tres** aplican la migración" y la cerró una
   persona con un commit de una línea. Es el mismo tratamiento que ya tienen la
   0.09 y la 1.11.
4. **Los cinco temas de reunión** listados en "Bloqueos".
5. **Mauricio y Juan José todavía no corrieron `npm ci` con el lock reparado.**
   Hasta que lo hagan, lo único verificado es que anda en una máquina.

**Las tres vulnerabilidades `high` de `npm audit` siguen como estaban, a
propósito.** Son `deepmerge-ts <8.0.0`, que entra por `@prisma/config` y por
`prisma`. `npm audit fix --force` instala `prisma@6.12.0`: un downgrade que rompe
y que contradice el "Prisma queda clavado en 7.10.0" de `CONVENCIONES.md`. Es
una dependencia de desarrollo y no llega al código que corre.

### Cómo verificarlo

Sobre esta rama:

```
npm ci
npm run setup
npm run check
```

Verificado con **Node 24.20.0 y npm 11.19.0**, corriendo los comandos de verdad:

| Qué se probó | Resultado |
|---|---|
| `npm ci` con el lock de `main` | Falla, `EUSAGE`, dos entradas faltantes |
| `npm ci` con el lock de esta rama | Instala sin errores |
| Si `npm ci` reescribe el lock | No: mismo md5 antes y después |
| Nodos que agrega el arreglo | 37 |
| Nodos que elimina | **0** |
| `npm install --package-lock-only` dos veces | md5 idéntico: es idempotente |
| `npm run setup` | Regenera el cliente Prisma, código 0 |
| `npm run check` | Código 0: `tsc`, `eslint` y `prettier` |
| `npx --offline tsx --version` | `tsx v4.23.13`, resuelto local, sin red |

Las pruebas sobre locks rotos se hicieron en un directorio aparte, para no tocar
el entorno de trabajo.

**El `npx --offline` es la prueba que importa** para lo de `tsx`: confirma que se
resuelve desde `node_modules` y no bajándola de internet.

### Qué sigue

**Los cinco puntos de "Qué quedó sin hacer"**, en ese orden. Ninguno es código de
producto: son ordenamiento. Están antes de la fase 3 por decisión del equipo.

**Después, la fase 3.** La próxima tarea libre es la **3.02**, validación con
Zod, que depende de la 3.01 ya cerrada. Ojo: **Zod está en el stack acordado pero
todavía no está instalada**; cuando toque, se agrega con el procedimiento de la
sección 11, que ahora es obligatorio.

La **3.05** —los cuatro componentes base de `src/components/ui/`— solo depende de
la 1.10, así que la puede tomar otra persona en paralelo sin pisar a nadie.

**Antes de la 3.02 y la 3.07 hace falta resolver el `rxcui`**, que hoy es
obligatorio en el esquema y el roadmap lo pide opcional. Está en "Bloqueos".

### Antes de arrancar, tener en cuenta

- **Para agregar o cambiar una dependencia son tres pasos:**
  `npm install <paquete> --package-lock-only`, después `npm ci`, y **recién ahí**
  commitear. No es opcional: sin el flag el lock queda roto, y sin el `npm ci` no
  hay forma de enterarse. Sección 11 de `CONVENCIONES.md` y decisión 0003.
- **El comando de arranque sigue siendo `npm ci`, no `npm install`.** La decisión
  0002 no cambió.
- **Después de cada `npm ci` hay que correr `npm run setup`.** `npm ci` borra
  `node_modules` entero y se lleva el cliente Prisma generado.
- **`npm run setup` también hace falta cada vez que cambia
  `prisma/schema.prisma`.** Desde la fase 2 pasa seguido.
- **Si `npm ci` falla con `EUSAGE` y "Missing: ... from lock file"**, es el lock
  roto otra vez. **No lo arregles con `npm install` a secas**: lo reconcilia en
  silencio y esconde el problema. Está en las trampas de la sección 14.
- **Verificá tu versión de Node antes que nada.** Prisma 7 pide 20.19+, 22.12+ o
  24.0+. Si usás `fnm` o `nvm`, revisá cuál es tu versión **por defecto**.
- **Los avisos de `npm warn install-scripts` son esperables.** npm 11 bloquea los
  scripts de instalación; de eso se encarga `npm run setup`. No hay que
  aprobarlos.
- **`npm audit` reporta tres `high`. No correr `npm audit fix --force`:** hace
  downgrade de Prisma a la 6.12.0. Ver "Qué quedó sin hacer".
- **El puerto de PostgreSQL es el 5433, no el 5432.** `npm run setup` avisa si tu
  URL apunta a otro. El porqué está en `docker-compose.yml`.
- **Docker Desktop tiene que estar abierto.** No arranca solo en Windows.
- **`prisma generate` sugiere actualizar a `@latest`. No hacerlo.** Hoy `latest`
  es un release candidate de la 8. Prisma queda clavado en `7.10.0`.
- **El bloque `nextjs-agent-rules` vive en `AGENTS.md`, no en `CLAUDE.md`.** Lo
  regenera `next dev` solo. No editarlo a mano ni moverlo de archivo.
- **En Tailwind 4 la paleta se toca en `src/app/globals.css`**, en el bloque
  `@theme`. No existe `tailwind.config`.
- **La lógica de negocio va en `src/services/`**, nunca en componentes ni en route
  handlers, y son Route Handlers, no Server Actions.
- **Preguntar antes de tocar `prisma/schema.prisma`.** Cada cambio genera
  migraciones, y **nunca se edita una ya mergeada**: si está mal, se corrige con
  una migración nueva.
- **Código va en rama, una tarea por rama, y otra persona le pasa el ojo al
  diff.** La fase 2 entera y la 3.01 entraron directo a `main` sin eso. Si el
  equipo decide que la regla no se sostiene, se cambia el documento; lo que no
  sirve es tener una regla escrita que nadie sigue.
- La lista de lo que **no** se implementa está en `docs/CONTEXTO.md` sección 6 y
  en `docs/ROADMAP_PRODUCTO.md`. Los mockups de `concpeto/` son referencia
  visual, no una especificación.

### Bloqueos

**La 1.14 no dejó ninguno.**

**Cinco decisiones de equipo, pendientes de reunión.** Cada una traba algo:

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
