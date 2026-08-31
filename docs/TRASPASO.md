# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-08-31
**Entrega:** Juan Pablo Malizani
**Rama:** `docs/1.13-npm-ci`
**Commit:** de `e50e061` a `03aafb8`, más el que trae este traspaso

### Qué se hizo

**La tarea 1.13: el comando de instalación pasa de `npm install` a `npm ci`.**
Y, sin estar previsto, la reparación del `package-lock.json`, que estaba roto.

**Por qué.** El commit `35559a5` movió 184 líneas del lock sin que su autor lo
pidiera ni lo notara: el mensaje decía `docs:` y el lock viajó de polizón. No
fue un error suyo. Corrió `npm install`, que era el comando documentado, y
`npm install` tiene permiso para reescribir el lock cuando una dependencia
transitiva con rango flotante tiene una versión nueva publicada. `npm ci`
instala exactamente lo que dice el lock y no lo reescribe nunca.

**El hallazgo que cambió la tarea.** Comparando los dos locks entrada por
entrada, el cambio parecía cosmético: 563 entradas antes, 563 después, ninguna
dependencia real distinta. Pero al correr `npm ci` de verdad, el lock nuevo no
se puede instalar:

```
npm error code EUSAGE
npm error Missing: @emnapi/runtime@1.11.3 from lock file
npm error Missing: @emnapi/core@1.11.3 from lock file
```

El lock anterior a `35559a5` sí instala. O sea que ese commit dejó el lock
internamente inconsistente, y **el problema sobrevivió escondido durante un día
por el mismo comportamiento que esta tarea elimina**: `npm install` reconcilia
en silencio, así que a los tres les seguía instalando bien.

La parte reutilizable: comparar dos locks dice si describen los mismos
paquetes, no si alguno es instalable. Lo único que responde eso es `npm ci`.

**Los tres pedazos de la tarea:**

| Commit | Qué trae |
|---|---|
| `e50e061` | La decisión `0002`, con el hallazgo y la corrección del argumento inicial |
| `cf4af81` | `npm install` a `npm ci` en diez lugares de `CONVENCIONES.md` y `ROADMAP.md` |
| `03aafb8` | El lock reparado con un `npm install` deliberado, más la fila 1.13 del roadmap |

`scripts/setup.mjs` **no se tocó**. La 1.13 no cambia el script de la 1.12, solo
el comando que va antes.

**Aparte de la 1.13, y ya en `main`:** el commit `374fc1c` sacó de `CLAUDE.md`
el bloque `<!-- BEGIN:nextjs-agent-rules -->` que `next dev` había inyectado
solo, y lo mudó a un `AGENTS.md` nuevo. `CLAUDE.md` volvió a ser exactamente lo
que el equipo escribió, byte por byte.

### Decisiones tomadas sobre la marcha

**1. La tarea dejó de ser solo documentación.** Estaba planteada como un cambio
de comando y nada más. Al verificar `npm ci` apareció el lock roto, y sin
repararlo el comando nuevo directamente no arranca. La fila del roadmap decía
"es solo documentación" y se corrigió.

**2. El lock se reparó regenerándolo, no revirtiéndolo.** Las dos opciones
funcionaban: la versión anterior a `35559a5` pasa `npm ci`. Se eligió regenerar
con un `npm install` deliberado —el primer uso del rol nuevo que la decisión
0002 le asigna— porque revertir deja un lock que igual habría que regenerar al
primer cambio de dependencias de la fase 2. Agregó las dos entradas que
faltaban y nada más: de 563 a 565 entradas, ninguna versión movida.

**3. Se corrigió un argumento de la propia decisión 0002 antes de pushearla.**
La primera versión decía que revertir el archivo "no habría servido de nada".
Con el hallazgo, eso es incompleto: revertir sí habría devuelto un lock
instalable. Hacen falta las dos cosas, reparar el archivo y cambiar el comando.
Se reescribió el commit, que todavía no estaba pusheado; **las decisiones ya
publicadas no se editan**, se reemplazan por una nueva.

**4. Las tres filas de la 1.11 vuelven a `[ ]`.** Mauricio y Juan José habían
marcado las suyas el 2026-08-31, contra un `main` sin la 1.12 y sin la 1.13. No
es trabajo tirado —confirma que el entorno les levanta— pero como verificación
de la 1.11 no vale: probaron un procedimiento que ya cambió dos veces.

### Qué quedó sin hacer

**Nada de la 1.13.** La tarea está completa y verificada.

De la fase 1 sigue pendiente solo la **1.11**, la prueba de humo, ahora con las
tres filas en `[ ]`.

**Las tres vulnerabilidades `high` de `npm audit` se dejaron como están, a
propósito.** Son `deepmerge-ts <8.0.0`, que entra por `@prisma/config` y por
`prisma`. El `npm audit fix --force` que sugiere npm instala `prisma@6.12.0`:
un downgrade que rompe, y que contradice el "Prisma queda clavado en 7.10.0" de
`docs/CONVENCIONES.md`. Es una dependencia de desarrollo, la CLI de Prisma, y
no llega al código que corre. Queda anotado para que nadie lo "arregle" sin
leer esto.

### Cómo verificarlo

Sobre esta rama, en una máquina donde el proyecto nunca corrió:

```
cp .env.example .env      # y completar DATABASE_URL (puerto 5433)
npm ci
npm run setup
docker compose up -d
npm run check
npm run dev
```

Verificado con **Node 24.20.0 y npm 11.19.0**, corriendo los comandos de
verdad y no con `--dry-run`:

