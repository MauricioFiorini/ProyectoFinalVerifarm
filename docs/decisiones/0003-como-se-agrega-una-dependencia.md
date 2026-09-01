# 0003 — Cómo se agrega una dependencia

**Fecha:** 2026-09-01
**Estado:** vigente

**Amplía la decisión 0002, no la reemplaza.** La 0002 sigue vigente entera: el
lock manda y el comando de arranque es `npm ci`. Lo que le faltaba era el otro
comando, el de agregar una dependencia, que es el que rompe el lock.

## Contexto

La 0002 cambió el comando de arranque y reparó `package-lock.json` una vez, en
la tarea 1.13. **La reparación duró un día.**

| Commit | Tarea | Qué le hizo al lock |
|---|---|---|
| `03aafb8` | 1.13 | Agregó **exactamente 2** nodos: `@emnapi/core` y `@emnapi/runtime` |
| `ca338f5` | 2.08 | Eliminó **exactamente esos 2**, y agregó 18 (`pg`, `@prisma/adapter-pg`, `@types/pg`, `dotenv` y transitivas) |

La simetría es la prueba de que no es mala suerte: es un comportamiento
reproducible de npm, y va a repetirse en cada alta de dependencia mientras no se
cambie el procedimiento.

El síntoma es el mismo de la vez pasada:

```
npm error code EUSAGE
npm error Missing: @emnapi/runtime@1.11.3 from lock file
npm error Missing: @emnapi/core@1.11.3 from lock file
```

## El mecanismo

Los dos paquetes que faltan no los pide nadie directamente. Los piden estos
tres, todos presentes en el lock:

| Paquete que los pide | Qué pide | Por qué no se instala acá |
|---|---|---|
| `@img/sharp-wasm32` | `@emnapi/runtime` | `optional` |
| `@tailwindcss/oxide-wasm32-wasi` | `@emnapi/core` y `@emnapi/runtime` | `optional`, `cpu: ["wasm32"]` |
| `@napi-rs/wasm-runtime` | ambos, como `peerDependencies` | llega por la misma rama |

Los tres son **paquetes opcionales de plataforma**. Ninguno se instala en
Windows x64, ni en Linux, ni en macOS: son la rama WebAssembly que arrastran
`sharp` —vía Next— y el binding de Tailwind.

Pero el lock **sí tiene que describirlos**, porque un `package-lock.json` es
multiplataforma por diseño: tiene que servir para que alguien en macOS ARM
instale lo mismo que alguien en Windows. Por eso conviven ahí los 27 nodos
`@img/sharp-*` que ninguna de las tres máquinas usa.

**La inconsistencia es que npm poda los hijos y deja los padres.** El lock queda
diciendo que `@img/sharp-wasm32` necesita `@emnapi/runtime@^1.11.3` y a la vez
sin ningún nodo `@emnapi/runtime` que lo satisfaga. Es una referencia colgada.

Los dos comandos reaccionan distinto, y ahí está todo el problema:

- **`npm ci` valida que el árbol esté completo**, encuentra la referencia
  colgada y aborta.
- **`npm install` no valida: reconcilia en silencio.** Le sigue instalando bien
  a todo el mundo. Por eso el daño sobrevive escondido hasta que alguien clona
  limpio, y por eso la primera vez pasó un día entero sin que nadie se enterara.

## No es cosa de una máquina

La primera hipótesis fue que la máquina de quien agregó las dependencias
resolvía un árbol distinto al de los demás, y que el lock terminaba describiendo
solo el suyo. **Es falsa, y se descartó con una prueba.**

En una misma máquina —Windows x64, la de Juan Pablo— y sobre una copia del lock
roto, `npm install --package-lock-only` **vuelve a agregar las dos entradas**. La
misma máquina produce los dos resultados según cómo se corra el comando. Si
fuera cuestión del árbol de una persona, eso no podría pasar.

Además, lo que se poda son ramas de `wasm32` y `freebsd`: plataformas que no usa
**ninguno** de los tres. No es que el lock describa la máquina de uno; es que
describe menos de lo que declara.

**Marcado explícitamente como inferencia, porque no se verificó:** lo que
distingue un `npm install` que las conserva de uno que las borra es,
probablemente, si hay un `node_modules` real en disco. `npm install` arma el
árbol ideal partiendo en parte de lo instalado, y esos paquetes wasm32 nunca
están; `--package-lock-only` no mira `node_modules` en absoluto y resuelve solo
contra el registro. Comprobarlo exige un `npm install` completo con
`node_modules` real, que no se corrió para no romper el entorno de trabajo. La
inferencia explica los dos resultados observados, pero es inferencia.

## Qué se verificó

Todo sobre copias del lock, en un directorio aparte, sin tocar el repositorio:

