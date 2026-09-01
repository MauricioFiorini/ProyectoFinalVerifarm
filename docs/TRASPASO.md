# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-09-01
**Entrega:** Juan José
**Rama:** `feat/2.05-interaccion`

### Qué se hizo

**La tarea 2.05: Modelo `Interaccion`.**
Se agregó al archivo `prisma/schema.prisma` el modelo que hace las veces de base de conocimiento (diccionario de interacciones) para el cruce de medicamentos.

**Detalles de la implementación:**
- Guarda los `RxCUI` de las dos drogas que interactúan (`rxcui1` y `rxcui2`). Se decidió guardar directamente el código RxCUI y no relacionarlo al modelo `Medicamento` de forma dura en la base de datos, porque esta tabla actúa como un diccionario universal provisto por ONCHigh, que puede contener interacciones entre drogas que ni siquiera tenemos en nuestro catálogo local.
- Se agregó el campo `severidad` con el enum `Severidad`, y un campo `descripcion` para detallar la advertencia clínica.
- Se incluyó el campo `fuente` (ej. "ONCHigh", "Manual").
- Se añadió un índice único compuesto `@@unique([rxcui1, rxcui2])` para evitar registrar la misma interacción dos veces. Por código habrá que asegurar ordenar alfanuméricamente los RxCUI antes de insertarlos.

La tarea fue finalizada, marcada con `[x]` en el `ROADMAP.md` y eliminada de la tabla "En curso ahora".
