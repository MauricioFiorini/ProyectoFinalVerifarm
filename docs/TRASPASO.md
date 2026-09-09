# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

## Traspaso vigente

**Fecha:** 2026-09-09
**Entrega:** Juan Pablo Malizani
**Ramas:** `fix/4.18-corte-de-vencimiento-en-utc` y
`fix/6.11-fechas-del-seed-relativas`, las dos pusheadas y **sin mergear**.

# Dos correcciones posteriores al cierre. La 6.11 quedó a medias

**El prototipo sigue completo.** Nada de esto es alcance nuevo: son defectos del
trabajo ya hecho, encontrados al verificar el sistema contra su documentación.
Viven en secciones nuevas del roadmap llamadas **"Correcciones posteriores al
cierre de la fase"**, una en la fase 4 y otra en la fase 6.

| Tarea | Estado | Qué dejó |
| --- | --- | --- |
| 4.18 | `[x]` | El corte del día se calcula en UTC. Lista para revisar y mergear. |
| 6.11 | `[!]` | Seed con fechas relativas, hecho y verificado. **Falta alinear el guion.** |

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

# Lo que falta de la 6.11: alinear el guion

**Esto es lo único pendiente, y está analizado.** No hace falta volver a
estudiarlo: son seis pasajes de `docs/GUION_DEMOSTRACION.md` y tres nombres de
lote. Se retoma sobre la misma rama, `fix/6.11-fechas-del-seed-relativas`.

## Los tres nombres de lote que cambiaron

El seed ya no pone el año en el número de lote, justamente porque envejecía.

| Antes | Ahora |
| --- | --- |
| `CLO-2026-VENCE` | `CLO-POR-VENCER` |
| `HAL-2026-L1` | `HAL-L1` |
| `HAL-2027-L2` | `HAL-L2` |

Y hay uno nuevo que el guion todavía no nombra: **`HAL-VENCIDO`**.

## Los seis pasajes

**Regla general: el guion tiene que nombrar plazos, no fechas.** "Vence en 15
días" sigue siendo cierto siempre; "vence el 24/09/2026" deja de serlo.

1. **Línea 79.** Dice que el lote `CLO-2026-VENCE` vence "el 24/09/2026, en 15
   días". El plazo es correcto y ahora lo es siempre; sacar la fecha y corregir
   el nombre del lote.
2. **Líneas 105-106.** Da los vencimientos de los dos lotes de Haloperidol como
   15/11/2026 y 15/09/2027. Van como plazos, y con los nombres nuevos.
3. **Líneas 110-112.** Dice que los dos figuran "Vigente" y que el primero vence
   "dentro de dos meses". **Sigue siendo cierto**: el desfase se eligió en 67
   días justamente para que quede fuera de la ventana de 30. Solo revisar la
   redacción si se cambian las líneas de arriba.
4. **Líneas 126-127.** El plan de egreso repite las dos fechas. Mismo criterio.
5. **Líneas 162-163.** La medicación de `PAC-101` figura "desde 15/08/2026" y
   "desde 01/06/2026". Ahora son relativas: van como plazos o se sacan.
6. **Líneas 8 y 260.** Son la fecha del ensayo de la 6.09. **No se tocan**: son
   registro histórico de cuándo se ensayó, no una afirmación sobre la pantalla.

## Lo que hay que agregar al guion, no solo corregir

**La escena de FEFO ahora tiene tres lotes y eso es una mejora, no un estorbo.**
La tabla de Haloperidol muestra primero `HAL-VENCIDO` con sus 25 ampollas y su
indicador rojo, y recién después los dos vigentes.

- **La narración dice "el primer lote solo tiene 40"** y hay que corregirla a
  **"el primer lote vigente"**. Está acordado.
- **Conviene detenerse ahí un segundo**: hay 145 ampollas en el depósito y solo
  120 se pueden usar. Es el problema que el proyecto viene a resolver, visible en
  pantalla, y es la respuesta al jurado que pregunte cómo se sabe que FEFO
  descarta lo vencido.
- El total sigue diciendo **120 disponibles**, con el renglón rojo aparte.

# Qué sigue después

Las correcciones que quedan de la misma revisión, en el orden acordado:

1. **El orden por severidad al releer una consulta guardada.**
   `obtenerConsulta` ordena por `createdAt`, y todas las observaciones de una
   consulta se escriben en la misma transacción, así que comparten timestamp y el
   orden lo termina decidiendo Postgres. La 5.18 pide orden por severidad. Hoy no
   se nota porque las 1150 filas de la fuente son todas de severidad alta.
2. **Dos menores.** La validación de lote escrita dos veces:
   `validarDatosDeLote` dice existir para que la compartan `crearLote` y
   `crearLoteConIngreso`, pero `crearLote` conserva su propia copia en línea. Y
   los mensajes de error de los servicios, que llegan a la pantalla sin tildes.

Y después de todo eso, **ensayar el guion completo con la base sembrada y
cronometrar el recorrido**. El ensayo de la 6.09 verificó que el sistema hace lo
que el guion dice, no que entre en cinco minutos.

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

**Ojo con el orden de merge.** La 6.11 se abrió sobre la rama de la 4.18, porque
el seed usa las primitivas que esa tarea agregó. **La 4.18 se mergea primero**;
si entra sola la 6.11, el seed no compila.
