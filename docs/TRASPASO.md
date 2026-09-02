# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-09-02
**Entrega:** Juan José
**Rama:** `main` (es documentación y una casilla de verificación)
**Commit:** al que trae este traspaso

### Qué se hizo

**1. La 2.09 quedó verificada en la máquina de Juan José.** La migración inicial
aplica sin errores y la prueba de humo pasó correctamente (Docker Desktop arriba,
bases creadas, seed ejecutado exitosamente, y `npm run check` limpio).

**2. Se avanzó en la investigación de la 2.11.** Se consultó la API de RxNorm
para los 10 medicamentos del seed a nivel de ingrediente. Los valores correctos a
cargar son: Paracetamol (161), Ibuprofeno (5640), Amoxicilina (133008),
Clonazepam (2598), Diazepam (3322), Fluoxetina (227224), Sertralina (155137),
Haloperidol (217483), Risperidona (35636) y Escitalopram (321988).

### Decisiones tomadas sobre la marcha

No se tomaron nuevas decisiones, simplemente se cerró la 2.09 pendiente.

### Qué quedó sin hacer

- **La 2.10 y la 2.11 no se empezaron.** Nadie las tiene tomadas. El trabajo
  de investigación para la 2.11 ya está hecho (ver "Qué se hizo"), solo falta
  escribir el código, hacer la migración de la 2.10 y actualizar el seed.

### Cómo verificarlo

La verificación de la 2.09 para Juan José pasó exitosamente:
- `npm ci` dejó el árbol limpio.
- `npm run setup` y `docker compose up -d` ejecutaron sin problemas.
- `npx prisma migrate dev` confirmó que el esquema está al día.
- `npx prisma db seed` creó los datos.
- `npm run check` cerró con código 0.

### Qué sigue

**La 2.10**, la migración (`rxcui` opcional y `fechaIngreso` en `Lote`).
Y después **la 2.11**, corregir el seed con los valores de RxNorm obtenidos hoy
y asignarle el `id` fijo al usuario de farmacia.

Estas dos tareas destraban las fases 3, 4 y 5, y las debe tomar alguien.

### Antes de arrancar, tener en cuenta

- **Nunca se edita la migración inicial.** Ya está mergeada. `rxcui` opcional y
  `fechaIngreso` van en una migración nueva.
- **Docker Desktop no arranca solo** al iniciar sesión en Windows.

### Bloqueos

**Ninguno por decisión.**
Lo que traba hoy es trabajo: alguien tiene que agarrar la 2.10 y la 2.11.
