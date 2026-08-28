# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-08-28
**Entrega:** Juan Pablo Malizani
**Rama:** `main`
**Commit:** de `5e9bdfc` al que trae este traspaso

### Qué se hizo

**La fase 0 está casi cerrada, pero no del todo.** Las tareas 0.01 a 0.08 quedaron
en `[x]`. La **0.09 sigue en `[ ]`**: la corrieron Juan Pablo y Juan José, falta
Mauricio.

- **Tareas 0.01, 0.02, 0.04, 0.05 y 0.06.** Pasaron a `[x]` en la tabla de tareas
  de `docs/ROADMAP.md`. Ya estaban marcadas para los tres en la tabla de
  verificación por integrante de las tareas 0.01 a 0.06, así que la regla de la
  fase —una tarea pasa a `[x]` cuando la columna está completa para los tres—
  exigía marcarlas. La 0.03 ya venía marcada desde el commit `e3b73d1`. Antes de
  esto esas dos tablas se contradecían: la de verificación por integrante estaba
  completa y la de tareas mostraba cinco casillas vacías.
- **La 0.09 tiene ahora su propia tabla de verificación por integrante**, con el
  mismo formato que la de las tareas 0.01 a 0.06 y la de la 1.11. Juan Pablo y
  Juan José tienen su casilla marcada; la de Mauricio está vacía.

**Sobre la marcha y vuelta atrás de la 0.09.** En un primer momento la 0.09 se
marcó como hecha en este mismo bloque de trabajo, y se revirtió a `[ ]` antes de
cerrarlo. El motivo está en la sección siguiente. **No es un retroceso del
proyecto**: no se deshizo trabajo de nadie, se corrigió una afirmación del
roadmap que no era cierta.

No se tocó ningún archivo fuera de `docs/ROADMAP.md` y este. El repositorio sigue
teniendo solo documentación y configuración de git.

### Decisiones tomadas sobre la marcha

**La 0.09 se trata igual que la 1.11: con tabla de verificación por integrante.**

Las dos son pruebas de humo que el roadmap encarga a los tres, en cada máquina, y
hasta ahora estaban tratadas distinto. La 1.11 tenía su tabla; la 0.09 no, así que
su única casilla era la de la tabla de tareas, que es de equipo y no distingue
"la corrieron dos de tres". Eso permitió marcarla como hecha con la verificación
de dos personas.

Es exactamente el problema que la tabla por integrante existe para evitar, y que
el roadmap ya había resuelto dos veces: para las tareas 0.01 a 0.06 y para la
1.11. Faltaba aplicarlo acá. Con la tabla nueva, la 0.09 solo puede pasar a `[x]`
cuando las tres filas estén marcadas.

**Qué lo destapó.** Al revisar quién había verificado qué, la última contribución
de Mauricio al repositorio resultó ser anterior a que la fase 0 estuviera
completa: sus tres commits (`5519e73`, `b653a01` y `9f99e92`) son del 27 de
agosto y marcan sus casillas de la 0.01 a la 0.06. Ninguno corresponde a la 0.09,
que recién fue corrible cuando se completó la 0.05 de Juan José. Marcarla como
hecha afirmaba algo que no había pasado, y **un roadmap desactualizado es peor
que no tener ninguno, porque miente** —sección 5 de `docs/CONVENCIONES.md`—.

Ninguna de estas es estructural en el sentido de arquitectura, así que
`docs/decisiones/` sigue vacía.

### Qué quedó sin hacer

**La 0.09 en la máquina de Mauricio.** Es lo único que falta de la fase 0, y es el
bloqueo del proyecto: la 1.01 depende de la 0.09.

**No hay una sola línea de código todavía.** No existen `package.json`,
`docker-compose.yml` ni `prisma/schema.prisma`. Todo eso lo crea la fase 1.

La decisión **D2** —si se adopta ONCHigh como fuente de interacciones— sigue
abierta. No frena nada: la tarea 5.03, carga manual de al menos 15 pares, permite
avanzar con todo el módulo clínico.

La tabla "En curso ahora" está vacía: **nadie tiene ninguna tarea reservada.**

### Cómo verificarlo

La 0.09 la corre cada uno en su máquina. Estos son los seis puntos, y son los que
Mauricio tiene pendientes:

1. `git checkout main && git pull` trae los cambios sin conflictos, y
   `git status` deja el árbol limpio y sincronizado con `origin/main`.
2. La documentación está en su lugar: `CLAUDE.md` en la raíz, y `CONTEXTO.md`,
   `ROADMAP.md`, `ROADMAP_PRODUCTO.md`, `CONVENCIONES.md`, `REGLAS_IA.md`,
   `TRASPASO.md` y `MD_VERIFARM.drawio` dentro de `docs/`, más `docs/decisiones/`
   con su `.gitkeep`.
3. `git config user.name` y `git config user.email` devuelven la identidad
   correcta, y el email coincide con el de la cuenta de GitHub.
4. `git log --format=full` filtrado por `Co-Authored-By: Claude`, `Generated with`
   y `noreply@anthropic` **no devuelve nada**.
5. El asistente lee `CLAUDE.md` solo al abrir la carpeta, sin que haya que
   pedírselo.
6. Las tres filas de la tabla de verificación por integrante de las tareas 0.01 a
   0.06 están completas, y la tabla "En curso ahora" está vacía.

**Los puntos 3, 4 y 5 son por máquina**: valen donde se corren y no se pueden dar
por buenos desde otra. Por eso la 0.09 necesita a los tres.

