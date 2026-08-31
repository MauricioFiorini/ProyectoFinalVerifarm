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
**Rama:** `feat/1.12-script-de-setup`
**Commit:** `335526f`, más el que trae este traspaso

### Qué se hizo

**La tarea 1.12: `npm run setup`**, el comando que deja el entorno listo después
de `npm install`. El código está en `scripts/setup.mjs` y hace cuatro cosas, en
este orden:

1. Verifica que exista `.env`.
2. Verifica que `DATABASE_URL` **tenga valor**. No alcanza con que el archivo
   exista: `.env.example` trae la clave vacía y la URL que sirve está comentada,
   así que un `cp` sin editar deja el archivo creado y la variable sin valor.
3. Avisa —sin cortar— si la URL apunta a un puerto que no es el 5433.
4. Recién entonces corre `prisma generate`.

Si algo de los dos primeros pasos falla, corta con un mensaje que dice qué hacer
y sale con código 1, en vez de dejar salir el `PrismaConfigEnvError`. Los
mensajes se arman según el caso: al que ya copió el `.env` no se le repite que
lo copie.

**Por qué existe.** En un clon limpio hacen falta pasos que no hace ningún
comando y cuyos errores no apuntan a su causa. El peor: npm 11 bloquea por
defecto los scripts de instalación de las dependencias, así que el `postinstall`
de Prisma no corre, el cliente no se genera, y el síntoma aparece mucho después
como un error de TypeScript que no nombra ni a npm ni a Prisma.

**Lo que el script no hace, a propósito:** no crea el `.env` —un `cp` sin editar
generaría un archivo roto, y configurar la conexión es algo que cada uno tiene
que entender una vez— y no levanta Docker. Termina imprimiendo cuál es el paso
siguiente.

Antes de la 1.12 se probó la salida obvia, un `postinstall` en `package.json`, y
se descartó porque hace fallar el `npm install` entero cuando todavía no existe
el `.env`. Está escrito en
`docs/decisiones/0001-generacion-del-cliente-prisma.md`, que es la primera
entrada de esa carpeta.

La documentación quedó en cuatro lugares: `docs/CONVENCIONES.md` secciones 8
(estructura de carpetas), 11 (comandos) y 12 (checklist de antes de empezar), y
los "Pasos previos de la 1.11" de este roadmap. La trampa de la sección 14 ahora
apunta al comando nuevo.

### Decisiones tomadas sobre la marcha

**1. La tarea es la 1.12 pero va antes que la 1.11.** La alternativa era
renumerar la prueba de humo, y se descartó: "1.11" ya está en el historial de
git, en las convenciones y en su propia tabla de verificación por integrante.
Romper esas referencias por prolijidad visual no vale la pena. El orden real lo
manda la columna "Depende": la 1.11 depende de la 1.12. Hay una nota bajo la
tabla de la fase 1 explicándolo, para que nadie lo lea como un error de
numeración y lo "arregle".

**2. El script es `.mjs` y no `.ts`.** Corre con `node` directo, sin pasar por
el compilador, y tiene que andar igual en PowerShell y en Git Bash. Importa
`process` explícitamente desde `node:process` y no usa `console`, así que no
depende de variables globales: por eso **no hizo falta tocar
`eslint.config.mjs`**. ESLint lo revisa como a cualquier otro archivo, lo cual
se verificó metiéndole un error a propósito y confirmando que lo detecta.

**3. El puerto es un aviso y no un error.** Si alguien cambió el puerto en
`docker-compose.yml` porque tenía el 5433 ocupado, el script no lo tiene que
frenar.

### Qué quedó sin hacer

**Nada de la 1.12.** La tarea está completa.

De la fase 1 sigue pendiente solo la **1.11**, la prueba de humo del entorno,
que corren los tres. Su tabla de verificación por integrante sigue con las tres
filas vacías.

### Cómo verificarlo

En una máquina donde el proyecto nunca corrió, sobre esta rama:

```
cp .env.example .env      # y completar DATABASE_URL (puerto 5433)
npm install
npm run setup
docker compose up -d
npm run check
npm run dev
```

Verificado con **Node 24.20.0 y npm 11.19.0**, instalando desde cero. Los cinco
casos del script, corridos uno por uno:

| Caso | Resultado |
|---|---|
| Sin `.env` | Corta, código 1, dice qué hacer |
| `cp .env.example .env` sin editar | Corta, código 1 |
| Puerto 5432 en la URL | Avisa, sigue y genera |
| `.env` completo | Genera, código 0 |
| Correrlo dos veces seguidas | Idéntico, sin ensuciar nada |

