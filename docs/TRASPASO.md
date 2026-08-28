# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-08-28
**Entrega:** Mauricio Mateo Fiorini
**Rama:** `main`
**Commit:** de `077a114` al que trae este traspaso

### Qué se hizo

**La fase 0 está cerrada.** Se completó el entorno en la máquina de Mauricio, que
era la única que faltaba, y con eso la **0.09 pasó a `[x]`**. Las nueve tareas de
la fase están terminadas y la **1.01 queda desbloqueada**.

Lo que se resolvió en esa máquina, tarea por tarea:

- **0.01** — Node.js ya estaba: `v24.20.0` con npm `11.19.0`.
- **0.02** — Git `2.55.0.windows.3` ya estaba. Se cambió `user.email` **solo en
  este repositorio**, del noreply de GitHub al `mauriciofiorini911@gmail.com` que
  figura en `docs/CONVENCIONES.md`, para que su email de autor coincida con el
  que usan los otros dos al ponerlo como coautor. El `user.email` global de esa
  máquina quedó con el noreply, para no afectar sus otros proyectos.
- **0.03** — Docker Desktop `4.88.1`, con CLI `Docker 29.7.2`.
  `docker run hello-world` terminó con código 0.
- **0.04** — Faltaban las cuatro extensiones y se instalaron: ESLint `3.0.34`,
  Prettier `12.4.0`, Prisma `31.11.0` y Tailwind CSS IntelliSense `0.16.0`.
- **0.05** — Ya estaba: el clon apunta a
  `https://github.com/MauricioFiorini/ProyectoFinalVerifarm.git` y `main` sigue a
  `origin/main`.
- **0.06** — `.claude/settings.json` ya venía del repositorio con
  `includeCoAuthoredBy: false` y `attribution` en blanco. Lo que faltaba era la
  verificación práctica: los tres commits de este bloque (`5519e73`, `b653a01` y
  `9f99e92`) se controlaron con `git log --format=full` y no tienen ningún
  trailer de coautoría de IA. Esa máquina usa únicamente Claude Code, así que no
  hay ajuste de Antigravity que verificar aparte.
- **0.09** — Prueba de humo corrida y pasada. El detalle está en "Cómo
  verificarlo".

En `docs/ROADMAP.md` se marcó la casilla de Mauricio en la tabla de verificación
por integrante de la 0.09 y, al quedar las tres filas completas, la tarea 0.09
pasó a `[x]` en la tabla de tareas de la fase.

### Decisiones tomadas sobre la marcha

- **El `user.email` se cambió local al repositorio, no global.** La sección 1 de
  `docs/CONVENCIONES.md` dice "configuración local, una sola vez por máquina", lo
  que admite las dos lecturas. Se eligió la local para no tocar la identidad de
  git de los otros proyectos de esa máquina. Consecuencia: si esa persona clona
  el repositorio en otra carpeta, tiene que volver a correr
  `git config user.email`.
- **La 0.03 no se marcó cuando Docker quedó instalado, sino cuando el motor
  levantó.** Entre una cosa y la otra hubo dos verificaciones fallidas: el
  instalador había terminado y la máquina se había reiniciado, pero Docker
  Desktop nunca se había abierto, así que no existía la distro WSL del motor y
  `docker run hello-world` fallaba al conectarse al named pipe
  `dockerDesktopLinuxEngine`. La tarea dice "verificar con
  `docker run hello-world`", y eso es lo que se esperó.
- **Las casillas se marcaron en tres commits separados**, a medida que cada
  verificación pasaba, en vez de uno solo al final. Es lo que permitió dejar la
  0.03 sin marcar mientras el motor no arrancaba, sin frenar el resto.

Ninguna es una decisión de arquitectura, así que `docs/decisiones/` sigue vacía.

### Qué quedó sin hacer

**Nada de la fase 0.** Las tareas 0.01 a 0.09 están en `[x]` y las dos tablas de
verificación por integrante de la fase —la de las tareas 0.01 a 0.06 y la de la
0.09— están completas para los tres.

La tabla de verificación por integrante de la **1.11** sigue con las tres filas
vacías, como corresponde: esa tarea cierra la fase 1 y todavía no empezó.

### Cómo verificarlo

La prueba de humo de la 0.09 en la máquina de Mauricio dio esto:

1. **Documentación en su lugar** — `CLAUDE.md` en la raíz; `CONTEXTO.md`,
   `ROADMAP.md`, `ROADMAP_PRODUCTO.md`, `CONVENCIONES.md`, `REGLAS_IA.md`,
   `TRASPASO.md` y `MD_VERIFARM.drawio` en `docs/`; y `docs/decisiones/` con su
   `.gitkeep`.
2. **El asistente lee `CLAUDE.md` solo** — lo cargó al abrir la carpeta, sin que
   se lo pidieran.
3. **Sin clon anidado** — cero gitlinks en el índice: buscar entradas de modo
   `160000` en la salida de `git ls-files -s` no devuelve ninguna.
4. **Historial sin IA** — `git log --format=full` sobre el historial completo no
   arroja ningún `Co-Authored-By` de Claude, Antigravity, Gemini ni Copilot, ni
   ninguna frase del tipo "Generated with".
5. **Árbol limpio y sincronizado** — `git status -sb` devuelve
   `## main...origin/main`, sin cambios pendientes ni commits sin pushear.
