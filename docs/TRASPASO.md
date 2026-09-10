# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

## Traspaso vigente

**Fecha:** 2026-09-10
**Entrega:** Juan Pablo Malizani
**Rama:** `fix/6.13-paciente-para-el-tercer-estado`, con la 6.13 terminada. La
reserva ya está en `main`.

# La 6.13 — el paciente que faltaba, terminada

**El prototipo sigue completo.** No es alcance nuevo: es el hueco que dejó
anotado el ensayo de la 6.09 al final de `docs/GUION_DEMOSTRACION.md`, en "Dos
cosas que el equipo debería mirar". Vive en "Correcciones posteriores al cierre
de la fase" de la fase 6.

| Tarea | Estado | Qué dejó                                                    |
| ----- | ------ | ----------------------------------------------------------- |
| 6.13  | `[x]`  | `PAC-105` en el seed y la escena en el guion. **Falta mergear.** |

## Lo primero, si vas a ensayar

Igual que antes: **cualquier ensayo arranca sembrando de nuevo**, porque el guion
afirma números que se mueven en cuanto alguien dispensa o evalúa.

```bash
docker compose up -d
npx prisma db seed
npm run dev
```

**La base de esta máquina quedó sembrada con el seed nuevo**, ya con `PAC-105` y
sin la consulta de prueba que se usó para verificar.

**Ojo con el selector de rol.** Vive en el `localStorage` del navegador y no lo
resetea ni el seed ni `npm run setup`. Se corrige a mano desde la barra superior.

**Y ojo con Docker.** En esta máquina Docker Desktop no arranca solo: hay que
abrirlo antes de `docker compose up -d`, o el comando falla con un error de
`pipe/dockerDesktopLinuxEngine` que no dice lo que está pasando.

## Qué faltaba, en una línea

El módulo clínico tiene **tres** respuestas posibles y la demostración solo podía
enseñar **dos**: "se encontraron interacciones" con `PAC-101` y `PAC-102`, y "sin
datos en la fuente" con `PAC-103`. Faltaba **"se revisó y no hay nada"**, que es
justamente la que prueba que el sistema distingue haber revisado de no haber
podido revisar. `PAC-104` no servía: Paracetamol y Amoxicilina tienen cero
cobertura, así que da "sin datos", igual que el 103.

Ahora está `PAC-105`, **Carbamazepina + Fluoxetina**.

## El par, verificado contra la base y no supuesto

Es lo que pedía la tarea, y es lo que hay que repetir si alguien cambia el par:

```
medicamentos:   Carbamazepina rxcui 2002 · Fluoxetina rxcui 4493
con cobertura:  2002 y 4493   -> las dos figuran en ONCHigh
interacciones:  0             -> el cruce se hace y da vacio
```

Con la base sembrada, los cinco pacientes dan las tres respuestas:

```
PAC-101   INTERACCIONES (1)              Sertralina + Tranilcipromina
PAC-102   INTERACCIONES (1)              Haloperidol + Tioridazina
PAC-103   SIN DATOS EN LA FUENTE         las dos SIN_COBERTURA
PAC-104   SIN DATOS EN LA FUENTE         las dos SIN_COBERTURA
PAC-105   REVISADO Y SIN INTERACCIONES   las dos EVALUADO
```

## `PAC-105` no lleva consulta registrada, y es a propósito

La fila del roadmap decía al reservar la tarea que iba con su consulta. **Se
cambió al verificar**, por dos razones:

- **La tarjeta de "consultas del día" dice 2** y el guion lo afirma en su acto 1.
  Una consulta más la mueve a 3, y esa afirmación ya había costado una corrección
  en el ensayo de la 6.09.
- **`PAC-103` tampoco la lleva** y su escena funciona: la demostración evalúa en
  vivo desde la ficha del paciente. `PAC-105` hace lo mismo.

Ningún número del guion cambió. Se verificó: consultas registradas, 2.

## Lo que se verificó en pantalla, no solo por API

Es la razón por la que esta tarea estaba pendiente: no alcanzaba con que
compilara. Las tres pantallas se renderizaron con el navegador y se miraron.

- **La ficha de `PAC-105`.** Las dos filas dicen **"Se evalúa"**, sin ninguna
  marca de cobertura. Es el contraste directo con `PAC-103`.