| Qué se probó | Resultado |
|---|---|
| `npm ci` con el lock de `main` | Falla, `EUSAGE`, dos entradas faltantes |
| `npm ci` con el lock anterior a `35559a5` | `added 482 packages` |
| `npm ci` con el lock reparado | `added 482 packages`, 1m38s |
| `npm ci` dos veces seguidas | Idéntico |
| Si `npm ci` reescribe el lock | No: mismo md5 antes y después |
| `npm run setup` después del `npm ci` | Regenera el cliente Prisma, código 0 |
| `npm run check` | Código 0 |

**Confirmado que `npm ci` borra `node_modules` entero y se lleva el cliente
Prisma generado.** Por eso `npm run setup` va siempre después, y por eso está
documentado en la sección 11 de `docs/CONVENCIONES.md`.

Los dos locks viejos se probaron en directorios limpios aparte, para no tocar
el entorno de trabajo.

### Qué sigue

**La 1.11**, la prueba de humo del entorno, una vez que esta rama esté mergeada.
Ahora sí: con la 1.12 y la 1.13 adentro, el procedimiento de arranque está
cerrado y no va a volver a cambiar.

La corren **los tres**, cada uno en su máquina, sobre `main`, marcando su fila
en la tabla de verificación por integrante. Es la excepción al "una sola persona
a la vez" de la fase 1. Antes de correrla, hacer los "Pasos previos de la 1.11"
del roadmap.

Con las tres filas marcadas, la 1.11 pasa a `[x]`, la fase 1 cierra y se puede
empezar la **2.01**, los enums del modelo de datos. La fase 2 **la hace una sola
persona**: dos migraciones en paralelo dejan la base de cada uno distinta.

Mientras tanto siguen disponibles, y no dependen de nada de esto: el bloque DOC
de `docs/ROADMAP_PRODUCTO.md` (DOC.01 a DOC.06), que es corrección de las
entregas de la facultad, y **resolver D2**. De ese bloque, la **DOC.05** es la
única cuyo archivo está en este repositorio: actualiza
`docs/MD_VERIFARM.drawio`. Las otras cinco tocan las entregas de la facultad,
que viven fuera.

### Antes de arrancar, tener en cuenta

- **El comando de instalación es `npm ci`, no `npm install`.** `npm install`
  queda solo para agregar o cambiar una dependencia a propósito, que es cuando
  el lock tiene que cambiar. El porqué está en la decisión 0002.
- **Después de cada `npm ci` hay que correr `npm run setup`.** `npm ci` borra
  `node_modules` entero y se lleva el cliente Prisma generado. No es opcional.
- **`npm run setup` también hace falta cada vez que cambie
  `prisma/schema.prisma`.** A partir de la fase 2 va a pasar seguido.
- **Si `package-lock.json` aparece modificado sin que lo hayas tocado**, fue un
  `npm install`. Se descarta con `git checkout -- package-lock.json` y se vuelve
  a correr `npm ci`. Está en las trampas de la sección 14.
- **Verificá tu versión de Node antes de todo lo demás.** Prisma 7 pide **20.19+,
  22.12+ o 24.0+**. Con una anterior la instalación corta en el `preinstall` de
  Prisma; ese error sí dice qué pasa, pero se evita mirando `node -v` primero.
  Si usás `fnm` o `nvm`, revisá cuál es tu versión **por defecto**.
- **Los avisos de `npm warn install-scripts` son esperables y no hay que
  tocarlos.** npm 11 bloquea por defecto los scripts de instalación de las
  dependencias y lista `prisma`, `@prisma/engines` y `unrs-resolver`. **No hace
  falta aprobarlos**: de eso se encarga `npm run setup`, y aprobarlos es una
  configuración de cada máquina que haría que los tres corran cosas distintas.
- **`npm audit` reporta tres vulnerabilidades `high`. No correr
  `npm audit fix --force`:** hace downgrade de Prisma a la 6.12.0. Ver "Qué
  quedó sin hacer".
- **El puerto de PostgreSQL es el 5433, no el 5432.** `npm run setup` avisa si
  tu URL apunta a otro. El porqué está en `docker-compose.yml`.
- **Docker Desktop tiene que estar abierto.** No arranca solo al iniciar sesión
  en Windows.
- **`prisma generate` sugiere actualizar a `@latest`. No hacerlo.** Hoy `latest`
  es `8.0.0-rc.12`, un release candidate. Prisma queda clavado en `7.10.0`.
- **ESLint 9.39.5 avisa que la versión 9 ya no tiene soporte.** Es la que declara
  `eslint-config-next@16.3.3`; subir a la 10 por cuenta propia puede romper la
  configuración.
- **El bloque `nextjs-agent-rules` ahora vive en `AGENTS.md`, no en
  `CLAUDE.md`.** Lo regenera `next dev` solo. No editarlo a mano y no moverlo de
  archivo: si `CLAUDE.md` vuelve a tener el bloque, `next dev` vuelve a escribir
  ahí.
- **En Tailwind 4 la paleta se toca en `src/app/globals.css`**, en el bloque
  `@theme`. No existe `tailwind.config`.
- **La lógica de negocio va en `src/services/`**, nunca en componentes ni en
  route handlers, y son Route Handlers, no Server Actions.
- **Preguntar antes de tocar `prisma/schema.prisma`.** A partir de la fase 2 cada
  cambio genera migraciones.
- La lista de lo que **no** se implementa está en `docs/CONTEXTO.md` sección 6 y
  en `docs/ROADMAP_PRODUCTO.md`. Los mockups de `concpeto/` son referencia
  visual, no una especificación.

### Bloqueos

**Ninguno.** La 1.11 ya no está bloqueada: con la 1.12 y la 1.13 mergeadas, el
procedimiento de arranque está cerrado y los tres pueden correrla.

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
