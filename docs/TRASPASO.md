# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-08-26
**Entrega:** — (traspaso inicial, todavía no hay trabajo previo)
**Rama:** `main`
**Commit:** —

### Qué se hizo

Se definió el proyecto completo antes de escribir código: alcance del prototipo,
modelo de datos derivado del modelo de dominio, stack, convenciones de trabajo y
reglas para asistentes de IA. Toda esa documentación está en `docs/`.

**No hay código todavía.** El repositorio contiene únicamente documentación.

### Decisiones tomadas sobre la marcha

Ninguna. Las decisiones tomadas están registradas en `docs/CONTEXTO.md`
(sección 3) y en las exclusiones de `docs/ROADMAP_PRODUCTO.md`.

### Qué quedó sin hacer

La fase 0 completa: instalaciones, repositorio y verificación de la
configuración de commits. **Es trabajo manual de las personas, no de la IA.**

- [ ] 0.01 a 0.04 — instalaciones en las tres máquinas
- [ ] 0.05 — repositorio en GitHub
- [ ] 0.06 — verificar que ningún commit lleva coautoría de IA
- [ ] 0.07 — `.gitignore`
- [ ] 0.08 — subir la documentación
- [ ] 0.09 — prueba de humo

### Cómo verificarlo

No hay nada que verificar todavía. La primera verificación real es la 0.06:
hacer un commit de prueba y confirmar con `git log --format=full` que no aparece
ningún trailer que mencione a Claude, Antigravity, Gemini o Copilot.

### Qué sigue

Terminada la fase 0, la primera tarea de programación es la **1.01**: crear el
proyecto Next.js con TypeScript, App Router, Tailwind, ESLint y carpeta `src/`.
La fase 1 completa la hace **una sola persona**; el resto parte de ahí.

### Antes de arrancar, tener en cuenta

- **Prisma queda clavado en `7.10.0`.** No instalar `prisma@latest`: hoy apunta a
  un release candidate.
- La fase 2 (modelo de datos) la hace una sola persona. Dos migraciones en
  paralelo rompen la base de todos.
- La lista de lo que **no** se implementa está en `docs/CONTEXTO.md`, sección 6.

### Bloqueos

**D2** — falta decidir si se adopta ONCHigh como fuente de interacciones. No
frena nada por ahora: la tarea 5.03 (carga manual de 15 pares) permite avanzar
con todo el módulo clínico.

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
