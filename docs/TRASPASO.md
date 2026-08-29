# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-08-29
**Entrega:** Mauricio Mateo Fiorini
**Rama:** `feat/1.01-esqueleto-tecnico` (sin mergear)
**Commit:** de `7959cce` a `9c8d960`, más el que trae este traspaso

### Qué se hizo

**Las tareas 1.01 a 1.10 estan terminadas.** El esqueleto tecnico del proyecto
existe: hay una aplicacion Next.js que compila, una base PostgreSQL en Docker que
levanta y persiste, Prisma configurado y conectando, y la paleta del sistema
definida. Falta la **1.11**, que corren los tres y cierra la fase.

El trabajo esta en la rama `feat/1.01-esqueleto-tecnico`, **un commit por tarea**,
para que se pueda leer contra el roadmap:

| Commit | Tarea |
|---|---|
| `7959cce` | 1.01 — proyecto Next.js |
| `6489c79` | 1.02 — TypeScript estricto y prohibicion de `any` |
| `5b0e219` | 1.03 — Prettier y `npm run check` |
| `32cf802` | 1.04 — PostgreSQL 16 en Docker |
| `3bb5288` | 1.05 — `.env.example` |
| `57e4168` | 1.06 — Prisma 7.10.0 |
| `4a818f9` | 1.07 — `prisma.config.ts` |
| `279f9d5` | 1.08 — `src/lib/db.ts` |
| `78f8bc1` | 1.09 — estructura de carpetas |
| `07760a3` | 1.10 — paleta y tipografia |
| `9c8d960` | 1.04 — correccion del puerto (ver "Decisiones") |

Versiones que quedaron instaladas, verificadas contra npm el 29/08/2026:
**Next 16.3.3**, **React 19.2.8**, **TypeScript 5.9.3**, **Tailwind 4.3.3**,
**Prisma 7.10.0** (exacta, sin `^`, en `prisma` y `@prisma/client`),
**Prettier 3.9.6**, **ESLint 9.39.5**, **PostgreSQL 16** en Docker.

Detalle de lo que no se deduce del diff:

- **1.02.** El scaffold ya venia con `strict: true`. Se sumaron
  `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`,
  `noFallthroughCasesInSwitch`, `noUnusedLocals` y `noUnusedParameters`, y
  `allowJs` paso a `false`. En `eslint.config.mjs` se puso
  `@typescript-eslint/no-explicit-any` en `error` y `no-unused-vars` tambien en
  `error`, con el prefijo `_` permitido para lo que hay que declarar y no se usa.
- **1.03.** `npm run check` es `tsc --noEmit && eslint && prettier --check .`. Se
  agrego ademas `npm run format`, que corre `prettier --write .`, porque
  `docs/CONVENCIONES.md` seccion 9 pide formatear antes de commitear.
- **1.07.** `prisma.config.ts` usa `defineConfig` y el helper `env` de
  `prisma/config`, e importa `dotenv/config`. La firma se leyo de los tipos del
  paquete instalado (`node_modules/@prisma/config/dist/index.d.ts`), no de
  documentacion de internet, porque casi toda la que circula describe Prisma 6.
- **1.08.** `src/lib/db.ts` exporta `db`, no `prisma`, para que coincida con el
  nombre del archivo. Guarda la instancia en `globalThis` fuera de produccion,
  que es lo que evita que cada recarga de Next abra un pool nuevo.
- **1.09.** Se crearon `src/components`, `src/services` y `src/types` con un
  `.gitkeep` cada una, porque git no versiona carpetas vacias. `src/app` y
  `src/lib` ya tenian contenido.

### Decisiones tomadas sobre la marcha

**1. Se creo `prisma/schema.prisma` con generador y fuente de datos, sin
modelos.** La tarea 1.07 pide validar con `npx prisma validate`, y ese comando
necesita que el archivo exista. Tiene once lineas utiles: `generator client` y
`datasource db` con `provider = "postgresql"`, **ningun modelo**. Los modelos son
la fase 2 y los escribe una sola persona. Ojo con una diferencia de Prisma 7:
**la URL de conexion no va en `schema.prisma`**, va en `prisma.config.ts`.

**2. El puerto del host de PostgreSQL es el 5433, no el 5432.** Esto se descubrio
fallando. Con el 5432, `prisma db execute` respondia
`Authentication failed against database server`. El motivo: la maquina tenia un
**PostgreSQL 18 nativo corriendo como servicio de Windows**, ocupando
`0.0.0.0:5432`. Docker solo consiguio enlazar el 5432 en IPv6, `localhost`
resuelve primero por IPv4, y Prisma terminaba autenticando contra el PostgreSQL
de la maquina en vez de contra el del proyecto. El sintoma no apunta a la causa
en ningun momento. Con `5433:5432` el problema desaparece y no le pisa el puerto
a nadie. Esta explicado en el propio `docker-compose.yml` y en `.env.example`.

