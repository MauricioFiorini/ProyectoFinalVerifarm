# VERIFARM — Convenciones de trabajo

Reglas obligatorias para los tres integrantes. Para asistentes de IA hay un
archivo aparte, más estricto: `docs/REGLAS_IA.md`.

Contexto del proyecto y por qué está diseñado así: `docs/CONTEXTO.md`.
Alcance vigente y estado de cada tarea: `docs/ROADMAP.md`.

Ubicación en el repo: `docs/CONVENCIONES.md`

---

## 1. Autoría de commits — REGLA INNEGOCIABLE

**Ninguna IA figura como autor ni como coautor de un commit.**

- Prohibido el trailer `Co-Authored-By: Claude <noreply@anthropic.com>` y
  cualquier variante que mencione a Claude, Antigravity, Gemini o Copilot.
- Prohibida cualquier firma o frase del tipo "Generated with ..." en el mensaje.
- El autor es siempre la persona que ejecuta el commit.
- Los otros integrantes se agregan como coautores **solo si participaron
  realmente** en ese trabajo.

```
Co-authored-by: Mauricio Mateo Fiorini <mauriciofiorini911@gmail.com>
Co-authored-by: Juan José Pastorino <juanjosepastorino@gmail.com>
Co-authored-by: Juan Pablo Malizani <juampi123.m@gmail.com>
```

> Verificar que estos emails sean los de las cuentas de GitHub. Si no coinciden,
> el commit no se vincula al perfil.

**Configuración local, una sola vez por máquina:**

```bash
git config user.name "Nombre Apellido"
git config user.email "email-de-github@ejemplo.com"
```

En Claude Code existe además una opción para desactivar el coautor que agrega por
defecto. Al momento de escribir esto la referencia es `includeCoAuthoredBy: false`
en `.claude/settings.json`, pero **verificarlo contra la documentación vigente**:
la clave puede haber cambiado. Si cambió, alcanza con la regla escrita.

---

## 2. Flujo de Git

`main` es la única rama permanente y **siempre tiene que andar**. Es el estado al
que se vuelve cuando algo se rompe y no se entiende por qué.

**Código → rama corta**, una tarea del roadmap por rama, nombrada con su número:

```
feat/4.07-motor-fefo
feat/5.06-motor-interacciones
fix/4.14-dispensa-multi-lote
```

**Documentación, ajustes chicos y correcciones de texto → directo a `main`.** No
vale la pena abrir una rama para eso.

**Alcanza con que otra persona le pase el ojo al diff** antes del merge. Sin
aprobación formal, sin protección de rama, sin proceso.

### Por qué no se trabaja todo directo en `main`

1. **Las IAs escriben mucho código rápido.** Cuando un asistente resuelve una
   tarea en 400 líneas, alguien tiene que leerlas antes de que entren.
2. **Una migración rota se contagia.** Si entra a `main` con un error, los otros
   hacen `git pull` y se les rompe la base local. Tres personas depurando en vez
   de una.

### El enemigo real es la rama larga

Una rama de tres semanas se separa tanto de `main` que mergearla cuesta un día.
**Si una rama pasa la semana, la tarea estaba mal planificada** y conviene
partirla.

### Nombres de rama

`feat/` funcionalidad · `fix/` corrección · `docs/` documentación · `chore/`
configuración o dependencias · `refactor/` reorganización sin cambio de
comportamiento.

### Mensajes de commit

El número de la tarea va en el asunto. Es lo que permite reconstruir después qué
se hizo para cada una:

```
feat(4.07): agregar motor FEFO como funcion pura
fix(4.08): repartir la dispensa entre varios lotes cuando el primero no alcanza
docs: actualizar roadmap tras cerrar la fase 3
```

Para buscar todo lo de una tarea: `git log --oneline --grep="4.07"`.

---

## 3. Las migraciones necesitan un dueño

Es el punto de conflicto más caro del proyecto.

Las migraciones de Prisma son carpetas con marca temporal. Si dos personas
generan migraciones en paralelo, el orden difiere entre máquinas y la base de
cada uno queda distinta: el tipo de problema que cuesta un día diagnosticar.