- **La pantalla de selección.** No aparece ningún aviso al pie, solo _"Se
  cargaron los 2 medicamentos vigentes de PAC-105"_. En `PAC-103` esa misma
  pantalla está llena de advertencias.
- **El resultado.** Dice _"No se encontraron interacciones registradas entre los
  medicamentos evaluados"_ **y nada más**: el bloque ámbar no aparece. Debajo,
  "Medicamentos evaluados: Carbamazepina · Fluoxetina".

**Ojo con verificar esto por `curl`: no se puede.** Las pantallas cargan los datos
en el cliente, así que el HTML que devuelve el servidor no trae ninguno de esos
textos. Es la misma deuda del `setTimeout` que sigue abierta. Hay que renderizar
con un navegador de verdad.

## Qué cambió en el guion

**La escena nueva son los pasos 11 a 13 del acto 3**, después del contraste de
`PAC-103`, con su "Qué decir". Está escrita para que se entienda que la pantalla
es casi idéntica a la anterior y significa lo contrario.

**Queda marcada como el primer recorte si el reloj aprieta.** Es el paso más
corto del acto, pero **no está cronometrada**: el ensayo de la 6.09 verificó que
el sistema hace lo que el guion dice, no que entre en cinco minutos, y esta
escena suma tiempo a un acto que ya tenía su ventana llena.

También se tocaron dos cosas más:

- **El cronograma**, cuya fila del acto 3 decía "interacciones severas y
  cobertura" y ahora dice "las tres respuestas posibles".
- **El registro del ensayo de la 6.09**, donde la observación que pedía este
  paciente quedó marcada como resuelta. **No se borró.** El registro es lo que el
  ensayo encontró y no se reescribe: se le agregó abajo que la 6.13 lo resolvió.

# Qué queda pendiente

**Una sola tarea**, más el merge de esta.

## 1. Mergear la 6.13

La rama está terminada y `npm run check` pasa limpio. Falta el PR y que otro le
pase el ojo.

## 2. El orden por severidad al releer una consulta guardada

**Sigue sin tomar y no tiene número todavía.** Le tocaría **5.22**, que es el
número libre de la fase 5.

`obtenerConsulta` en `src/services/consultas.ts` ordena las observaciones por
`createdAt`. Todas las de una consulta se escriben en la misma transacción, así
que **comparten timestamp** y el orden lo termina decidiendo Postgres. La tarea
5.18 pide orden por severidad.

**Hoy no se ve**, porque las 1150 filas de ONCHigh son todas de severidad alta.
Se va a ver el día que entre una fuente con grados, y entonces va a ser un
defecto intermitente y difícil de reproducir. El motor ya devuelve la lista
ordenada al crear la consulta; lo que falta es imponer ese mismo orden al
releerla. `ORDEN_DE_SEVERIDAD` ya está escrito en
`src/services/interacciones.ts`.

**No toca el seed**, así que no choca con nada de la 6.13.

# Y después

**Ensayar el guion completo con la base sembrada y cronometrar el recorrido**,
ahora con la escena nueva adentro. Es lo que va a decir si `PAC-105` entra en los
cinco minutos o si hay que recortarlo. Y **repartir
`docs/PREGUNTAS_PREVISIBLES.md`** para que los tres respondan lo mismo.

## Lo que sigue anotado y nadie tomó

**16 de los 25 medicamentos están en cero.** La pantalla de stock se lee como un
sistema sin cargar. Es la segunda observación del ensayo de la 6.09, sigue
abierta y **no tiene tarea**. Hay una respuesta preparada en
`docs/PREGUNTAS_PREVISIBLES.md`, pero se resuelve mejor en el seed.

**La fila 6.11 del roadmap tiene una línea en blanco antes de la 6.12**, así que
la tabla de correcciones de la fase 6 se parte en dos al renderizar. Se vio al
agregar la 6.13 y **no se tocó**: no es parte de esta tarea. Es un renglón.

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
- **Un par nuevo en el seed se verifica contra la base**, con
  `rxcuisConCobertura` y `evaluarInteracciones`. Suponer que dos drogas no
  interactúan es exactamente lo que la regla 6 prohíbe.
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