6. **Docker** — `docker run hello-world` imprime `Hello from Docker!` y sale con
   código 0.

Para repetirlo en cualquier máquina alcanza con esos seis puntos.

### Qué sigue

**La 1.01:** crear el proyecto Next.js con TypeScript, App Router, Tailwind,
ESLint y carpeta `src/`. Es la primera tarea de programación del proyecto y ya no
tiene nada que la bloquee.

Se toma reservándola en la tabla "En curso ahora" de `docs/ROADMAP.md` y
commiteando `chore: tomar la tarea 1.01` directo a `main`, **pusheado antes** de
escribir una línea.

**La toma una sola persona, y conviene que lleve la fase 1 de punta a punta hasta
la 1.10.** Las tareas de la fase encadenan casi todas entre sí y producen
archivos de configuración que se pisan con facilidad. Si queda a medio camino, la
continúa otro sobre la misma rama, sin reescribirle la historia. La **1.11** es
la excepción: la corren los tres, cada uno en su máquina, y recién con sus tres
filas marcadas se puede empezar la 2.01.

**Los otros dos, mientras tanto:** el bloque DOC de `docs/ROADMAP_PRODUCTO.md`
(DOC.01 a DOC.06), que es corrección de las entregas de la facultad y no depende
de que haya código, y **resolver D2**, la decisión sobre ONCHigh como fuente de
interacciones. Ojo con la confusión fácil: la regla de "no implementar nada de
`ROADMAP_PRODUCTO.md`" es sobre las funcionalidades P.1 a P.10; el bloque DOC no
es funcionalidad y sí se hace.

### Antes de arrancar, tener en cuenta

- **Docker Desktop se instaló por usuario, sin permisos de administrador**, en
  `AppData\Local\Programs\DockerDesktop` en vez de `C:\Program Files`.
  Consecuencia concreta: el servicio privilegiado `com.docker.service` **no quedó
  registrado** en esa máquina. Con el backend WSL2 funciona igual —la 0.03
  pasó—, pero es el primer lugar donde mirar si en la **1.04** el
  `docker compose up -d` de PostgreSQL se comporta distinto ahí que en las otras
  dos máquinas.
- **Docker Desktop tiene que estar abierto y con el motor andando** antes de
  cualquier comando de docker. No alcanza con que esté instalado, ni con
  reiniciar la máquina: si nunca se abrió la aplicación, el motor no existe.
- **Después de instalar Docker hay que reabrir las terminales.** El instalador
  agrega su `bin` al PATH de usuario, pero las terminales ya abiertas siguen con
  el PATH viejo y `docker` figura como comando inexistente.
- **`core.autocrlf` está en `true`** en la máquina de Mauricio; es lo que deja el
  instalador de Git for Windows. Hoy el `eol=lf` de `.gitattributes` lo
  neutraliza: los diffs de este bloque salieron de una línea, sin archivos
  enteros marcados como modificados. Es el primer lugar donde mirar si en la
  **1.03** `prettier --check` falla por finales de línea.
- **El email de autor de Mauricio en este repositorio es
  `mauriciofiorini911@gmail.com`**, distinto del global de su máquina. Los tres
  commits de este bloque se pushearon sin problemas, así que la protección de
  GitHub que rechaza los push que exponen el email privado no está activa en esa
  cuenta.
- **Leer primero `CLAUDE.md`**, y después los cuatro documentos de `docs/` en el
  orden que indica: `CONTEXTO.md`, `ROADMAP.md`, `CONVENCIONES.md` y
  `REGLAS_IA.md`.
- **La reserva de tareas se commitea y se pushea a `main` antes de empezar a
  trabajar.** Una reserva sin pushear no reserva nada.
- **Prisma queda clavado en `7.10.0`.** No instalar `prisma@latest`. La versión
  hay que verificarla contra npm cuando se llegue a la 1.06, no darla por cierta.
- **Los comandos de la 1.11 no se probaron todavía**, porque el proyecto no
  existe. Si `npx prisma db execute --stdin` pide el esquema explícito en la
  versión instalada, la propia tarea dice qué agregar.
- **Las dos tablas de una tarea por máquina se actualizan juntas.** La tabla por
  integrante dice quién lo hizo en su máquina; la de tareas dice si la tarea está
  cerrada para el equipo. Marcar una sin la otra deja el roadmap
  contradiciéndose. Hay tres tablas por integrante —la de las tareas 0.01 a 0.06,
  la de la 0.09 y la de la 1.11— y las tres funcionan igual.
- **Una tarea que corren los tres no se marca con el reporte de dos.** Ya pasó
  con la 0.09 y hubo que revertirlo.
- **No clonar desde adentro del repositorio, ni desde VS Code con la carpeta del
  proyecto ya abierta.** Las dos formas generan un clon anidado. Una vez clonado
  no se vuelve a clonar: para traer lo nuevo se hace `git pull`.
- La lista de lo que **no** se implementa está en `docs/CONTEXTO.md`, sección 6, y
  en `docs/ROADMAP_PRODUCTO.md`.

### Bloqueos

**Ninguno para la 1.01.** El bloqueo anterior —la 0.09 en la máquina de
Mauricio— quedó resuelto en este bloque de trabajo.

**D2** sigue abierta pero no frena nada: la tarea 5.03, carga manual de al menos
15 pares de psicofármacos en el seed, permite avanzar con todo el módulo clínico
sin esperarla.

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