**Regla: una sola persona a la vez modifica `schema.prisma`.** Quien necesite un
cambio de esquema lo pide al equipo y lo anota en el roadmap. Antes de generar
una migración: `git pull` y verificar que no haya otra sin aplicar.

**Nunca editar una migración ya mergeada a `main`.** Si está mal, se corrige con
una migración nueva.

---

## 4. Reparto del trabajo

**Por módulo, no por tarea suelta.** Dos personas tocando los mismos archivos en
paralelo generan conflictos difíciles, y más todavía cuando el código lo escribió
una IA y es voluminoso. El reparto sugerido está en `docs/ROADMAP.md`.

**El reparto no asigna dueños.** Es una preferencia de continuidad: conviene que
quien arrancó un módulo lo siga, pero ninguna tarea es de nadie. Lo único que
reserva una tarea es la tabla "En curso ahora" de `docs/ROADMAP.md`, y solo
mientras alguien la está corriendo. Una tarea en pausa la puede continuar
cualquiera.

**Cambios chicos.** Si un cambio pasa las ~400 líneas, conviene partirlo: nadie
revisa 400 líneas con atención real, y código que nadie entendió es código que no
se puede defender en la mesa.

**No se empieza una tarea cuyas dependencias no estén terminadas.**

---

## 5. El estado del proyecto vive en `docs/ROADMAP.md`

**Al terminar una tarea se marca ahí, en el mismo commit que la completa.** Cómo
se toma, se pausa y se suelta una tarea está en la sección **"Reserva de tareas"**
de `docs/ROADMAP.md`, que es el único lugar donde se explica el procedimiento.

No es un registro de cambios duplicado — para eso está `git log`. Es el **estado
actual**: qué falta, qué está agarrado y por quién. Git no puede contarlo, y es
lo primero que necesita saber cualquiera que abra el repositorio, sea persona o
asistente.

**Un roadmap desactualizado es peor que no tener ninguno, porque miente.**

---

## 6. Alcance: no construir de más

El alcance vigente es `docs/ROADMAP.md`. **Lo que está en
`docs/ROADMAP_PRODUCTO.md` no se implementa en esta etapa**, aunque parezca una
mejora obvia o quede a mano.

Fuera del prototipo, por decisión: autenticación y roles, recetas y posología,
nombres comerciales y ANMAT, proveedores y órdenes de compra, destino del egreso,
análisis predictivo, auditoría, validación médica de la observación, pruebas
automatizadas, consulta a RxNorm en vivo.

**Cada ausencia es una decisión, no un olvido.** Si detectás algo fuera de alcance
que convendría hacer, anotalo en `ROADMAP_PRODUCTO.md`; no lo construyas.

---

## 7. Invariantes del dominio

Romper cualquiera de estos rompe el proyecto. El detalle y el porqué están en
`docs/CONTEXTO.md`.

**Los saldos de stock no se persisten, se calculan.** La cantidad disponible de
un lote es la cantidad ingresada menos los egresos. No crear columna de saldo, no
actualizarla, no cachearla.

**El historial de movimientos es inmutable.** No se edita ni se borra un
movimiento. En el prototipo, la interfaz no ofrece esas acciones.

**La dispensación es FEFO, no FIFO.** Sale primero el lote que vence antes.

**El paciente no tiene datos identificatorios.** Solo un seudónimo. Nunca nombre,
documento ni fecha de nacimiento, en ninguna tabla.

**Los datos son sintéticos.** Nunca datos que puedan parecer de pacientes reales.

**Una consulta de interacciones requiere al menos dos medicamentos.**

**El sistema asiste, no decide.** Ante una interacción se informa, no se bloquea.

---

## 8. Estructura de carpetas

