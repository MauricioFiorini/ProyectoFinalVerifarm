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
**Rama:** `feat/3.01-servicio-medicamentos`

### Qué se hizo

**La tarea 2.08: Creación del `seed.ts` inicial.**
Se configuró y ejecutó exitosamente el script de inicialización de la base de datos con datos de prueba, necesarios para comenzar el desarrollo del backend.

**Detalles de la implementación (2.08):**
- Se instalaron las dependencias `pg` y `@prisma/adapter-pg` (y `@types/pg`), requisito clave e ineludible en Prisma 7 para poder instanciar el `PrismaClient` usando el _driver adapter_ compatible con PostgreSQL.
- Se modificó `package.json` para registrar el comando de ejecución (`"seed": "npx tsx prisma/seed.ts"`) y se actualizó `prisma.config.ts` reflejando este nuevo comando bajo el bloque `migrations`.
- Se creó `prisma/seed.ts` importando `dotenv/config` para asegurar la lectura de `DATABASE_URL`. El script incluye el cierre correcto del pool de conexión (`pool.end()`) para evitar que el proceso quede colgado.
- El seed inserta:
  - **3 Usuarios:** Un Administrador, un Farmacéutico y un Médico, listos para pruebas de autenticación y roles.
  - **10 Medicamentos:** Diferentes psicofármacos, antibióticos y analgésicos con sus respectivos `RxCUI` y `UnidadMedida`, sentando una base sólida para probar las interacciones.

---

**Inicio de FASE 3: Catálogo de medicamentos**
Se cerró formalmente la FASE 2 y se avanzó con la primera tarea del catálogo.

**La tarea 3.01: `src/services/medicamentos.ts`**
Se creó el servicio backend para gestionar la entidad `Medicamento`.
- **Pre-requisito importante resuelto:** Se actualizó `src/lib/db.ts` para instanciar `PrismaClient` usando el adaptador `PrismaPg` y `pg.Pool`, lo cual es estrictamente obligatorio en Prisma 7. Si no se hacía, Next.js hubiese tirado error de inicialización en cuanto se llamara a la base de datos.
- **Servicio:** Se implementaron las cuatro funciones principales requeridas:
  1. `listarMedicamentos`: trae todos los activos ordenados por nombre alfabéticamente.
  2. `buscarMedicamentosPorNombre`: búsqueda con `contains` e `insensitive`.
  3. `obtenerMedicamentoPorId`: búsqueda por ID validando que esté activo.
  4. `crearMedicamento`: inserta un nuevo medicamento.
- **Validaciones de negocio:** En `crearMedicamento`, se controla explícitamente que no exista ya otro medicamento activo con el mismo nombre (`case-insensitive`) y que no exista otro con el mismo `rxcui`, tirando un error legible en caso de conflicto.

El código pasó la verificación de TypeScript (`npm run check`) sin problemas. La tarea fue marcada como finalizada (`[x]`) en el ROADMAP y removida de "En curso ahora".
