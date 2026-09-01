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
**Rama:** `feat/2.02-medicamento`

### Qué se hizo

**La tarea 2.02: Modelo `Medicamento`.**
Se agregó al archivo `prisma/schema.prisma` el modelo de datos para los medicamentos.

**Detalles de la implementación:**
- `id`: Generado como `uuid()` en lugar de autoincremental para no exponer secuencias ni el orden de inserción.
- `nombre`: Definido como `@unique` para evitar registros duplicados en el inventario.
- `rxcui`: Identificador único y obligatorio del estándar RxNorm, fundamental para el funcionamiento del módulo clínico de interacciones ONCHigh.
- `unidad`: Restringido al enum `UnidadMedida` para mantener la consistencia de datos.
- `stockMinimo`: Constante numérica que facilitará lanzar alertas de reposición (por defecto en 0).
- `activo`: Un booleano (`true` por defecto) para usar *soft deletes*. En este dominio los medicamentos no se pueden borrar físicamente porque romperían la inmutabilidad del registro histórico de movimientos y de las prescripciones clínicas.

La tarea fue finalizada, marcada con `[x]` en el `ROADMAP.md` y eliminada de la tabla "En curso ahora". El código fue formateado correctamente usando `npx prisma format`.
