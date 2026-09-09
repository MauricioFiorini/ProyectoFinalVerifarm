# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

## Traspaso vigente

**Fecha:** 2026-09-09
**Entrega:** Juan Pablo Malizani
**Ramas:** ninguna abierta. **Las dos correcciones están mergeadas a `main`**
(PR #35 y #36). No queda trabajo a medias en ninguna rama.

# Dos correcciones posteriores al cierre, las dos terminadas

**El prototipo sigue completo.** Nada de esto es alcance nuevo: son defectos del
trabajo ya hecho, encontrados al verificar el sistema contra su documentación.
Viven en secciones nuevas del roadmap llamadas **"Correcciones posteriores al
cierre de la fase"**, una en la fase 4 y otra en la fase 6.

| Tarea | Estado | Qué dejó |
| --- | --- | --- |
| 4.18 | `[x]` | El corte del día se calcula en UTC. **Mergeada.** |
| 6.11 | `[x]` | Seed con fechas relativas, lote vencido y guion alineado. **Mergeada.** |

## Lo primero, si vas a ensayar

**La base de esta máquina ya está sembrada** con el seed nuevo: 25 medicamentos,
11 lotes, 4 pacientes, 2 consultas y las 1150 interacciones. Pero **cualquier
ensayo tiene que arrancar sembrando de nuevo**, porque el guion afirma números
que se mueven en cuanto alguien dispensa o evalúa:

```bash
docker compose up -d
npx prisma db seed
npm run dev
```

**Ojo con el selector de rol.** Vive en el `localStorage` del navegador y no lo
resetea ni el seed ni `npm run setup`. Se corrige a mano desde la barra superior.

## La 4.18 — un lote figuraba vencido el día en que vencía

Las fechas sin hora se guardan como **medianoche UTC**, pero `stock.ts` armaba el
corte del día con `setHours` local. En UTC-3 esas medianoches están a tres horas,
y la del servicio caía después: **un lote que vencía el 24/09 figuraba vencido
todo el 24/09**. FEFO excluye lo vencido, así que el motor se salteaba un lote
todavía utilizable.

La misma causa tenía una cara opuesta en `lotes.ts`: la validación de "fecha de
ingreso no futura" **aceptaba la de mañana**.

**Se comparte la convención, no la regla.** Ninguna pantalla calcula
vencimientos, así que no había regla de negocio que compartir. Lo que estaba
escrito dos veces era qué significa "el día" de una fecha sin hora:
`src/lib/fechas.ts` lo resolvía en UTC y `stock.ts` en local. Las primitivas
—`inicioDelDiaUtc`, `finDelDiaUtc`, `sumarDias`— quedaron en `fechas.ts`, que ya
era el dueño de la convención. La decisión de si un lote está vencido se quedó en
el servicio.

**El `setHours` de `consultas.ts` NO se tocó y es correcto.** Es el único que
queda en el repositorio, así que va a llamar la atención del próximo que busque
esa cadena. Hay un comentario en el archivo explicando por qué sobrevivió: ahí el
dato es `createdAt`, un instante real, y el día local es el criterio adecuado.

El arreglo de fondo es del esquema y quedó anotado como **P.8.08** en
`docs/ROADMAP_PRODUCTO.md`: con esas columnas en `date` en vez de `timestamp`, el
problema no podría volver.

### Lo que se verificó de la 4.18

A mano, sin pruebas automatizadas. El borde del vencimiento, con un lote que
vence el 24/09 y la fecha de referencia movida:

```
23/09 10:00   vencido: false   POR_VENCER   dias: 1
24/09 00:30   vencido: false   POR_VENCER   dias: 0
24/09 23:30   vencido: false   POR_VENCER   dias: 0
25/09 00:30   vencido: true    VENCIDO      dias: -1
```

El día del vencimiento da **0 y no `-0`**. La ventana de 30 días sigue inclusiva:
a 30 días avisa, a 31 no. La fecha de ingreso de hoy con hora completa se acepta y
la de mañana se rechaza.

**Las nueve situaciones de FEFO** se volvieron a correr. Ocho dan igual que antes;
la novena es la que se quería cambiar, el lote que vence hoy ahora se usa primero.
Y contra la base real se confirmó que Prisma devuelve las fechas como medianoche
UTC exacta, que es el supuesto sobre el que se apoya todo el arreglo.

## La 6.11 — el seed envejecía

Las fechas eran absolutas. El lote de Clonazepam vencía el 24/09/2026, así que
**después de esa fecha la tarjeta de "lotes por vencer" se iba a cero** y se caía
un momento de la demostración. Ahora se calculan como desplazamientos desde el
día en que se siembra, con un helper apoyado en las primitivas de la 4.18, para
que el seed no invente su propia idea de "el día".

**Y ahora se ven los tres estados de vencimiento, siempre.** Antes no había
ningún lote vencido en el seed, así que el estado VENCIDO —el que justifica el
indicador de la 4.17— no se podía mostrar. Se agregó **`HAL-VENCIDO`**, un lote
de Haloperidol con 25 ampollas vencido hace 20 días.

Está en Haloperidol a propósito: es el medicamento de la escena de FEFO, y vence
antes que todos los demás. **Al dispensar 50, el sistema lo saltea** y reparte 40
y 10 entre los dos lotes vigentes. Es la única forma de *mostrar* la exclusión de
vencidos, que hasta ahora el guion afirmaba sin poder enseñar. De paso hace
aparecer el renglón rojo de "N en lotes vencidos" de la pantalla de lotes, que
estaba construido desde la 4.17 y nunca se había visto funcionando.

**Ningún número del guion cambió.** Verificado contra la base sembrada:

```
estados presentes:  VENCIDO, POR_VENCER, VIGENTE   -> los tres
bajo minimo:        17
lotes por vencer:   1  (Clonazepam en 15 dias)
consultas del dia:  2
Haloperidol disponible: 120   (las 25 vencidas no cuentan)
plan FEFO de 50:    HAL-L1:40 + HAL-L2:10
```

# El guion, alineado

**Hecho.** Eran seis pasajes de `docs/GUION_DEMOSTRACION.md` y tres nombres de
lote. Queda escrito acá qué cambió, porque el guion es lo que se lee en voz alta
el día de la defensa y conviene saber por qué dice lo que dice.

**El guion ahora nombra plazos, no fechas.** Quedó como regla escrita en su
encabezado, al lado de la que ya estaba sobre no escribir de memoria: "vence en
15 días" es cierto siempre, "vence el 24/09/2026" deja de serlo a la semana.

## Los tres nombres de lote que cambiaron

El seed ya no pone el año en el número de lote, justamente porque envejecía.

| Antes | Ahora |
| --- | --- |
| `CLO-2026-VENCE` | `CLO-POR-VENCER` |
| `HAL-2026-L1` | `HAL-L1` |
| `HAL-2027-L2` | `HAL-L2` |

Y hay uno nuevo, que el guion ahora sí nombra: **`HAL-VENCIDO`**.

## Los seis pasajes

Los seis, ya corregidos. Se listan con lo que decían, para que se entienda el
criterio si mañana alguien agrega un paso.

1. **Línea 79.** Dice que el lote `CLO-2026-VENCE` vence "el 24/09/2026, en 15
   días". El plazo era correcto y ahora lo es siempre. Salió la fecha y se
   corrigió el nombre del lote.
2. **Líneas 105-106.** Da los vencimientos de los dos lotes de Haloperidol como
   15/11/2026 y 15/09/2027. Van como plazos, con los nombres nuevos y con el lote vencido sumado a la tabla.
3. **Líneas 110-112.** Dice que los dos figuran "Vigente" y que el primero vence
   "dentro de dos meses". **Sigue siendo cierto**: el desfase se eligió en 67
   días justamente para que quede fuera de la ventana de 30. Solo revisar la
   redacción si se cambian las líneas de arriba.
4. **Líneas 126-127.** El plan de egreso repite las dos fechas. Mismo criterio, y se agregó la nota de que el lote vencido no aparece en el plan.
5. **Líneas 162-163.** La medicación de `PAC-101` figura "desde 15/08/2026" y
   "desde 01/06/2026". Se sacaron: la pantalla las muestra igual, y el guion no necesita repetirlas.
6. **Líneas 8 y 260.** Son la fecha del ensayo de la 6.09. **No se tocan**: son
   registro histórico de cuándo se ensayó, no una afirmación sobre la pantalla.

## Lo que se agregó al guion, no solo corrigió

**La escena de FEFO ahora tiene tres lotes y eso es una mejora, no un estorbo.**
La tabla de Haloperidol muestra primero `HAL-VENCIDO` con sus 25 ampollas y su
indicador rojo, y recién después los dos vigentes.

- **La narración decía "el primer lote solo tiene 40"** y ahora dice **"el
  primer lote vigente"**.
- **El guion se detiene ahí un segundo**: hay 145 ampollas en el depósito y solo
  120 se pueden usar. Es el problema que el proyecto viene a resolver, visible en
  pantalla, y es la respuesta al jurado que pregunte cómo se sabe que FEFO
  descarta lo vencido.
- El total sigue diciendo **120 disponibles**, con el renglón rojo aparte.

# Qué queda pendiente

**Cuatro cosas, en este orden.** Salieron todas de la misma revisión del sistema
contra su documentación, con las seis fases ya cerradas. Ninguna es alcance
nuevo.

## Van sobre `main`, una por vez, y NO encadenadas

Las dos que ya entraron sí estuvieron encadenadas —la 6.11 se abrió sobre la
rama de la 4.18, porque el seed necesitaba las primitivas de fecha que esa tarea
agregaba— y **costó dos resoluciones de conflicto**, una en cada PR, las dos
sobre `docs/ROADMAP.md` y `docs/TRASPASO.md`. Es el precio de encadenar: la
segunda rama arrastra el estado del roadmap de la primera, que para entonces ya
cambió.

**Ninguna de las cuatro que quedan depende de otra**, así que cada una sale de
`main` actualizado y vuelve por su PR. Si dos tocaran el mismo archivo, se hacen
una después de la otra, no en paralelo: **la primera y la segunda tocan las dos
`prisma/seed.ts`**, así que la segunda arranca recién cuando la primera esté
mergeada.

Y el recordatorio que dejó cara la última vez: **los conflictos se resuelven en
local**, nunca desde la web. Resolver desde GitHub deja commits con un bot como
autor y viola la regla de autoría, que es innegociable. Está en la sección 14 de
`docs/CONVENCIONES.md`.

## 1. El paciente que falta, para el tercer estado del módulo clínico

**Es la más importante de las cuatro**, y la que más se nota en la defensa.

El módulo clínico tiene tres respuestas posibles y **hoy la demostración solo
puede mostrar dos**: "se encontraron interacciones" con `PAC-101` y `PAC-102`, y
"sin datos en la fuente" con `PAC-103`. Falta la tercera, **"se revisó y no hay
interacciones"**, que es justamente la que prueba que el sistema distingue entre
haber revisado y no haber podido revisar.

`PAC-104` no sirve: es Amoxicilina más Paracetamol y **las dos tienen cero
cobertura en ONCHigh**, así que da "sin datos", igual que `PAC-103`.

**Hace falta un paciente con dos drogas que estén en la fuente y no interactúen
entre sí.** Verificado contra la base: **Carbamazepina y Fluoxetina** cumplen.
Hoy ese caso se arma a mano desde `/consultas/nueva`, y armarlo a mano delante
del jurado es exactamente lo que el guion existe para evitar.

Toca `prisma/seed.ts`, y hay que **verificar contra la base sembrada** que el par
elegido no dispara ninguna observación, no alcanza con suponerlo. También hay que
sumar el caso al guion, que hoy no lo recorre.

## 2. El orden por severidad al releer una consulta guardada

`obtenerConsulta` en `src/services/consultas.ts` ordena las observaciones por
`createdAt`. Todas las de una consulta se escriben en la misma transacción, así
que **comparten timestamp** y el orden lo termina decidiendo Postgres. La tarea
5.18 pide orden por severidad.

**Hoy no se ve**, porque las 1150 filas de ONCHigh son todas de severidad alta.
Se va a ver el día que entre una fuente con grados, y entonces va a ser un
defecto intermitente y difícil de reproducir. El motor ya devuelve la lista
ordenada al crear la consulta; lo que falta es imponer ese mismo orden al
releerla.

## 3. Los dos menores

**La validación de lote, escrita dos veces.** `validarDatosDeLote` en
`src/services/lotes.ts` dice en su comentario que existe para que la compartan
`crearLote` y `crearLoteConIngreso`, pero **`crearLote` conserva su propia copia
en línea**. Hoy las dos copias son idénticas, así que no hay diferencia de
comportamiento; el problema es el día que alguien corrija una sola.

**Los mensajes de los servicios llegan a la pantalla sin tildes.** "El numero de
lote no puede estar vacio", "Ocurrio un error inesperado". Los comentarios del
código van sin tildes por convención y está bien, pero estos son texto que ve el
usuario, y el resto de la interfaz sí las lleva.

## 4. La línea 13 de `CLAUDE.md`

Dice **"Estado: en construcción del prototipo"**, siete líneas antes de decir que
las seis fases están cerradas. Es una línea y es el primer archivo que lee
cualquiera que abra el repositorio, asistente incluido.

# Y después de las cuatro

**Ensayar el guion completo con la base sembrada y cronometrar el recorrido.** El
ensayo de la 6.09 verificó que el sistema hace lo que el guion dice, no que entre
en cinco minutos. Y **repartir `docs/PREGUNTAS_PREVISIBLES.md`** para que los tres
respondan lo mismo.

## Lo que sigue abierto de antes

**El parche del `setTimeout`.** Todas las pantallas cargan datos con
`setTimeout(…, 0)` dentro de un `useEffect`, para que la regla
`react-hooks/set-state-in-effect` no rechace la llamada. **La regla tiene razón**
y el timeout no lo arregla, solo lo esconde. Está documentado en
`src/app/stock/TablaDeStock.tsx` desde la fase 4. Es deuda conocida, no un
bloqueo.

**La D8 sigue abierta** desde el 2026-09-01: si se sostiene la regla de "código
va en rama y otro le pasa el ojo" o se cambia el documento.

## Si alguien vuelve a tocar código

- **Las fechas sin hora se comparan con las primitivas de `src/lib/fechas.ts`.**
  Nunca con `setHours` local. La excepción es `createdAt`, que es un instante.
- **Las fechas del seed son relativas al día en que se siembra.** No volver a
  poner fechas fijas: es lo que arregló la 6.11.
- **El aviso clínico va en toda pantalla clínica nueva**, con `<AvisoClinico />`.
- **Las pantallas consumen la API, no importan el servicio**, y no revalidan
  reglas del dominio.
- **Las interacciones se evalúan sobre la medicación VIGENTE.**
- **`ordenarParRxcui` es obligatorio** en cualquier lectura o escritura de
  `Interaccion`.
- **`src/components/ui/` tiene siete componentes**: Boton, Campo, Tabla, Modal,
  Chip, AvisoClinico y ErrorSeccion.
- **Ningún dato clínico se inventa.**
- **El sistema asiste, no decide.**
- **El paciente no tiene datos identificatorios.** Solo un seudónimo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **Después de cambiar el esquema, `npm run setup` antes de `npm run check`.**

## Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.

**Ya no hay orden de merge que respetar.** Las dos ramas entraron, en su orden:
primero la 4.18 y después la 6.11, que dependía de sus primitivas de fecha. Lo
que queda pendiente **no está encadenado**, y el porqué está arriba, en "Van
sobre `main`, una por vez".
