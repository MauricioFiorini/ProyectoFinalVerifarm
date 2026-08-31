# Verifarm — instrucciones para asistentes

**Las instrucciones del proyecto están en `CLAUDE.md`.** Este archivo no las
repite: existe para alojar el bloque que `next dev` regenera solo, que antes se
inyectaba en `CLAUDE.md`.

Si estás leyendo esto primero, o si es lo único que lee tu herramienta: **abrí
`CLAUDE.md` antes de escribir una línea de código.** Ahí está qué es el
proyecto, las reglas que más se rompen y la orientación en el repo.

Después de `CLAUDE.md`, en este orden:

1. `docs/CONTEXTO.md` — qué es el proyecto y por qué está diseñado así.
2. `docs/ROADMAP.md` — el alcance vigente y el estado de cada tarea.
3. `docs/CONVENCIONES.md` — invariantes y forma de trabajo.
4. `docs/REGLAS_IA.md` — reglas obligatorias para asistentes de IA.

Si venís a retomar el trabajo de otra persona, leé antes que nada
`docs/TRASPASO.md`: dice cómo quedó la última tarea y por dónde seguir.

**Una sola cosa no puede esperar a que abras esos archivos:** ninguna IA figura
como autor ni como coautor de un commit, ni se menciona en el mensaje. El autor
es la persona que commitea. Es la sección 1 de `docs/CONVENCIONES.md` y es
innegociable.

---

El bloque de abajo lo escribe y lo actualiza `next dev`, no una persona. **No
editarlo a mano**, se sobrescribe solo. Vive acá y no en `CLAUDE.md` a
propósito: el archivo de instrucciones del equipo tiene que contener solamente
lo que el equipo escribió y revisó.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
