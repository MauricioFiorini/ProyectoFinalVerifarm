# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-09-09
**Entrega:** Mauricio Mateo Fiorini
**Todo mergeado a `main`.** PR #27 a #34. No queda nada sin integrar.

## La fase 5 está cerrada

**20 de 21**, y la que falta —la 5.03— quedó sin efecto por la decisión `0012`.

**Los dos módulos del proyecto están completos.** El de stock desde la fase 4, el
clínico desde ahora. El recorrido se puede hacer entero en las dos mitades.

### Lo que se hizo en este bloque

| Tarea | Qué dejó |
| --- | --- |
| 5.13 | Ficha del paciente, con la marca de cobertura por fila |
| 5.14 | Modal para agregar medicación, con buscador |
| 5.15 | Suspender una medicación, con motivo obligatorio |
| 5.16 | Pantalla de consulta, con la cobertura avisada **antes** de evaluar |
| 5.18 | Pantalla de resultado |
| 5.20 | Listado de consultas |
| 5.17 | Precarga de la medicación vigente del paciente |
| 5.19 | Aviso clínico obligatorio, en las cinco pantallas |

También se **actualizó la documentación que había quedado vieja**: la sección 1
de `docs/ARQUITECTURA.md` decía que no existía ninguna pantalla ni route
handler, la tabla del stack daba Zod como "sin instalar", el ejemplo de
"decidido no es hecho" citaba una migración que ya se hizo, y la línea de estado
de `CLAUDE.md` hablaba de la fase 3.

### Recordatorio: hay migraciones sin aplicar

`docs/ROADMAP.md`, sección **"Migraciones pendientes de aplicar"**, arriba de
todo. **Juan Pablo y Juan José tienen dos sin correr**, y sin ellas
`npm run check` falla con errores de tipo que no mencionan a Prisma por ningún
lado.

```bash
npx prisma migrate dev
npm run setup
```

### El recorrido que ya funciona

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

`npm run check` da 0. La base quedó limpia: **0 pacientes, 0 consultas**, los 10
medicamentos del seed y las **1150 interacciones**.

### Dónde está el proyecto

```
Fase 0 — entorno ...........   9 de  9   ✅
Fase 1 — andamiaje .........  15 de 15   ✅
Fase 2 — modelo de datos ...  11 de 11   ✅
Fase 3 — catálogo ..........   8 de  8   ✅
Fase 4 — stock y FEFO ......  17 de 17   ✅
Fase 5 — módulo clínico ....  20 de 21   ✅ (la 5.03 quedó sin efecto)
Fase 6 — cierre ............   1 de 10
```

### Qué sigue: la fase 6

**Nueve tareas.** En orden de conveniencia, no de dependencia:

| Tarea | Tamaño | Qué es |
| --- | --- | --- |
| **6.06** | L | **Seed definitivo.** Lo más importante que queda |
| **6.02** | M | Selector de usuario simulado en la barra superior |
| **6.03** | L | Pantalla de inicio con tarjetas. Reemplaza la provisoria |
| **6.04** | M | Manejo de errores global |
| **6.05** | M | Revisión responsive |
| **6.07** | M | `README.md` |
| **6.08** | M | Guion de demostración |
| **6.09** | M | Ensayo en la máquina de la defensa |
| **6.10** | M | Respuestas a las preguntas previsibles |

### Por qué la 6.06 va primero

**Hoy el catálogo cruza con una sola interacción**: escitalopram con haloperidol.
Cualquier demostración del módulo clínico muestra un único hallazgo, y eso no
alcanza para mostrar de qué es capaz.

No es un error del código: el seed se armó en la 2.08, antes de que existiera la
fuente. La decisión `0012` ya fijó el criterio —elegir el catálogo de manera que
se cruce con ONCHigh, sin dejar de ser verosímil para una colonia psiquiátrica—
y está medido: **20 drogas tomadas de la propia lista dan 47 pares**.

La 6.06 además pide:

- **Un medicamento con dos lotes de distinto vencimiento**, para poder mostrar
  FEFO repartiendo.
- **Pacientes cuya medicación efectivamente dispare interacciones.**

**Hoy los dos módulos no se pueden demostrar en la misma base, y eso solo lo
arregla la 6.06.** El seed carga las 1150 interacciones, pero empieza con un
`medicamento.deleteMany()` que se lleva en cascada los lotes y los movimientos.
O sea que sembrar deja el módulo clínico listo y el stock vacío, y armar lotes a
mano para mostrar FEFO deja el stock listo y la tabla de interacciones vacía, con
todas las drogas marcadas "sin datos en la fuente". No hay orden de pasos que
deje las dos mitades andando a la vez. La 6.06 lo resuelve de raíz porque siembra
las dos cosas juntas: el catálogo que cruza con la fuente y los lotes con
vencimientos distintos. Mientras no esté, el guion de la 6.08 no se puede ensayar
entero.

**La 6.03 conviene después de la 6.06**, porque las tarjetas de inicio se ven
vacías sin datos. **Si trabajan dos en paralelo: 6.06 con 6.02, o 6.06 con
6.04.**

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
- **`src/components/ui/` tiene seis componentes**: Boton, Campo, Tabla, Modal,
  Chip y AvisoClinico. Algo sube ahí cuando **dos o más rutas** necesitan lo
  mismo.
- **Las fechas se formatean con `src/lib/fechas.ts`.**
- **Ningún dato clínico se inventa.** Vale también para el seed de la 6.06: los
  RxCUI se verifican, no se escriben de memoria (decisión `0008`).
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **Después de cambiar el esquema, `npm run setup` antes de `npm run check`.**

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
