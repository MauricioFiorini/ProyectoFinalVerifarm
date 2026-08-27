# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-08-27
**Entrega:** Juan Pablo Malizani (persona A)
**Rama:** `main`
**Commit:** de `75cbc8c` a `c0c5214`, más el que trae este traspaso

### Qué se hizo

Se armó el repositorio desde cero y se dejó la documentación en su lugar
definitivo. El repositorio vigente es `MauricioFiorini/ProyectoFinalVerifarm`;
el anterior (`MauricioFiorini/ProyectoFinal`) quedó descartado por decisión de
equipo y no se migró nada de ahí, ni el esquema ni el backlog ni las decisiones.
Eso está escrito en la sección 4 de `docs/CONTEXTO.md`.

Concretamente:

- `CLAUDE.md` en la raíz, y `CONTEXTO.md`, `ROADMAP.md`, `ROADMAP_PRODUCTO.md`,
  `CONVENCIONES.md`, `REGLAS_IA.md`, `TRASPASO.md` y el modelo de dominio
  `MD_VERIFARM.drawio` dentro de `docs/`, más `docs/decisiones/` vacía con un
  `.gitkeep`. Es la **tarea 0.08**, marcada como hecha.
- `.gitignore` para Node, Next.js, `.env`, `node_modules` y `.next`. Es la
  **tarea 0.07**, marcada como hecha.
- `.gitattributes` pasó de `* text=auto` a `* text=auto eol=lf`, para que las
  tres máquinas trabajen con finales de línea LF sin depender del `core.autocrlf`
  de cada una. Sin esto, `prettier --check` en `npm run check` iba a fallar en
  Windows cuando llegue la tarea 1.03.
- `.claude/settings.json` con la configuración de atribución de commits, que
  sostiene la regla de autoría. Está versionado, así que aplica a los tres.
- `docs/ROADMAP.md` incorporó, además del estado: el estado `[!]` EN PAUSA, la
  tabla "En curso ahora" con columnas de estado y fecha, la sección **"Reserva de
  tareas"** y la **tabla de verificación por integrante** de la fase 0.
- `docs/CONVENCIONES.md` y `docs/REGLAS_IA.md` incorporaron el mecanismo de
  reserva; `CONVENCIONES.md` sumó cuatro trampas conocidas nuevas.

Dos correcciones de contenido pedidas por el equipo: la tarea **2.01** deja de
crear `NivelCriticidad` y queda `Severidad` como única escala de gravedad, que
vive en `Interaccion` y la observación hereda; y la **5.18** habla de severidad,
no de criticidad.

### Decisiones tomadas sobre la marcha

- **La verificación de la 0.06 es por máquina y por herramienta.** Desactivar el
  coautor automático de IA no es un ajuste único del repositorio: cada integrante
  la verifica en su máquina, y quien use Antigravity tiene que hacerlo además con
  el ajuste propio de esa herramienta, que es aparte de `.claude/settings.json`.
- **Las tareas por máquina solo pasan a `[x]` cuando las hicieron los tres.** La
  columna Estado no puede expresar "hecha en una de tres", así que el detalle
  individual vive en la tabla "Verificación por integrante" del encabezado de la
  fase 0. Mientras haya una casilla vacía, la tarea queda en `[ ]`.
- **Reserva de tareas.** Se agregó un mecanismo para que dos personas no agarren
  lo mismo: se anota la tarea en "En curso ahora" y se commitea a `main` con
  `chore: tomar la tarea X.YY` **antes** de empezar a trabajar. El procedimiento
  completo está en la sección "Reserva de tareas" de `docs/ROADMAP.md`, que es el
  único lugar donde se explica.

Ninguna de estas es estructural en el sentido de arquitectura, así que
`docs/decisiones/` sigue vacía.

### Qué quedó sin hacer

La fase 0 de Mauricio y Juan José:

- [ ] 0.01 a 0.04 — instalaciones en sus máquinas
- [ ] 0.05 — confirmar que tienen acceso al repositorio y que clonaron
- [ ] 0.06 — su commit de prueba, y el ajuste propio de Antigravity para quien la
      use
- [ ] 0.09 — prueba de humo, que necesita a los tres

En la tabla de verificación por integrante, la fila de Juan Pablo tiene marcadas
la 0.01 a la 0.04 y la 0.06; las filas de Mauricio y Juan José están vacías.

Las tareas 0.07 y 0.08 están completas: se resuelven una sola vez en el
repositorio, no por máquina.

### Cómo verificarlo

Cada uno, en su máquina:

1. Clonar el repositorio **desde la carpeta que lo va a contener**, nunca desde
   adentro de otro repositorio.
2. Verificar que la documentación esté en su lugar: `CLAUDE.md` en la raíz y los
   seis documentos más el `.drawio` en `docs/`.
3. Abrir la carpeta con el asistente y confirmar que **lee `CLAUDE.md` solo**,
   sin que haya que pedírselo.
4. Hacer un commit de prueba y correr `git log --format=full`. **No tiene que
   aparecer ningún trailer que mencione a Claude, Antigravity, Gemini o
   Copilot.** Ese es el control de la 0.06.
5. Marcar la fila propia en la tabla de verificación por integrante.

En la máquina de Juan Pablo los pasos 3 y 4 ya se verificaron con Claude Code:
los cuatro commits del repositorio tienen a `JuanPabloMalizani` como autor y
ninguna mención a una IA. Los únicos coautores son Mauricio y Juan José, en el
commit de la documentación.

### Qué sigue

Cada uno completa su fase 0 y marca su fila en la tabla de verificación por
integrante. Cuando las tres filas estén completas, se marcan la 0.01 a la 0.06 y
se hace la **0.09**, la prueba de humo. Después de eso, la **1.01**: crear el
proyecto Next.js con TypeScript, App Router, Tailwind, ESLint y carpeta `src/`.
La fase 1 la hace **una sola persona** —Juan Pablo, como persona A— y el resto
parte de ahí.

### Antes de arrancar, tener en cuenta

- **Leer primero `CLAUDE.md`**, y después los cuatro documentos de `docs/` en el
  orden que indica: `CONTEXTO.md`, `ROADMAP.md`, `CONVENCIONES.md` y
  `REGLAS_IA.md`.
- **Verificar que el email de git coincida con el de la cuenta de GitHub**
  (`git config user.email`). Si no coinciden, el commit no se vincula al perfil.
- **La reserva de tareas se commitea a `main` antes de empezar a trabajar.** Una
  reserva sin pushear no reserva nada.
- **No clonar desde adentro del repositorio.** Genera un clon anidado que
  `git add -A` levanta como submódulo y que, si entra a `main`, rompe el `pull`
  del resto. Ya pasó una vez y se corrigió antes de pushear.
- **Prisma queda clavado en `7.10.0`.** No instalar `prisma@latest`. La versión
  hay que verificarla contra npm cuando se llegue a la 1.06, no darla por cierta.
- La lista de lo que **no** se implementa está en `docs/CONTEXTO.md`, sección 6,
  y en `docs/ROADMAP_PRODUCTO.md`.

### Bloqueos

**D2** — sigue abierta: falta decidir si se adopta ONCHigh como fuente de
interacciones. **No frena nada por ahora**: la tarea 5.03 (carga manual de al
menos 15 pares) permite avanzar con todo el módulo clínico.

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
