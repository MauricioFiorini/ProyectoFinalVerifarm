# VERIFARM — Traspaso

**Estado del último bloque de trabajo.** Este archivo se sobrescribe en cada
traspaso: siempre muestra el último. Los anteriores quedan en el historial de
git (`git log --follow docs/TRASPASO.md`).

Quien retoma el proyecto lee **primero este archivo**, después `docs/ROADMAP.md`.

Ubicación en el repo: `docs/TRASPASO.md`

---

## Traspaso vigente

**Fecha:** 2026-09-07
**Entrega:** Mauricio Mateo Fiorini
**Rama:** `feat/4.03-logica-de-stock` (**sin mergear**)
**Commit:** de `792907c` a `377455a`, más el que trae este traspaso

### Qué se hizo

**Toda la lógica de la fase 4: de la 4.03 a la 4.10.** Con la 4.01 y la 4.02 ya
en `main`, el módulo de stock está completo por dentro: se calculan saldos, se
registran movimientos, funciona FEFO y hay API para todo. **Falta la interfaz**,
que es de la 4.11 a la 4.17.

| Commit | Tarea | Qué dejó |
|---|---|---|
| `792907c` | 4.03 | Stock por medicamento, sumando lotes no vencidos |
| `9838dc1` | 4.04 | `movimientos.ts`: ingreso y egreso en transacción |
| `c951552` | 4.05, 4.06 | Consultas de stock bajo y vencimientos próximos |
| `6ffbed7` | 4.07 | **`fefo.ts`: el motor, como función pura** |
| `09451fb` | 4.08, 4.09 | `dispensacion.ts`: previsualizar y ejecutar |
| `377455a` | 4.10 | Endpoints de lotes, movimientos y dispensación |

### La verificación de FEFO, que el roadmap pide anotar

**Los cinco casos borde**, con fecha de referencia 2026-09-07:

| Caso | Pedido | Plan que devuelve | ¿Correcto? |
|---|---|---|---|
| 1 — un solo lote alcanza | 60 | `60×A` | ✅ |
| 2 — reparto entre dos | 100 | `60×A + 40×B` | ✅ |
| 3 — lote vencido se ignora | 30 | `30×B` (el vencido con 500 no entra) | ✅ |
| 4 — la existencia no alcanza | 100 | `30×A + 25×B`, cubre 55, **falta 45** | ✅ |
| 5 — dos vencen el mismo día | 60 | `40×A + 20×Z` | ✅ |

**El caso 5 se verificó además pasando los lotes en los dos órdenes posibles**, y
el plan sale idéntico: el desempate por número de lote hace que el resultado no
dependa de cómo los devuelva la base.

Casos extra que también se pasaron: lote con disponible cero se ignora; un lote
que vence **hoy** todavía sirve; sin lotes elegibles devuelve plan vacío con el
faltante completo; y reparto entre tres lotes.

**Contra la base**, con dos lotes de un mismo medicamento:

- El lote que **entró después pero vence antes sale primero**. Es la prueba de
  que es FEFO y no FIFO, que es medio proyecto.
- Previsualizar **no escribe**: el stock quedó igual antes y después.
- Ejecutar crea **un movimiento por línea del plan**.
- Una dispensación que falla **no deja ningún movimiento**.

**Por HTTP**, contra el servidor levantado: previsualizar responde 200 con
`ejecutado: false`; ejecutar responde 201; pedir de más responde **422** con el
mensaje "se pidieron 500 y hay 160 disponibles en lotes vigentes".

### Decisiones tomadas sobre la marcha

**El motor FEFO vive en su propio archivo y no toca nada.** No lee la base, no
lee el reloj —la fecha entra por parámetro— y no escribe. No es elegancia: como
el prototipo no lleva pruebas automatizadas, la verificación es a mano, y una
función pura se verifica con datos inventados sin levantar Docker.

**Se corrigió un defecto que apareció verificando.** La primera versión devolvía,
para una cantidad inválida, un plan vacío con `faltante: 0`, y eso hacía que
pedir **−5 unidades diera "alcanza: true"**. Un plan inválido que se declara
exitoso es peor que un error, porque se propaga en silencio. Ahora el motor corta
con `RangeError`; la validación de lo que escribe una persona la hace
`dispensacion.ts` con `ErrorDeNegocio`, así que ese error nunca le llega a un
usuario.

**El desempate de vencimientos es explícito.** Si dos lotes vencen el mismo día
se ordena por número de lote, y por id si hiciera falta. Sin eso, el mismo pedido
podría producir dos planes distintos en dos corridas, y una demostración que no
se repite igual es un problema en una defensa.

**Las transacciones son SERIALIZABLE.** Un egreso primero LEE lo disponible y
después ESCRIBE; entre esas dos cosas otro egreso podría colarse, y los dos
dejarían el lote en negativo sin que ninguno haya hecho nada mal por su cuenta.
En un prototipo de un solo usuario no va a pasar; se hizo igual porque el
invariante es del dominio y no de la cantidad de usuarios.