| Prueba | Resultado |
|---|---|
| `npm ci` con el lock de `ca338f5` | Falla, `EUSAGE`, las dos entradas faltantes |
| `npm install --package-lock-only` sobre ese lock | Reagrega `@emnapi/core` y `@emnapi/runtime` |
| Correrlo una segunda vez | md5 idéntico: **es idempotente** |
| `npm install tsx --save-dev --package-lock-only` | Agrega `tsx` **y las dos entradas siguen** |
| `npm ci --dry-run` sobre el lock resultante | `added 503 packages`, código 0 |

Y después, ya en la rama de esta tarea y con el lock reparado de verdad:

| Prueba | Resultado |
|---|---|
| Nodos que agrega el arreglo | 37 |
| Nodos que elimina | **0** |
| `npm ci` completo | Instala sin errores |
| Si `npm ci` reescribió el lock | No: mismo md5 antes y después |
| `npm run setup` y `npm run check` | Código 0 los dos |
| `npx --offline tsx --version` | `tsx v4.23.13`, resuelto local, sin red |

## Lo que no sirve, y por qué

Antes de llegar al flag se descartaron tres caminos:

- **`--include=optional` no ataca esto.** Controla si las dependencias
  opcionales se **instalan**, no cómo se escribe el lock. Y ya están incluidas
  por defecto: en las máquinas del equipo `omit` está vacío, `os` y `cpu` en
  `null`, y el repositorio no tiene `.npmrc`. La configuración no es la causa.
- **`--os` y `--cpu` existen, pero resuelven una plataforma objetivo distinta**
  —instalar para Linux desde Windows—, no todas a la vez. No es lo que hace
  falta.
- **`save-exact` en `.npmrc` sigue descartado**, por la misma razón que da la
  0002: fija las versiones que uno escribe en `package.json`, no los rangos
  flotantes de terceros, que es de donde viene esto. Fijar `tsx` sin `^` en
  `package.json`, como ya está fijado Prisma, es otra cosa y no reinstala esa
  configuración.

## Por qué la 1.13 no alcanzó

La 1.13 hizo dos cosas bien: reparó el archivo y cambió el comando de arranque.
**Le faltó la tercera**, y es la que importaba: el comando que rompe el lock no
es el de arrancar, es el de agregar una dependencia.

Su propio traspaso dejó escrita la conclusión correcta —comparar dos locks dice
si describen los mismos paquetes, no si alguno es instalable, y lo único que
responde eso es correr `npm ci`— pero **usó `npm ci` para diagnosticar y no lo
convirtió en un paso obligatorio**. Esta decisión termina esa frase.

## Decisión

**Para agregar o cambiar una dependencia, tres pasos, en este orden:**

```bash
npm install <paquete> --package-lock-only   # 1. reescribe el lock, no node_modules
npm ci                                      # 2. verifica que el lock sea instalable
npm run setup                               # (npm ci se llevo el cliente Prisma)
```

**Y recién entonces commitear**, que es el paso 3.

Cada paso tiene una razón distinta y ninguno reemplaza al otro:

1. **El flag** evita que el árbol local sesgue el lock, y deja un lock completo
   para las tres plataformas. Es idempotente.
2. **El `npm ci`** es el control. Es el único que distingue un lock instalable
   de uno que solo lo parece.
3. **Commitear al final** hace que el lock entre al repositorio ya probado.

**No se nombra un dueño de dependencias.** Se evaluó y se descartó: el problema
no fue que alguien se equivocara. Quien agregó `pg` y compañía corrió el comando
correcto para lo que quería hacer —el único uso que la 0002 le reserva a
`npm install`— y el lock se rompió igual. Poner un responsable concentra el
mismo error en una persona en vez de eliminarlo. Lo que ataca la causa es el
**cómo**, no el **quién**.

## Consecuencias

- **El lock crece, y está bien.** Incluye ramas de plataformas que nadie del
  equipo instala: 27 nodos `@img/sharp-*`, y desde esta tarea 25 nodos
  `@esbuild/*` más, que entran con `tsx`. Eso es exactamente lo que lo hace
  multiplataforma. Un lock más chico sería un lock que miente.
- **Más superficie para el mismo problema.** `tsx` trae `esbuild`, que es otro
  paquete con binarios opcionales por plataforma. Sin el procedimiento, la
  próxima rotura sería más grande.
- **`--package-lock-only` no instala nada.** Después del paso 1 el
  `node_modules` sigue como estaba: por eso el paso 2 no es opcional, ni siquiera
  cuando uno cree saber que el lock quedó bien.
- **`npm ci` borra `node_modules` entero** y con él el cliente Prisma, así que el
  `npm run setup` va siempre después. La decisión 0001 no se toca.
- **La 0002 no cambia.** `npm ci` sigue siendo el comando de arranque y
  `npm install` sigue reservado para agregar o cambiar una dependencia a
  propósito. Esta decisión solo le agrega el flag y el control posterior.
- Si en alguna versión futura npm deja de podar esas entradas, el procedimiento
  sigue siendo correcto: el paso 2 pasaría a no encontrar nunca nada, que es el
  resultado que uno quiere de un control.