**3. Tailwind 4 no usa `tailwind.config`.** La tarea 1.10 estaba redactada para
Tailwind 3. `create-next-app` instala Tailwind 4, donde la configuracion es
CSS-first: los tokens se declaran con `@theme` dentro de `globals.css` y no se
genera ningun archivo de config. Se hizo de la forma que corresponde a la version
instalada y **se corrigio el texto de la tarea 1.10 en `docs/ROADMAP.md`** para
que diga lo que realmente se hizo.

**4. Los colores salen de muestrear los mockups, no de elegirlos a ojo.** Los
PNG de `concpeto/` se decodificaron leyendo los pixeles, tomando la moda de una
region para evitar el antialiasing. De ahi salen `#006194` (azul de marca),
`#f7f9fb` (fondo), `#e1e5e9` (borde de tarjeta), `#191c1e` (texto) y los fondos
de estado. Los pocos valores que el muestreo no pudo resolver —texto chico sobre
fondo de color— estan marcados como "derivado" en `src/app/globals.css`. Dato
util: **los mockups estan hechos con la paleta por defecto de Tailwind**,
`#fef2f2`, `#f0fdf4` y `#fffbeb` son exactamente `red-50`, `green-50` y
`amber-50`.

**5. Los mockups son referencia visual, no especificacion funcional.** Se acordo
explicitamente. Las pantallas que muestran incluyen varias cosas que estan fuera
del alcance del prototipo por decision escrita: campo **DNI del paciente** (que
contradice el invariante de que el paciente no tiene datos filiatorios),
**dosis y frecuencia**, **analisis generado por IA (RAG)**, **vademecum ANMAT**,
**analisis predictivo**, **auditoria y RBAC**, **diagnostico** y **multiples
depositos**. De los mockups se tomaron colores y tipografia. Nada mas.

**6. Toda la fase va en una sola rama.** `docs/CONVENCIONES.md` seccion 2 pide una
rama por tarea, pero las diez tareas encadenan y tocan los mismos archivos de
configuracion; diez ramas y diez merges no aportaban nada. Se mantiene un commit
por tarea, que es lo que permite reconstruir el trabajo.

**7. Del scaffold de Next no se copiaron dos archivos.** El `README.md` de
`create-next-app` no se trajo porque el README del proyecto lo escribe la tarea
6.07 y un README de boilerplate mientras tanto confunde mas de lo que ayuda. El
`.gitignore` tampoco: el del repositorio (tarea 0.07) es mas completo que el de
Next y ya cubre `.next/`, `out/`, `next-env.d.ts`, los `.env*` y los
`.tsbuildinfo`. Tampoco se genero `AGENTS.md`, que `create-next-app` incluye por
defecto: el proyecto ya tiene `CLAUDE.md` en la raiz.

**8. Se saco el modo oscuro que traia el scaffold.** La paleta esta calibrada
sobre fondo claro y los mockups son claros; un modo oscuro a medias se ve roto.
Si el equipo lo quiere, es una decision de diseño aparte.

**9. Prettier no formatea los `.md`.** `.prettierignore` excluye `*.md` y el
`.drawio`. La documentacion esta redactada y cortada a mano a 80 columnas;
Prettier reflowaria las tablas y los parrafos y generaria diffs enormes en
archivos que escribio el equipo. El formateo automatico es para codigo.

Ademas se corrigieron dos defectos que venian del propio scaffold, dentro de la
1.10: el `body` forzaba `font-family: Arial`, que anulaba la tipografia que carga
`next/font`, y `layout.tsx` declaraba `lang="en"` con el titulo
`"Create Next App"`. Ahora es `lang="es"` y el titulo es `Verifarm`.

Ninguna de estas decisiones cambia la arquitectura acordada, asi que
`docs/decisiones/` sigue vacia. La numero 2, la del puerto, es la que mas caro
sale volver a descubrir.

### Qué quedó sin hacer

**La 1.11**, la prueba de humo del entorno, que corren los tres, cada uno en su
maquina. Su tabla de verificacion por integrante sigue con las tres filas vacias.

**La rama no esta mergeada a `main`.** Segun `docs/CONVENCIONES.md` seccion 2,
antes del merge otra persona le tiene que pasar el ojo al diff.