```
verifarm/
  CLAUDE.md                puntero de arranque para el asistente de IA
  docs/
    CONTEXTO.md            qué es el proyecto y por qué es así
    ROADMAP.md             alcance vigente y estado
    ROADMAP_PRODUCTO.md    lo que quedó afuera. NO se implementa
    TRASPASO.md            cómo quedó la última tarea y por dónde seguir
    CONVENCIONES.md        este archivo
    REGLAS_IA.md           reglas para asistentes de IA
    decisiones/            decisiones de arquitectura, append-only
  prisma/
    schema.prisma          modelo de datos, comentado
    migrations/            versionadas, nunca se editan
    seed.ts                datos de prueba
  src/
    app/
      api/                 route handlers: validan entrada y delegan
      medicamentos/ stock/ pacientes/ consultas/
    components/ui/         Boton, Campo, Tabla, Modal. Solo esos cuatro
    lib/
      db.ts                cliente Prisma singleton
      redaccion/           composición del texto de la observación
    services/              lógica de negocio, sin conocimiento de HTTP
    types/
  docker-compose.yml       PostgreSQL local
  .env.example             variables sin valores reales
```

### Regla de capas

`app/api` valida la entrada y llama a `services`. **Toda regla de negocio vive en
`services`.** Si una pantalla necesita lógica, importa el servicio; no reescribe
la regla.

Las APIs externas viven aisladas en `lib/`. Si una cae o cambia, el resto del
sistema no se entera.

**Route Handlers, no Server Actions.**

---

## 9. Convenciones de código

- **TypeScript estricto. Sin `any`.** Si aparece un `any`, falta modelar algo.
- **Idioma:** dominio en castellano (`medicamento`, `movimientoStock`,
  `dispensar`); lo técnico en inglés donde ya lo está (`useState`,
  `handleSubmit`). No traducir la biblioteca.
- Componentes en `PascalCase.tsx`; el resto en `camelCase.ts`.
- **Tailwind puro.** Sin shadcn/ui, sin Recharts, sin bibliotecas de componentes.
- **No instalar dependencias nuevas sin acordarlo.** El stack está cerrado:
  Next.js, TypeScript, Prisma, Tailwind, Zod.
- **Toda operación que escribe varios registros va en una transacción.** Un egreso
  FEFO repartido entre tres lotes son tres inserciones: entran las tres o
  ninguna.
- Formatear con Prettier antes de commitear.

---

## 10. Variables de entorno

`.env` **nunca** se sube al repositorio. `.env.example` sí, con las claves
vacías. Si alguien agrega una variable, la agrega también al `.example` y lo
avisa al equipo.

---

## 11. Comandos

```bash
docker compose up -d       # levanta PostgreSQL
npm run dev                # servidor de desarrollo
npm run check              # tsc --noEmit + eslint + prettier --check
npx prisma migrate dev     # aplica migraciones
npx prisma db seed         # carga datos de prueba
npx prisma studio          # inspeccionar y corregir datos a mano
```

### Prisma queda clavado en 7.10.0

**No instalar `prisma@latest`.** Al 26/08/2026 el tag `latest` de npm apunta a
`8.0.0-rc.12`, que es un *release candidate*. La última estable es `7.10.0`.

```bash
npm install --save-dev prisma@7.10.0
npm install @prisma/client@7.10.0
```

Dos cambios de la versión 7 que conviene tener presentes, porque casi toda la
documentación que circula todavía describe la 6:

- La URL de conexión **no va en `schema.prisma`**: vive en `prisma.config.ts`.
- Prisma ya **no carga `.env` solo**. Hay que importar `dotenv/config`.

---

## 12. Antes de empezar a trabajar

Primero, dejar el entorno al día:

```bash
git checkout main && git pull    # imprescindible: la reserva de tareas vive en main
npm install                      # por si cambiaron dependencias
docker compose up -d
npx prisma migrate dev           # aplica migraciones nuevas
npm run dev                      # verificar que levanta sin errores
```

Después, **con `main` ya actualizado y antes de crear la rama**:

1. Leer la tabla **"En curso ahora"** de `docs/ROADMAP.md`. Si la tarea figura
   como `activa` o `en pausa`, es de otra persona: **no se agarra sin hablarlo**.
2. Verificar que las dependencias de la tarea estén en `[x]`.
3. **Reservarla**: anotarse en la tabla (tarea, nombre, rama, estado `activa`,
   fecha), marcarla `[~]`, commitear eso solo a `main` con
   `chore: tomar la tarea X.YY` y **pushear**. El procedimiento completo está en
   la sección "Reserva de tareas" del roadmap.
