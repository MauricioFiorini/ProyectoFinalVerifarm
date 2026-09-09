# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

## Traspaso vigente

**Fecha:** 2026-09-09
**Entrega:** Juan Pablo Malizani
**Rama:** `fix/4.18-corte-de-vencimiento-en-utc`.

# La 4.18: un lote figuraba vencido el día en que vencía

**El prototipo sigue completo.** Esta no es una tarea de alcance nuevo: es la
primera de una serie de correcciones que salieron de revisar el sistema contra su
propia documentación, con las seis fases ya cerradas. Viven en una sección nueva
del roadmap, **"Correcciones posteriores al cierre de la fase"**, para que no se
confundan con el alcance del prototipo.

## Qué estaba mal

Las fechas sin hora —`Lote.fechaVencimiento` y `Lote.fechaIngreso`— se guardan
como **medianoche UTC**, porque así las manda un `<input type="date">` y así las
deja Postgres. Pero `src/services/stock.ts` armaba el corte del día con
`setHours(0,0,0,0)`, que es **medianoche local**. En UTC-3 esas dos medianoches
están a tres horas de distancia, y la del servicio caía después.

El efecto: **un lote que vencía el 24/09 figuraba vencido durante todo el 24/09**,
desde el primer minuto. Contradecía el criterio escrito en el comentario de la
propia función, que dice que un lote que vence hoy todavía sirve. Y no era
cosmético: FEFO excluye los lotes vencidos, así que el motor se salteaba un lote
todavía utilizable y dispensaba del siguiente.

**La misma causa tenía una cara opuesta**, en `src/services/lotes.ts`: la
validación de "la fecha de ingreso no puede ser futura" comparaba contra el fin
del día local, que en UTC son las 02:59 del día siguiente. La medianoche UTC de
**mañana** quedaba por debajo de ese límite y pasaba la validación. Se podía
cargar un lote con fecha de ingreso de mañana.

## Cómo se arregló

**Se comparte la convención, no la regla.** La discusión al plantear la tarea fue
si el servicio y la pantalla debían compartir una función. La respuesta es que no
hay ninguna regla de negocio para compartir: **ninguna pantalla calcula
vencimientos**, el estado le llega resuelto del servidor y ella solo lo pinta.
Eso ya estaba bien y no se tocó.

Lo que sí estaba escrito dos veces era algo más chico: **qué significa "el día" de
una fecha sin hora**. `src/lib/fechas.ts` lo resolvía en UTC y `stock.ts` en hora
local. Esas tres horas eran todo el error.

Así que las primitivas van a `src/lib/fechas.ts`, que ya era el dueño de la
convención y ya explicaba por qué es UTC:

- **`inicioDelDiaUtc(referencia)`** — el piso contra el que se compara.
- **`finDelDiaUtc(referencia)`** — el techo, para que la comparación siga siendo
  inclusiva si la fecha trae hora. No es hipotético: `esquemaCrearLote` acepta
  tanto `"2026-09-24"` como una cadena ISO completa.
- **`sumarDias(referencia, dias)`** — para el límite de la ventana de 30 días.

**Las tres leen el día calendario en hora local y devuelven el borde en UTC.** Esa
mezcla es deliberada y está explicada en el archivo: el día es el que la persona
ve en su calendario, y el borde tiene que estar en la zona en la que están
guardadas las fechas. `referencia` es siempre un instante, nunca una fecha ya
normalizada: pasarle el resultado de `inicioDelDiaUtc` la haría retroceder un día.

La decisión de si un lote está vencido **se quedó en el servicio**, donde estaba.

## El `setHours` que NO se tocó

`src/services/consultas.ts` tiene un `setHours(0,0,0,0)` local y **es correcto**.
Es el único que quedó después de esta tarea, así que va a llamar la atención del
próximo que busque `setHours` en el repositorio. Quedó un comentario en el propio
archivo explicando por qué sobrevivió.

La diferencia es el dato, no el criterio: ahí se filtra por `createdAt`, que es un
**instante real** —cuándo se registró la consulta—, y "las consultas de hoy" son
las del día de quien mira la pantalla. Pasarlo a UTC haría que a las 21 apareciera
una consulta de mañana. **Un arreglo aplicado en barrido lo rompe.**

## Qué se verificó

Sin pruebas automatizadas, a mano. `npm run check` da 0.

**El borde del vencimiento**, con un lote que vence el 24/09 y la fecha de
referencia movida a mano:

```
23/09 10:00   vencido: false   POR_VENCER   dias: 1
24/09 00:30   vencido: false   POR_VENCER   dias: 0
24/09 23:30   vencido: false   POR_VENCER   dias: 0
25/09 00:30   vencido: true    VENCIDO      dias: -1
```

El día del vencimiento ahora da **0 y no `-0`**, que era lo que devolvía
`Math.round` de un negativo chico.