`src/app/page.tsx` sigue siendo la pagina por defecto de `create-next-app`, con
los logos de Next y Vercel. Es a proposito: la pantalla de inicio es la tarea
**6.03** y el layout con la barra lateral es la **6.01**.

### Cómo verificarlo

En cualquier maquina, sobre la rama `feat/1.01-esqueleto-tecnico`:

```
git checkout feat/1.01-esqueleto-tecnico
npm install
cp .env.example .env      # y descomentar la DATABASE_URL de ejemplo
docker compose up -d
npm run check
npm run dev
```

Lo que se verifico en la maquina de Mauricio, y su resultado:

1. **`npm run check` pasa con codigo 0.** Corre `tsc --noEmit`, `eslint` y
   `prettier --check .`.
2. **`npm run build` compila** y prerrenderiza `/` y `/_not-found`.
3. **La prohibicion de `any` funciona de verdad.** Se escribio un archivo con
   `function prueba(x: any)`, ESLint lo rechazo con
   `Unexpected any. Specify a different type` **como error**, y el archivo se
   borro.
4. **`npx prisma validate`** responde `The schema at prisma\schema.prisma is
   valid` y confirma `Loaded Prisma config from prisma.config.ts`.
5. **PostgreSQL levanta y queda `healthy`**, con el healthcheck de `pg_isready`
   del propio `docker-compose.yml`.
6. **Prisma llega a la base:** `echo "SELECT 1;" | npx prisma db execute --stdin`
   responde `Script executed successfully`. Este es el mismo comando que pide la
   1.11.
7. **El volumen persiste de verdad.** Se creo una tabla con un dato, se corrio
   `docker compose down` —que elimina el contenedor y la red—, se volvio a
   levantar, y el dato seguia ahi. Despues se borro la tabla: la base quedo con
   cero tablas en el esquema `public`.
8. **La paleta genera utilidades reales.** Como Tailwind 4 descarta los tokens
   que nadie usa, se escribio una pagina de prueba con `bg-marca-600`,
   `text-critico-texto`, `bg-advertencia-fondo` y `bg-ok-fondo`, se compilo, y se
   confirmo que el CSS de salida contiene los hex muestreados. Despues se
   restauro la pagina original.

### Qué sigue

**La 1.11**, la prueba de humo del entorno, y **antes el merge de la rama**.

El orden es: alguien revisa el diff de `feat/1.01-esqueleto-tecnico`, se mergea a
`main`, y recien ahi los tres corren la 1.11 sobre `main`, cada uno en su
maquina, marcando su fila en la tabla de verificacion por integrante de la 1.11.

Con las tres filas marcadas, la 1.11 pasa a `[x]`, la fase 1 cierra y se puede
empezar la **2.01**, los enums del modelo de datos. La fase 2 **la hace una sola
persona**: es el punto de conflicto mas caro del proyecto, porque dos migraciones
en paralelo dejan la base de cada uno distinta.

Mientras tanto siguen disponibles, y no dependen de nada de esto: el bloque DOC
de `docs/ROADMAP_PRODUCTO.md` (DOC.01 a DOC.06), que es correccion de las
entregas de la facultad, y **resolver D2**.

### Antes de arrancar, tener en cuenta

- **El puerto de PostgreSQL es el 5433, no el 5432.** Si copiaste una
  `DATABASE_URL` vieja con 5432, no va a conectar. El porque esta en
  `docker-compose.yml`.
- **`.env` no esta en el repositorio y hace falta.** Sin el, `prisma.config.ts`
  aborta con `PrismaConfigEnvError: Cannot resolve environment variable:
  DATABASE_URL`. Se resuelve copiando `.env.example` a `.env` y poniendo la URL
  de ejemplo que ese mismo archivo trae comentada.
- **Docker Desktop tiene que estar abierto.** No arranca solo al iniciar sesion
  en Windows. Si no lo esta, cualquier comando de docker falla con
  `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`.
- **`npm install` puede avisar que hay scripts de instalacion sin aprobar**
  (`prisma`, `@prisma/engines`, `unrs-resolver`). Con esta version de npm es solo
  un aviso y Prisma funciono igual. Si algun dia `prisma generate` falla sin
  motivo aparente, ese es el primer lugar donde mirar.
- **`prisma generate` sugiere actualizar a `@latest`. No hacerlo.** Hoy `latest`
  es `8.0.0-rc.12`, un release candidate. Prisma queda clavado en `7.10.0`.
