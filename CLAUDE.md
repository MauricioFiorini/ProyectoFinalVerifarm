# Verifarm

Sistema de gestión farmacéutica para la Colonia Psiquiátrica "Dr. Abelardo
Irigoyen Freyre". Dos módulos: trazabilidad de stock por lote y soporte a la
decisión clínica por interacciones medicamentosas.

Proyecto final de facultad. **Caso de estudio con datos sintéticos** — nunca
datos reales de pacientes.

**Stack:** Next.js (App Router) · TypeScript estricto · PostgreSQL en Docker ·
Prisma 7.10.0 · Tailwind. Sin bibliotecas de componentes.

**Estado:** en construcción del prototipo. La primera tarea de programación es la
**1.01** del roadmap. Este archivo lo leen tanto Claude Code como Antigravity.

---

## Antes de escribir código

Leé estos cuatro archivos, en este orden:

1. **`docs/CONTEXTO.md`** — qué es el proyecto y por qué está diseñado así.
2. **`docs/ROADMAP.md`** — el alcance vigente y el estado de cada tarea.
3. **`docs/CONVENCIONES.md`** — invariantes y forma de trabajo.
4. **`docs/REGLAS_IA.md`** — reglas obligatorias para asistentes de IA.

Si venís a retomar el trabajo de otra persona, leé antes que nada
**`docs/TRASPASO.md`**: dice cómo quedó la última tarea y por dónde seguir.

---

## Las seis reglas que más se rompen

1. **Ningún commit menciona a una IA.** Ni como autor, ni como coautor, ni en el
   mensaje. El autor es la persona que commitea.
2. **Una tarea del roadmap por vez.** No adelantes trabajo, no resuelvas "de
   paso" algo relacionado, no refactorices lo que no es parte de la tarea.
3. **No implementes nada de `docs/ROADMAP_PRODUCTO.md`.** Si algo parece faltar,
   es intencional: está afuera por decisión y con justificación escrita.
4. **Los saldos de stock no se persisten, se calculan.** Cantidad ingresada menos
   egresos. No crees columna de saldo ni la caches.
5. **La dispensación es FEFO**, no FIFO: sale primero el lote que vence antes.
6. **No inventes.** Ni interacciones, ni RxCUI, ni endpoints, ni versiones de
   bibliotecas, ni fuentes. Si no lo sabés, decilo y dejalo pendiente.

---

## Orientación en el repo

| Ruta | Qué contiene |
|---|---|
| `docs/CONTEXTO.md` | Qué es el proyecto y por qué es así. |
| `docs/ROADMAP.md` | **Alcance vigente.** Qué falta, qué está hecho, quién está en cada cosa. |
| `docs/ROADMAP_PRODUCTO.md` | Lo que quedó fuera del prototipo. **No se implementa.** |
| `docs/TRASPASO.md` | Cómo quedó la última tarea y por dónde seguir. |
| `docs/CONVENCIONES.md` | Invariantes, ramas, commits, comandos, definición de "hecho". |
| `docs/REGLAS_IA.md` | Reglas obligatorias para asistentes de IA. |
| `docs/decisiones/` | Decisiones de arquitectura y su porqué. Append-only. |
| `prisma/schema.prisma` | Modelo de datos, comentado. **Preguntá antes de tocarlo.** |

Las tareas tienen identificadores tipo `4.07`. Las ramas y los commits los llevan
(`feat/4.07-...`, `feat(4.07): ...`). Si el usuario menciona un número así, se
refiere a una tarea del roadmap.

---

## Cómo trabajar acá

- **Reserva de tareas, antes que cualquier otra cosa.** Si el usuario dice que
  empieza una tarea, anotala en la tabla "En curso ahora" de `docs/ROADMAP.md`,
  marcala `[~]` y commiteá eso solo a `main`: `chore: tomar la tarea X.YY`. Si
  dice que la deja, recordale pushear la rama aunque esté a medio camino, llená
  "Dónde quedó" con qué está hecho y cuál es el paso siguiente, pasala a `[!]`,
  actualizá estado y fecha, y commiteá `chore: pausar la tarea X.YY`. **Ese
  commit va primero, antes de escribir código.** Ninguna tarea tiene dueño fijo:
  una en pausa la puede continuar cualquiera, sobre su misma rama y sin
  reescribirle la historia. El procedimiento completo está en "Reserva de tareas"
  del roadmap.
- **Trabajo por etapas.** Para cualquier tarea no trivial: mostrá el plan, esperá
  confirmación, ejecutá una etapa por turno, explicá qué hiciste, esperá el OK.
- **La lógica de negocio va en `src/services/`**, nunca en componentes ni en route
  handlers.
- **Route Handlers, no Server Actions.**
- **Sin `any`.** Sin dependencias nuevas sin preguntar.
- **Preguntá antes de modificar `prisma/schema.prisma`.** Dos migraciones en
  paralelo rompen la base de todo el equipo.
- Al terminar: `npm run check`, actualizar `docs/ROADMAP.md` y reescribir
  `docs/TRASPASO.md`, todo en el mismo commit.

**Ante la duda, preguntá.** Cuesta un turno; desandar trabajo mal orientado cuesta
una tarde.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