**Al ejecutar se vuelve a planificar dentro de la transacción.** El plan que vio
la persona se calculó antes de que apretara "Confirmar", y en el medio pudo
entrar otro egreso. Reusar aquel plan sería escribir sobre una foto vieja.

**Un solo endpoint para previsualizar y ejecutar**, con `ejecutar` en el cuerpo y
**`false` por defecto**: olvidarse el campo previsualiza, nunca escribe por
descuido. Es lo que necesita el modal de la 4.14, que primero muestra el plan y
recién al confirmar lo ejecuta.

**`/api/movimientos` solo tiene POST.** No hay PUT ni DELETE y no se van a
agregar: el historial es un libro mayor y un error se corrige con un movimiento
nuevo.

**Un lote que vence hoy todavía sirve.** El vencimiento es una fecha, no una
hora: si se comparara contra el instante actual, un lote pasaría a estar vencido
a mitad de la mañana.

### Qué quedó sin hacer

- **La rama no está mergeada.** Otra persona le tiene que pasar el ojo, y en este
  caso conviene que mire con atención `fefo.ts`.
- **Toda la interfaz de la fase 4: de la 4.11 a la 4.17.** Hoy el módulo de stock
  se puede usar entero por API, pero no tiene ninguna pantalla.
- **`obtenerVencimientosProximos` no devuelve los lotes YA vencidos**, solo los
  que vencen dentro de N días. Es lo que pide la tarea, y está anotado en el
  código. Si el equipo decide que un lote vencido con unidades encima también
  tiene que aparecer en la alerta, es un cambio de criterio y hay que escribirlo.
- **No hay endpoint de stock bajo ni de vencimientos próximos.** Los servicios
  existen; la 4.10 pedía lotes, movimientos y dispensación. Los va a necesitar la
  pantalla de inicio, que es la 6.03.

### Cómo verificarlo

Los servicios se probaron con scripts temporales que se borraron después, y los
endpoints con `curl` contra `npm run dev`. Todos los datos de prueba se
eliminaron: la base quedó con **0 lotes y 0 movimientos**.

Para repetirlo, con la base levantada:

```
# alta de lote
curl -X POST localhost:3000/api/lotes -H "Content-Type: application/json" \
  -d '{"medicamentoId":"…","numeroLote":"L-1","fechaIngreso":"2026-09-01","fechaVencimiento":"2026-11-15"}'

# ingreso
curl -X POST localhost:3000/api/movimientos -H "Content-Type: application/json" \
  -d '{"loteId":"…","tipo":"INGRESO","cantidad":60}'

# previsualizar (no escribe)
curl -X POST localhost:3000/api/dispensaciones -H "Content-Type: application/json" \
  -d '{"medicamentoId":"…","cantidad":100}'

# ejecutar
curl -X POST localhost:3000/api/dispensaciones -H "Content-Type: application/json" \
  -d '{"medicamentoId":"…","cantidad":100,"ejecutar":true}'
```

`npm run check` da 0 después de cada tarea.

### Qué sigue

**El merge**, y después la interfaz del módulo de stock, de la **4.11** a la
4.17. El camino es 4.11 (pantalla `/stock`) → 4.12 (lotes de un medicamento) →
4.13 (modal de ingreso) → **4.14 (modal de dispensación FEFO)** → 4.15 (aviso de
existencia insuficiente) → 4.16 (historial) → 4.17 (indicadores de vencimiento).

La 4.14 es la que muestra el plan —"60 del lote A, vence 03/2027 · 40 del lote B,
vence 11/2027"— y **ya tiene todo lo que necesita**: el endpoint devuelve
exactamente eso.

### Antes de arrancar, tener en cuenta

- **Si tocás `fefo.ts`, hay que volver a pasar los cinco casos borde y anotar el
  resultado en el PR.** Es lo único que hay en lugar de pruebas automatizadas.
- **Un servicio que lanza `new Error` pelado se responde como 500.** Los errores
  del dominio van con `ErrorDeNegocio`, que lleva código y campo.
- **El disponible se calcula, nunca se lee de una columna.** Si en algún momento
  hace falta una consulta rápida, se optimiza la consulta; no se agrega columna.
- **Para listar varios lotes con su disponible está `obtenerDisponiblePorLote`**,
  que resuelve todos en una consulta. Pedirlo lote por lote son N consultas.
- **La dispensación no confía en el plan que le manden**: siempre replanifica.
  Cualquier endpoint nuevo que ejecute movimientos tiene que hacer lo mismo.
- **El puerto sigue siendo el 5433** y Docker Desktop no arranca solo.
- **Después de cambiar el esquema, `npm run setup` antes de `npm run check`.**

### Bloqueos

**Ninguno.** D8 sigue abierta y no bloquea ninguna tarea.