- **ESLint 9.39.5 avisa que la version 9 ya no tiene soporte.** Es la que declara
  `eslint-config-next@16.3.3`; subir a la 10 por cuenta propia puede romper la
  configuracion. Se dejo la que instala el scaffold.
- **En Tailwind 4 la paleta se toca en `src/app/globals.css`, no en un
  `tailwind.config`**, que no existe. Los tokens estan en el bloque `@theme` y de
  cada uno salen las utilidades: `--color-critico-fondo` genera
  `bg-critico-fondo`, `text-critico-fondo` y `border-critico-fondo`.
- **Tailwind 4 descarta los tokens que nadie usa.** Si buscas un color en el CSS
  compilado y no aparece, no esta roto: es que todavia ninguna clase lo usa.
- **La logica de negocio va en `src/services/`**, nunca en componentes ni en
  route handlers, y son Route Handlers, no Server Actions.
- **Preguntar antes de tocar `prisma/schema.prisma`.** Ahora existe, y a partir de
  la fase 2 cada cambio genera migraciones.
- La lista de lo que **no** se implementa esta en `docs/CONTEXTO.md` seccion 6 y
  en `docs/ROADMAP_PRODUCTO.md`. Los mockups de `concpeto/` muestran varias de
  esas cosas: son referencia visual, no una especificacion.

### Bloqueos

**Ninguno.** La 1.11 no esta bloqueada: solo necesita que la rama se revise y se
mergee, y que los tres la corran.

**D2** sigue abierta y sigue sin frenar nada: la tarea 5.03, carga manual de al
menos 15 pares de psicofarmacos en el seed, permite avanzar con todo el modulo
clinico sin esperarla.

---

## Plantilla (no borrar)

Al escribir un traspaso nuevo, se reemplaza la sección "Traspaso vigente"
respetando estos títulos:

```
**Fecha:** AAAA-MM-DD
**Entrega:** (quién termina)   **Rama:** (rama o `main`)   **Commit:** (hash corto)

### Qué se hizo
Tarea X.YY. Qué se implementó, qué archivos se tocaron y cómo encaja con lo que
ya existía. Tiene que alcanzar para entenderlo sin leer el código.

### Decisiones tomadas sobre la marcha
Lo que hubo que resolver y no estaba en el roadmap. Si es estructural, además va
a docs/decisiones/. Si no hubo, "Ninguna".

### Qué quedó sin hacer
Si quedó a medias, qué falta y hasta dónde se llegó. Si está completa, decirlo.

### Cómo verificarlo
Pasos concretos: qué abrir, qué cargar, qué tiene que pasar. Si es FEFO u otra
lógica con casos borde, los casos probados y su resultado.

### Qué sigue
La próxima tarea del roadmap, con su número. Solo la siguiente.

### Antes de arrancar, tener en cuenta
Trampas, dependencias nuevas, migraciones a correr.

### Bloqueos
Lo que impide avanzar y depende de otro. Si no hay, "Ninguno".
```

---

## Cómo se genera este archivo

Al terminar una tarea, pedirle a la IA:

> Terminé la tarea X.YY. Actualizá `docs/TRASPASO.md` siguiendo la plantilla:
> qué se hizo, decisiones tomadas sobre la marcha, qué quedó sin hacer, cómo
> verificarlo, cuál es la próxima tarea del roadmap, qué tener en cuenta antes de
> arrancar y si hay bloqueos. Sobrescribí el traspaso anterior. Marcá también la
> tarea en `docs/ROADMAP.md` y limpiá la tabla "En curso ahora". Todo en el mismo
> commit, sin mencionar ninguna IA en el mensaje.

**Reglas para el que lo genera:**

- **No inventar.** Si algo no se probó, decir que no se probó. Un traspaso que
  afirma que algo anda cuando nadie lo verificó es peor que uno que lo deja en
  duda.
- **Escribir para alguien que no estuvo.** Nada de "seguí donde quedamos" ni
  referencias a la conversación: el que lee no la tuvo.
- **Ser específico con los archivos.** Nombrarlos por ruta, no "el servicio ese".
- **No repetir el roadmap.** Este archivo cuenta *cómo* quedó la tarea; el
  roadmap dice *qué* falta.

**Reglas para el que lo recibe:**

1. Leer este archivo completo antes de tocar nada.
2. Correr el checklist de "antes de empezar a trabajar" de
   `docs/CONVENCIONES.md`.
3. Si algo del traspaso no se entiende, preguntar al que lo escribió **antes** de
   empezar. Cuesta un mensaje; desandar trabajo mal orientado cuesta una tarde.