La idempotencia se comprobó comparando el checksum de todo
`node_modules/.prisma/client` entre las dos corridas y el `git status` antes y
después: no escribe nada fuera de la salida de Prisma, que se sobrescribe sola.

**`npm run check` pasa con código 0**, incluido el archivo nuevo.

### Qué sigue

**La 1.11**, la prueba de humo del entorno, una vez que esta rama esté mergeada.
La corren **los tres**, cada uno en su máquina, sobre `main`, marcando su fila
en la tabla de verificación por integrante. Es la excepción al "una sola persona
a la vez" de la fase 1.

Con las tres filas marcadas, la 1.11 pasa a `[x]`, la fase 1 cierra y se puede
empezar la **2.01**, los enums del modelo de datos. La fase 2 **la hace una sola
persona**: dos migraciones en paralelo dejan la base de cada uno distinta.

Mientras tanto siguen disponibles, y no dependen de nada de esto: el bloque DOC
de `docs/ROADMAP_PRODUCTO.md` (DOC.01 a DOC.06), que es corrección de las
entregas de la facultad, y **resolver D2**.

### Antes de arrancar, tener en cuenta

- **El procedimiento en un clon limpio cambió.** Ahora es: `cp .env.example
  .env`, completar `DATABASE_URL`, `npm install` y `npm run setup`. Ya no hay que
  acordarse de `npx prisma generate`: lo corre el script, después de verificar el
  entorno.
- **Verificá tu versión de Node antes de todo lo demás.** Prisma 7 pide **20.19+,
  22.12+ o 24.0+**. Con una anterior, `npm install` corta en el `preinstall` de
  Prisma; ese error sí dice exactamente qué pasa, pero se evita mirando `node -v`
  primero. Si usás `fnm` o `nvm`, revisá cuál es tu versión **por defecto**, no
  solo la de la terminal que tenés abierta.
- **Los avisos de `npm warn install-scripts` durante `npm install` son
  esperables y no hay que tocarlos.** npm 11 bloquea por defecto los scripts de
  instalación de las dependencias y lista `prisma`, `@prisma/engines` y
  `unrs-resolver`. **No hace falta aprobarlos** con `npm install-scripts
  approve`: de eso se encarga `npm run setup`, y aprobarlos es una configuración
  de cada máquina que haría que los tres corran cosas distintas.
- **`npm run setup` también hace falta cada vez que cambie
  `prisma/schema.prisma`**, no solo en un clon nuevo: es lo que regenera el
  cliente. A partir de la fase 2 va a pasar seguido.
- **El puerto de PostgreSQL es el 5433, no el 5432.** El script avisa si tu URL
  apunta a otro. El porqué está en `docker-compose.yml`.
- **Docker Desktop tiene que estar abierto.** No arranca solo al iniciar sesión
  en Windows. Si no lo está, cualquier comando de docker falla con
  `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`.
- **`prisma generate` sugiere actualizar a `@latest`. No hacerlo.** Hoy `latest`
  es `8.0.0-rc.12`, un release candidate. Prisma queda clavado en `7.10.0`.
- **ESLint 9.39.5 avisa que la versión 9 ya no tiene soporte.** Es la que declara
  `eslint-config-next@16.3.3`; subir a la 10 por cuenta propia puede romper la
  configuración.
- **En Tailwind 4 la paleta se toca en `src/app/globals.css`, no en un
  `tailwind.config`**, que no existe. Los tokens están en el bloque `@theme` y de
  cada uno salen las utilidades. Tailwind descarta los tokens que nadie usa, y
  una clase que apunta a un token borrado no da error: simplemente no genera
  nada.
- **La lógica de negocio va en `src/services/`**, nunca en componentes ni en
  route handlers, y son Route Handlers, no Server Actions.
- **Preguntar antes de tocar `prisma/schema.prisma`.** A partir de la fase 2 cada
  cambio genera migraciones.
- La lista de lo que **no** se implementa está en `docs/CONTEXTO.md` sección 6 y
  en `docs/ROADMAP_PRODUCTO.md`. Los mockups de `concpeto/` muestran varias de
  esas cosas: son referencia visual, no una especificación.

### Bloqueos

**Ninguno.** La 1.11 no está bloqueada: solo hace falta mergear esta rama y que
los tres la corran.

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
