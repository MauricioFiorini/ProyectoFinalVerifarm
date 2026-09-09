# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

## Traspaso vigente

**Fecha:** 2026-09-09
**Entrega:** Juan José Pastorino
**Rama:** `feat/6.04-manejo-errores-global` lista para merge a `main`.

## La tarea 6.04 está completa (Manejo de errores global)

Se implementó la infraestructura transversal para captura y visualización de errores:
- **Página de error global (`src/app/error.tsx`):** captura excepciones no controladas en el árbol de componentes sin romper el layout transversal (la barra lateral y superior continúan operativas), permitiendo reintentar (`reset()`) o regresar a inicio.
- **Página 404 (`src/app/not-found.tsx`):** diseño institucional para URLs inexistentes con accesos directos a inicio, stock y consultas.
- **Manejador crítico (`src/app/global-error.tsx`):** red de seguridad con estructura HTML propia para fallos críticos en el layout raíz.
- **Componente `ErrorSeccion` (`src/components/ui/ErrorSeccion.tsx`):** componente accesible (`role="alert"`, `aria-live="assertive"`) que unifica la presentación de errores de red o carga en tablas y secciones de datos, con soporte para título, mensaje y botón "Reintentar".
- **Unificación transversal:** se reemplazaron las implementaciones locales de error en `TableroInicio`, `ListaMedicamentos`, `TablaDeStock`, `LotesDelMedicamento`, `ListaPacientes`, `MedicacionDelPaciente`, `ListaConsultas` y `ResultadoDeConsulta`.

### Lo que se hizo en este bloque

| Tarea | Qué dejó |
| --- | --- |
| 6.02 | Selector de usuario simulado en `BarraSuperior` y layout transversal. |
| 6.06 | `seed.ts` definitivo con 25 fármacos, lotes para FEFO, alertas visuales de stock, 4 pacientes y consultas registradas. |
| 6.03 | Tablero de inicio con tarjetas de stock bajo mínimo, lotes por vencer y consultas del día (`TableroInicio.tsx`, `page.tsx`, `api/inicio`). |
| 6.04 | Manejo de errores global: página de error `error.tsx`, `not-found.tsx`, `global-error.tsx` y componente `ErrorSeccion.tsx` integrado en todas las pantallas. |

### El recorrido que ya funciona

**Inicio:** entrar a `/` y ver el estado consolidado de la colonia en tres tarjetas interactivas: qué medicamentos están bajo stock mínimo, qué lotes vencen en menos de un mes y cuántas consultas clínicas se evaluaron hoy.

**Stock:** entrar a `/stock`, ver qué está bajo mínimo, abrir un medicamento,
registrar un ingreso, dispensar una cantidad y ver cómo el sistema reparte entre
lotes empezando por el que vence antes.

**Clínico:** crear un paciente en `/pacientes`, abrir su ficha, agregarle
medicación, apretar "Evaluar interacciones" —que abre la consulta con su
medicación vigente ya cargada—, evaluar, y leer el resultado. Después la
consulta queda en `/consultas` y se puede volver a abrir.

### Las tres ideas que sostienen el módulo clínico

Conviene tenerlas presentes antes de tocar cualquier cosa:

1. **"Sin interacciones" y "sin datos" no se pueden ver igual.** Es la regla que
   aparece en cada pantalla del módulo: en la ficha, en la selección, en el
   resultado y en el listado. Decisión `0012`.
2. **Una consulta guarda lo que evaluó, no solo lo que encontró.** Sin eso, una
   consulta sin hallazgos no diría qué revisó. Decisión `0014`.
3. **El texto de la observación se compone al guardar, no al mostrar.** El
   registro clínico es lo que se leyó ese día. La cobertura, en cambio, se
   recalcula al releer.

### Cómo verificarlo

```bash
docker compose up -d
npx prisma db seed
npm run dev
```

`npm run check` da 0.

### Dónde está el proyecto

```
Fase 0 — entorno ...........   9 de  9   ✅
Fase 1 — andamiaje .........  15 de 15   ✅
Fase 2 — modelo de datos ...  11 de 11   ✅
Fase 3 — catálogo ..........   8 de  8   ✅
Fase 4 — stock y FEFO ......  17 de 17   ✅
Fase 5 — módulo clínico ....  20 de 21   ✅ (la 5.03 quedó sin efecto)
Fase 6 — cierre ............   5 de 10   (6.01, 6.02, 6.03, 6.04 y 6.06 completas)
```

### Qué sigue: la fase 6

**Cinco tareas pendientes.** En orden de conveniencia:

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **6.05** | M | **Revisión responsive:** usable en la notebook con la que se hace la defensa. |
| **6.07** | M | `README.md` |
| **6.08** | M | Guion de demostración |
| **6.09** | M | Ensayo en la máquina de la defensa |
| **6.10** | M | Respuestas a las preguntas previsibles |

### Tres cosas que el equipo debería mirar

**El parche del `setTimeout`.** Todas las pantallas cargan datos con
`setTimeout(…, 0)` dentro de un `useEffect`, para que la regla
`react-hooks/set-state-in-effect` no rechace la llamada. **La regla tiene razón**
y el timeout no lo arregla, solo lo esconde. Está documentado en
`src/app/stock/TablaDeStock.tsx` desde la fase 4. Con la fase 5 cerrada es un
buen momento para decidir qué hacer.

**La D8 sigue abierta** desde el 2026-09-01: si se sostiene la regla de "código
va en rama y otro le pasa el ojo" o se cambia el documento.

**En 375 px las tablas necesitan desplazamiento horizontal**, y en la ficha del
paciente quedan fuera de vista las dos columnas que importan: "Interacciones" y
"Suspender". Es la 6.05, pero conviene mirarlo ahí en serio.

### Antes de arrancar, tener en cuenta

- **El aviso clínico va en toda pantalla clínica nueva**, con
  `<AvisoClinico />`. No se copia el texto.
- **Las pantallas consumen la API, no importan el servicio.**
- **Las pantallas no revalidan reglas del dominio.** Mandan y pintan la
  respuesta; lo único que decide el cliente es si el formulario está completo.
- **Las interacciones se evalúan sobre la medicación VIGENTE.**
- **La `evaluabilidad` viene resuelta del servidor.**
- **`ordenarParRxcui` es obligatorio** en cualquier lectura o escritura de
  `Interaccion`.
- **`src/components/ui/` tiene siete componentes**: Boton, Campo, Tabla, Modal,
  Chip, AvisoClinico y ErrorSeccion. Algo sube ahí cuando **dos o más rutas**
  necesitan lo mismo.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.** Vale también para el seed de la 6.06: los
  RxCUI se verifican, no se escriben de memoria (decisión `0008`).
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **Después de cambiar el esquema, `npm run setup` antes de `npm run check`.**

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