En las máquinas de Juan Pablo y de Juan José los seis puntos dieron bien. En la de
Juan Pablo se amplió además el filtro del punto 4 a Antigravity, Gemini y
Copilot: los únicos aciertos son texto del cuerpo de commits de documentación que
describen la regla, no trailers de coautoría. Los diecisiete commits del
repositorio tienen a una persona como autor; el único `Co-authored-by` es el de
`75cbc8c`, con Mauricio y Juan José.

**Cuando Mauricio termine:** marca su casilla en la tabla de verificación por
integrante de la 0.09 **y** pasa la 0.09 a `[x]` en la tabla de tareas, en el
mismo commit. Las dos tablas se actualizan juntas.

### Qué sigue

**Primero, la 0.09 en la máquina de Mauricio.** Hasta que su casilla no esté
marcada, la fase 0 no está cerrada y **la 1.01 no se puede tomar**: depende de la
0.09, y el encabezado de la fase 0 dice que nadie escribe código hasta que las
tres máquinas la pasen.

**Después, la 1.01:** crear el proyecto Next.js con TypeScript, App Router,
Tailwind, ESLint y carpeta `src/`. Es la primera tarea de programación. Se toma
reservándola en "En curso ahora" y commiteando `chore: tomar la tarea 1.01` a
`main` **antes** de escribir nada.

**La 1.01 la toma una sola persona, y conviene que lleve la fase 1 entera de punta
a punta, hasta la 1.11.** Las tareas de la fase encadenan casi todas entre sí y
producen archivos de configuración que se pisan con facilidad; partirla entre
varios cuesta más de lo que ahorra. Si igual queda a medio camino, la continúa
otro sobre la misma rama, sin reescribirle la historia.

La **1.11** es la excepción: la corren los tres, cada uno en su máquina, y cierra
la fase. Hasta que sus tres filas no estén marcadas no se empieza la 2.01 ni, por
lo tanto, ninguna otra tarea de la fase 2.

**Mientras tanto, los otros dos no se quedan sin trabajo.** Nada de la fase 1 se
puede paralelizar, pero sí estas dos cosas, y ninguna espera a que se cierre la
fase 0:

- **El bloque DOC de `docs/ROADMAP_PRODUCTO.md`** (DOC.01 a DOC.06): corregir la
  referencia a la Drug Interaction API discontinuada, sacar el mapeo de ANMAT,
  corregir la validación cruzada contra prescripciones, resolver la contradicción
  de horas, actualizar el modelo de dominio en draw.io y recalcular los puntos de
  función. Es la corrección de las entregas de la facultad, **no depende de que
  haya código** y el propio roadmap del producto lo marca como trabajo paralelo.
  Ojo con una confusión fácil: la regla de "no implementar nada de
  `ROADMAP_PRODUCTO.md`" es sobre las funcionalidades P.1 a P.10. El bloque DOC
  no es funcionalidad, es documentación de las entregas, y sí se hace.
- **Resolver D2**, la decisión sobre ONCHigh como fuente de interacciones. Lo que
  hay que averiguar está descrito en P.6.01 a P.6.03 del roadmap del producto: el
  conjunto está en el repositorio público `dbmi-pitt/public-PDDI-analysis`, trae
  identificadores de DrugBank y no RxCUI, y no trae las descripciones de
  severidad. Decidirlo ahora evita que la 5.02 llegue bloqueada.

### Antes de arrancar, tener en cuenta

- **Las dos tablas de una tarea por máquina se actualizan juntas.** Al cerrar su
  fase 0, Juan José marcó su fila en la tabla de verificación por integrante de
  las tareas 0.01 a 0.06, pero dejó cinco de ellas —0.01, 0.02, 0.04, 0.05 y
  0.06— sin marcar en la tabla de tareas. Este bloque de trabajo lo corrigió. La
  tabla por integrante dice quién lo hizo en su máquina; la de tareas dice si la
  tarea está cerrada para el equipo. Marcar una sin la otra deja el roadmap
  contradiciéndose. Ahora hay tres tablas por integrante —la de las tareas 0.01 a
  0.06, la de la 0.09 y la de la 1.11— y las tres funcionan igual.
- **Una tarea que corren los tres no se marca con el reporte de dos.** Es lo que
  pasó con la 0.09 y hubo que revertirlo. Si falta una casilla, la tarea queda en
  `[ ]`, aunque en tu máquina haya pasado.
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
- **`core.autocrlf` está en `true`** en al menos una de las máquinas; es lo que
  deja el instalador de Git for Windows. Hoy el `eol=lf` de `.gitattributes` lo
  neutraliza y no molesta. Es el primer lugar donde mirar si en la **1.03**
  aparecen diffs de archivos enteros sin haberlos tocado, o si `prettier --check`
  falla por finales de línea.
- **No clonar desde adentro del repositorio, ni desde VS Code con la carpeta del
  proyecto ya abierta.** Las dos formas generan un clon anidado. Una vez clonado
  no se vuelve a clonar: para traer lo nuevo se hace `git pull`.
- La lista de lo que **no** se implementa está en `docs/CONTEXTO.md`, sección 6, y
  en `docs/ROADMAP_PRODUCTO.md`.

### Bloqueos

**La 0.09 en la máquina de Mauricio.** Es el único bloqueo, y frena la 1.01 y con
ella toda la fase 1. Son los seis puntos de "Cómo verificarlo", más marcar su
casilla.

**D2** sigue abierta pero no frena nada: la tarea 5.03 permite avanzar con todo
el módulo clínico sin esperarla.

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
