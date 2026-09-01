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
**Rama:** `feat/2.06-transversales`

### Qué se hizo

**La tarea 2.06: Modelos transversales (`Usuario` y `RegistroAuditoria`).**
Se agregaron al archivo `prisma/schema.prisma` los dos últimos modelos de la base de datos. Se establecieron también las relaciones correspondientes hacia los modelos que requerían trazabilidad.

**Detalles de la implementación:**
- **`Usuario`**:
  - Cuenta con los datos básicos (`email`, `nombre`, `tipo` del enum `TipoUsuario`) y un flag `activo` para *soft delete*.
  - Se vinculó `usuarioId` al modelo `MovimientoStock`, que había quedado pendiente de la tarea 2.03.
  - Se vinculó de forma opcional (`usuarioId?`) al modelo `ConsultaInteraccion`, para registrar quién hizo la consulta si corresponde.
- **`RegistroAuditoria`**:
  - Se creó para satisfacer el diagrama de dominio y mantener consistencia con la documentación, aunque según las reglas no lo usaremos activamente durante este prototipo.
  - Tiene una estructura genérica para abarcar eventos del sistema: `accion`, `entidad`, `entidadId` y `detalles` (que puede guardar JSON stringificado). Se vincula al `Usuario` mediante `onDelete: SetNull` para preservar la bitácora aún si se forzara el borrado del usuario.

Con esta tarea, finaliza la escritura del esquema de Prisma para la Fase 2. La tarea fue marcada con `[x]` en el `ROADMAP.md` y eliminada de la tabla "En curso ahora".
