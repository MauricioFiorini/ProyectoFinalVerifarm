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
**Rama:** `feat/2.08-seed`

### Qué se hizo

**La tarea 2.08: Creación del `seed.ts` inicial.**
Se configuró y ejecutó exitosamente el script de inicialización de la base de datos con datos de prueba, necesarios para comenzar el desarrollo del backend.

**Detalles de la implementación:**
- Se instalaron las dependencias `pg` y `@prisma/adapter-pg` (y `@types/pg`), requisito clave e ineludible en Prisma 7 para poder instanciar el `PrismaClient` usando el _driver adapter_ compatible con PostgreSQL.
- Se modificó `package.json` para registrar el comando de ejecución (`"seed": "npx tsx prisma/seed.ts"`) y se actualizó `prisma.config.ts` reflejando este nuevo comando bajo el bloque `migrations`.
- Se creó `prisma/seed.ts` importando `dotenv/config` para asegurar la lectura de `DATABASE_URL`. El script incluye el cierre correcto del pool de conexión (`pool.end()`) para evitar que el proceso quede colgado.
- El seed inserta:
  - **3 Usuarios:** Un Administrador, un Farmacéutico y un Médico, listos para pruebas de autenticación y roles.
  - **10 Medicamentos:** Diferentes psicofármacos, antibióticos y analgésicos con sus respectivos `RxCUI` y `UnidadMedida`, sentando una base sólida para probar las interacciones.

La tarea fue probada localmente ejecutando `npx prisma db seed` con éxito. Fue marcada con `[x]` en el `ROADMAP.md` y eliminada de la tabla "En curso ahora".
