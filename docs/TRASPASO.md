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
**Rama:** `feat/2.03-stock`

### Qué se hizo

**La tarea 2.03: Modelos de stock `Lote` y `MovimientoStock`.**
Se agregaron al `prisma/schema.prisma` los modelos que resuelven la gestión de inventario basada en FEFO y la trazabilidad de los ingresos y egresos.

**Detalles de la implementación:**
- **Relaciones con Cascada:** Tanto `Lote` hacia `Medicamento` como `MovimientoStock` hacia `Lote` están configurados con `onDelete: Cascade`. Si se eliminase la entidad padre (aunque sea una acción restringida por reglas de negocio), se limpiarían en cascada sus dependientes.
- **Identificadores UUID:** Se utilizaron `uuid()` en ambos modelos para no exponer el volumen real de lotes y movimientos registrados.
- **`Lote`:**
  - `numeroLote` y `medicamentoId` forman una clave única compuesta (`@@unique`) para garantizar que un mismo fabricante no duplique el lote en un mismo medicamento.
  - El campo `fechaVencimiento` es el pilar para el sistema FEFO.
- **`MovimientoStock`:**
  - Enumera el `tipo` (`INGRESO` o `EGRESO`).
  - Siguiendo las convenciones del dominio, **no se agregó un campo de saldo**. El saldo se calcula en tiempo real restando los egresos de los ingresos, por lo que el `MovimientoStock` solo tiene la `cantidad` absoluta que se movió.
  - Carece del campo `usuarioId` de momento, ya que la entidad `Usuario` será creada más adelante en la tarea 2.06.

La tarea fue finalizada, marcada con `[x]` en el `ROADMAP.md` y eliminada de la tabla "En curso ahora".