4. Revisar la sección 14, trampas conocidas, por si aplica alguna.

Recién entonces:

```bash
git checkout -b feat/X.YY-descripcion-corta
```

---

## 13. Definición de "hecho"

Una tarea está completa cuando:

- [ ] `npm run check` pasa sin errores.
- [ ] La funcionalidad se probó a mano contra la base local.
- [ ] Si es FEFO: se verificaron los casos borde del roadmap y quedó anotado en
      el PR. **El prototipo no lleva pruebas automatizadas**, así que esta
      verificación manual es la única red.
- [ ] `docs/ROADMAP.md` está actualizado en el mismo commit: casilla marcada y
      tabla "En curso ahora" limpia.
- [ ] `docs/TRASPASO.md` está reescrito siguiendo su plantilla.
- [ ] El mensaje de commit lleva el número de la tarea.
- [ ] El commit **no menciona ninguna IA**.
- [ ] Otra persona le pasó el ojo al diff.

---

## 14. Trampas conocidas

Lista viva. Se agrega, no se borra.

- Si `prisma migrate dev` pide resetear la base, es porque alguien editó una
  migración ya mergeada. **Avisar antes de resetear.**
- Si `npm install` trae Prisma 8, revisar que la versión esté fijada sin `^`.
- **El repositorio fuerza finales de línea LF** por `.gitattributes`
  (`* text=auto eol=lf`). Si aparecen diffs donde el archivo entero figura como
  modificado sin haberlo tocado, son finales de línea: revisar
  `git config core.autocrlf`. El instalador de Git for Windows lo deja en `true`,
  que convierte a CRLF al hacer checkout. Con `eol=lf` no debería pasar, pero si
  pasa, ese es el lugar donde mirar.
- **Push rechazado al reservar una tarea.** El commit de reserva va directo a
  `main` y la tabla "En curso ahora" la editan los tres, así que si dos personas
  reservan casi al mismo tiempo, el push del segundo se rechaza. **No se rompió
  nada:** `git pull`, resolver el conflicto de la tabla **dejando las dos filas**
  —cada uno reservó una tarea distinta— y pushear de nuevo.
- **`.claude/settings.json` está versionado y aplica a los tres.** Contiene la
  configuración de atribución que sostiene la regla de autoría. Si alguien tenía
  configuración local propia en ese archivo, la va a ver cambiar al hacer `pull`.
  Lo que sea preferencia personal va en la configuración de usuario, fuera del
  repositorio; en el archivo versionado va solo lo que tiene que valer para todos.
- **Nunca correr `git clone` desde adentro del repositorio.** Genera un clon
  anidado con su propio `.git` que `git add -A` levanta como submódulo
  (`create mode 160000`). Si eso entra a `main`, el resto se come una referencia
  rota al hacer `pull`. Clonar siempre desde la carpeta que contiene al
  repositorio, no desde el repositorio.
- **No clonar desde VS Code con la carpeta del proyecto ya abierta.** El diálogo
  "Clone Git Repository" pide una carpeta destino y por defecto propone la que
  está abierta, que es el repositorio mismo: el resultado es el clon anidado de
  la trampa anterior. **La carpeta que se elige es la que va a contener al
  repositorio, no el repositorio.** Y una vez clonado no se vuelve a clonar: para
  traer lo nuevo se hace `git pull`.
- **Nunca reescribir la historia de una rama que dejó otro.** Al retomar una
  tarea en pausa se sigue sobre su misma rama, y lo nuevo de `main` se trae con
  `merge`. Nada de `rebase`, `commit --amend` ni `push --force` sobre commits
  ajenos: quien la dejó todavía tiene esa rama en su máquina, y si le cambiás los
  hashes su `pull` deja de andar y el trabajo aparece duplicado.

---

## 15. Decisiones de arquitectura

Cuando el equipo toma una decisión que un recién llegado no podría deducir del
código, se escribe en `docs/decisiones/` como archivo numerado y corto: contexto,
decisión, consecuencias.

**Nunca se edita una decisión pasada.** Si cambia, se escribe una nueva que
reemplaza a la anterior. Es lo que evita que alguien —o una IA— vuelva a proponer
algo que ya se descartó.
