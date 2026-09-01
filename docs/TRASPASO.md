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
**Rama:** `feat/2.01-enums`

### Qué se hizo

**La tarea 2.01: Enums base del modelo de datos.**
Se agregaron al archivo `prisma/schema.prisma` los enums que requiere la fase 2 del roadmap:
- `TipoUsuario` (`ADMINISTRADOR`, `FARMACEUTICO`, `MEDICO`, `ENFERMERO`)
- `TipoMovimiento` (`INGRESO`, `EGRESO`)
- `UnidadMedida` (`MG`, `ML`, `G`, `UI`, `COMPRIMIDO`, `AMPOLLA`, `GOTA`)
- `Severidad` (`ALTA`, `MEDIA`, `BAJA`)

La tarea fue finalizada, marcada con `[x]` en el `ROADMAP.md` y eliminada de la tabla "En curso ahora". El código fue formateado correctamente usando `npx prisma format`.
