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
**Rama:** `feat/2.04-clinico`

### Qué se hizo

**La tarea 2.04: Modelos clínicos (`Paciente`, `MedicacionVigente`, `ConsultaInteraccion`, `ObservacionInteraccion`).**
Se agregaron al `prisma/schema.prisma` los cuatro modelos fundamentales del módulo clínico, documentados con comentarios e integrados con el modelo `Medicamento` existente.

**Detalles de la implementación:**
- **Invariantes del dominio cumplidas:**
  - `Paciente`: Solo se almacena un `seudonimo` único. Se evita guardar datos reales (nombre, documento, fecha de nacimiento) para cumplir con la regla 7 estricta del negocio.
  - `MedicacionVigente`: Define el esquema terapéutico de un paciente. Incluye restricción `@@unique([pacienteId, medicamentoId])` para evitar prescribir la misma droga dos veces de forma concurrente al mismo paciente.
- **Consultas y observaciones:**
  - `ConsultaInteraccion`: Representa el evento de búsqueda. El `pacienteId` es opcional, ya que el sistema soporta consultas aisladas de medicamentos cruzados que no pertenecen a ningún paciente guardado.
  - `ObservacionInteraccion`: Se liga a la consulta mediante `onDelete: Cascade`. Guarda los dos IDs de los medicamentos implicados (`medicamento1Id` y `medicamento2Id`), hereda la gravedad del enum `Severidad` y almacena un texto de la observación para mostrar al profesional.

La tarea fue finalizada, marcada con `[x]` en el `ROADMAP.md` y eliminada de la tabla "En curso ahora".