**La ventana de 30 días** sigue siendo inclusiva: a 29 y 30 días `POR_VENCER`, a
31 `VIGENTE`.

**La fecha de ingreso**: hoy con hora completa se acepta, mañana se rechaza.

**Las nueve situaciones de FEFO** se volvieron a correr para descartar regresiones.
Ocho dan igual que antes. La novena es la que cambió, y es la que se quería
cambiar: el lote que vence hoy **ahora se usa primero** en vez de saltearse.

**Contra la base real**, para confirmar que Prisma devuelve las fechas como se
suponía: los seis lotes vuelven como medianoche UTC exacta y se clasifican bien.

## Lo que queda anotado

**El arreglo de fondo es del esquema, no del código.** `Lote.fechaVencimiento` y
`Lote.fechaIngreso` son fechas, no instantes, pero están declaradas `DateTime` y
Postgres las guarda como `timestamp(3)`. Mientras sea así, todo el código que las
compare tiene que saber en qué zona construir el corte, y cuando alguien se
olvide, el error vuelve. **Con la columna en `date` no podría volver.**

No se hizo acá porque es una migración, y el esquema lo toca una sola persona por
vez. Quedó escrito como **P.8.08** en `docs/ROADMAP_PRODUCTO.md`.

## Qué sigue

Las otras correcciones que salieron de la misma revisión, en este orden acordado:

1. **Las fechas del seed, que sean relativas a la fecha de ejecución.** Hoy son
   absolutas: el lote de Clonazepam vence el 24/09/2026 y el guion afirma "en 15
   días". Después de esa fecha la tarjeta de lotes por vencer se va a cero y se
   cae un momento de la demostración.
2. **Un paciente que muestre "sin interacciones" con cobertura real**, o sea dos
   drogas que estén en ONCHigh y no interactúen entre sí. Es la más importante:
   hoy la demostración muestra dos de los tres estados del módulo clínico, y el
   que falta es justo el que prueba que el sistema distingue entre "se revisó y
   está limpio" y "no se pudo revisar". `PAC-104` es Amoxicilina + Paracetamol y
   las dos tienen cero cobertura, así que da "sin datos" igual que `PAC-103`.
3. **El orden por severidad al releer una consulta guardada.**
   `obtenerConsulta` ordena por `createdAt`, y todas las observaciones de una
   consulta se escriben en la misma transacción, así que comparten timestamp y el
   orden lo decide Postgres. Hoy no se nota porque las 1150 filas de la fuente son
   todas de severidad alta.
4. **Dos menores:** la validación de lote escrita dos veces —`validarDatosDeLote`
   dice existir para que la compartan `crearLote` y `crearLoteConIngreso`, pero
   `crearLote` conserva su propia copia— y los mensajes de los servicios, que
   llegan a la pantalla sin tildes.

Después de eso, **ensayar el guion completo con la base sembrada** y cronometrar
el recorrido.

## Ojo con esto al retomar

**La base de esta máquina no está en estado de demostración.** Tiene 10
medicamentos, 1 paciente, 1 consulta y la tabla `Interaccion` **vacía**, restos de
la verificación del aviso de cobertura. Antes de cualquier ensayo hay que correr
`npx prisma db seed`, que limpia y vuelve a sembrar.

## Lo que sigue abierto de antes

**El parche del `setTimeout`.** Todas las pantallas cargan datos con
`setTimeout(…, 0)` dentro de un `useEffect`, para que la regla
`react-hooks/set-state-in-effect` no rechace la llamada. **La regla tiene razón**
y el timeout no lo arregla, solo lo esconde. Está documentado en
`src/app/stock/TablaDeStock.tsx` desde la fase 4. Es deuda conocida, no un
bloqueo.

**La D8 sigue abierta** desde el 2026-09-01: si se sostiene la regla de "código
va en rama y otro le pasa el ojo" o se cambia el documento.

## Cómo levantarlo

```bash
docker compose up -d
npx prisma db seed
npm run dev
```

`npm run check` da 0. Después de sembrar, la base queda con 25 medicamentos, 10
lotes, 4 pacientes, 2 consultas y las 1150 interacciones.

**Ojo con el selector de rol.** Se guarda en el `localStorage` del navegador y
**no lo resetea ni el seed ni `npm run setup`**: si el ensayo anterior terminó
como Dr. House, la próxima corrida arranca como Dr. House. Se corrige a mano
desde la barra superior.

## Si alguien vuelve a tocar código

- **Las fechas sin hora se comparan con las primitivas de `src/lib/fechas.ts`.**
  Nunca con `setHours` local. La excepción es `createdAt`, que es un instante.
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
- **Ningún dato clínico se inventa.**
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **Después de cambiar el esquema, `npm run setup` antes de `npm run check`.**

## Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
