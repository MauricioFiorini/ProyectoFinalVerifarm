# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-08-31
**Entrega:** Juan Pablo Malizani (las tres correcciones), sobre la fase 1 de
Mauricio Mateo Fiorini
**Rama:** `fix/1.02-check-en-clon-limpio`, ya mergeada a `main` (PR #2)
**Commit:** de `e49231a` a `c3b1770`, más el que trae este traspaso

### Qué se hizo

**La fase 1 está terminada de la 1.01 a la 1.10, y las tres correcciones que le
faltaban ya están en `main`.** Lo único pendiente de la fase es la **1.11**, la
prueba de humo del entorno, que corren los tres.

Lo que existe hoy en `main`: una aplicación Next.js 16.3.3 con TypeScript
estricto y App Router, PostgreSQL 16 en Docker con volumen persistente, Prisma
7.10.0 configurado y conectando, la estructura de carpetas de `src/` y la paleta
del sistema declarada con `@theme`. El detalle de cómo se construyó cada pieza
está en el traspaso anterior, en el historial (`git show 780e64f`), y en los
comentarios de los propios archivos de configuración.

Las tres correcciones, un commit cada una:

| Commit | Qué corrige |
|---|---|
| `e49231a` | 1.02 — `npm run check` fallaba en un clon limpio |
| `1b95fb8` | 1.07 — `dotenv` no estaba declarado |
| `c3b1770` | 1.10 — clases huérfanas en la página de inicio |

**`e49231a` es la importante.** `src/app/layout.tsx` tipaba sus props con
`LayoutProps<"/">`, un helper global que Next genera en `.next/types` recién al
correr `dev` o `build`. En un clon limpio ese tipo no existe y `npm run check`
cortaba con `Cannot find name 'LayoutProps'` antes de llegar a ESLint o a
Prettier. Ahora las props se tipan a mano con `{ children: ReactNode }`.

**`1b95fb8`.** `prisma.config.ts` importa `dotenv/config`, pero `dotenv` no
figuraba en `package.json`: llegaba como dependencia transitiva de `c12` y
funcionaba solo por el hoisting de npm. Quedó declarado en `devDependencies`,
porque el único que lo usa es la CLI de Prisma.

**`c3b1770`.** Al reescribir `globals.css` en la 1.10 desaparecieron los tokens
`--color-background` y `--color-foreground` del scaffold, pero
`src/app/page.tsx` seguía usando `bg-foreground` y `text-background`: Tailwind
ya no generaba esas utilidades y el botón primario quedaba sin fondo. Ahora usa
la paleta del proyecto. Se sacaron además las doce clases `dark:` que quedaban,
que contradecían la decisión de no tener modo oscuro.

### Decisiones tomadas sobre la marcha

**1. El arreglo del layout es tipar a mano, no agregar un build previo al
check.** La otra salida era hacer que `npm run check` corriera `next build` (o
`next typegen`) antes de `tsc`. Se descartó: un comando de validación que
depende de artefactos generados vuelve a fallar en cualquier máquina limpia, que
es exactamente el problema que se estaba arreglando. El costo es perder el
tipado automático de los params de ruta que da `LayoutProps`; en un layout raíz
que solo recibe `children` no se pierde nada.

**2. `dotenv` va en `devDependencies`, no en `dependencies`.** Solo lo usa
`prisma.config.ts`, que lo lee la CLI de Prisma en desarrollo. La aplicación en
ejecución no lo importa.

**3. La línea de `dotenv` en `package-lock.json` se agregó a mano.** Correr `npm
install` con npm 10.5.2 reescribía 116 líneas del lock borrando metadatos `libc`
que había escrito una versión más nueva de npm. Se editó solo la línea que hacía
falta y se verificó que `npm ci` acepta el lock sin quejarse de
desincronización. Si a alguien le aparece un diff enorme del lock sin haber
tocado dependencias, es esto: revisar la versión de npm antes de commitear.

**4. No se agregó `engines` a `package.json`.** Se evaluó y se dejó afuera de la
corrección a propósito. Por sí solo no impide nada —npm trata `engines` como
advertencia salvo que se sume `engine-strict=true` en un `.npmrc`, y el
`preinstall` de Prisma ya falla más fuerte y más claro—, y fijar el piso de Node
es una decisión de los tres que además toca el texto de la 0.01, que hoy dice
solo "Node.js LTS". Queda para resolver junto con la 1.11.

### Qué quedó sin hacer

**La 1.11**, la prueba de humo del entorno. Su tabla de verificación por
integrante sigue con las tres filas vacías.

**El piso de versión de Node no está escrito en ningún lado.** Prisma 7 exige
20.19+, 22.12+ o 24.0+, y con menos que eso `npm install` ni siquiera termina.
Ver la decisión 4.

`src/app/page.tsx` sigue siendo la página por defecto de `create-next-app`, con
los logos de Next y Vercel. Es a propósito: la pantalla de inicio es la tarea
**6.03** y el layout con la barra lateral es la **6.01**. La corrección solo la
dejó sin nada roto a la vista, porque los tres la van a ver al levantar la
aplicación en la 1.11.

### Cómo verificarlo

En una máquina donde el proyecto nunca corrió, sobre `main`:

```
git checkout main && git pull
cp .env.example .env      # y completar DATABASE_URL (puerto 5433)
npm install
npx prisma generate       # npm 11 no corre el postinstall de Prisma
docker compose up -d
npm run check             # tiene que pasar SIN haber levantado dev antes
npm run dev
```

**Verificado por Juan Pablo el 31/08/2026 con instalación desde cero en Node
24.20.0: `npm run check` pasa limpio sin haber levantado `dev` antes**, que es
justamente lo que fallaba y lo que motivó la corrección.

Los tres pasos previos —el `.env`, el puerto 5433 y el `prisma generate` a mano—
se descubrieron en esa verificación y **ninguno de los errores que producen
apunta a su causa real**. Están escritos en la sección 14 de
`docs/CONVENCIONES.md` y en los "Pasos previos de la 1.11" del roadmap. Es lo
primero que hay que mirar si algo no arranca.

Sobre Node: en una máquina con 20.13.1 esta secuencia **no se puede correr**.
`npm install` corta en el `preinstall` de Prisma con
`Prisma only supports Node.js versions 20.19+, 22.12+, 24.0+`.

### Qué sigue

**La 1.11**, la prueba de humo del entorno. La corren **los tres**, cada uno en
su máquina, sobre `main`, marcando su fila en la tabla de verificación por
integrante. Es la excepción al "una sola persona a la vez" de la fase 1.

Con las tres filas marcadas, la 1.11 pasa a `[x]`, la fase 1 cierra y se puede
empezar la **2.01**, los enums del modelo de datos. La fase 2 **la hace una sola
persona**: es el punto de conflicto más caro del proyecto, porque dos
migraciones en paralelo dejan la base de cada uno distinta.

Mientras tanto siguen disponibles, y no dependen de nada de esto: el bloque DOC
de `docs/ROADMAP_PRODUCTO.md` (DOC.01 a DOC.06), que es corrección de las
entregas de la facultad, y **resolver D2**.

### Antes de arrancar, tener en cuenta

- **Los tres pasos del clon limpio.** Están arriba, en "Cómo verificarlo", y
  desarrollados en la sección 14 de `docs/CONVENCIONES.md`: crear el `.env`,
  usar el puerto **5433** y correr **`npx prisma generate`** a mano después de
  `npm install`, porque npm 11 no corre el `postinstall` de Prisma. El error de
  este último es `Module '"@prisma/client"' has no exported member
  'PrismaClient'`, que no menciona ni a npm ni a Prisma.
- **Node 20.19+, 22.12+ o 24.0+.** Con menos, `npm install` no termina.
- **Docker Desktop tiene que estar abierto.** No arranca solo al iniciar sesión
  en Windows. Si no lo está, cualquier comando de docker falla con
  `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`.
- **`prisma generate` sugiere actualizar a `@latest`. No hacerlo.** Hoy `latest`
  es `8.0.0-rc.12`, un release candidate. Prisma queda clavado en `7.10.0`.
- **ESLint 9.39.5 avisa que la versión 9 ya no tiene soporte.** Es la que declara
  `eslint-config-next@16.3.3`; subir a la 10 por cuenta propia puede romper la
  configuración. Se dejó la que instala el scaffold.
- **En Tailwind 4 la paleta se toca en `src/app/globals.css`, no en un
  `tailwind.config`**, que no existe. Los tokens están en el bloque `@theme` y de
  cada uno salen las utilidades: `--color-critico-fondo` genera
  `bg-critico-fondo`, `text-critico-fondo` y `border-critico-fondo`.
- **Tailwind 4 descarta los tokens que nadie usa.** Si buscás un color en el CSS
  compilado y no aparece, no está roto: es que todavía ninguna clase lo usa. Al
  revés también pasa, y es lo que corrigió `c3b1770`: una clase que apunta a un
  token borrado no da error, simplemente no genera nada.
- **La lógica de negocio va en `src/services/`**, nunca en componentes ni en
  route handlers, y son Route Handlers, no Server Actions.
- **Preguntar antes de tocar `prisma/schema.prisma`.** Ahora existe, y a partir
  de la fase 2 cada cambio genera migraciones.
- La lista de lo que **no** se implementa está en `docs/CONTEXTO.md` sección 6 y
  en `docs/ROADMAP_PRODUCTO.md`. Los mockups de `concpeto/` muestran varias de
  esas cosas: son referencia visual, no una especificación.

### Bloqueos

**Ninguno.** La 1.11 no está bloqueada: solo hace falta que los tres la corran.

**D2** sigue abierta y sigue sin frenar nada: la tarea 5.03, carga manual de al
menos 15 pares de psicofármacos en el seed, permite avanzar con todo el módulo
clínico sin esperarla.

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
