# 0002 — El lock manda: el comando de arranque es `npm ci`

**Fecha:** 2026-08-31
**Estado:** vigente

## Contexto

El 2026-08-31, el commit `35559a5` movió 184 líneas de `package-lock.json` sin
que su autor lo pidiera ni lo notara. El mensaje del commit decía `docs:` y el
trabajo era, efectivamente, documentación: el lock viajó de polizón.

**No fue un error de quien commiteó.** Corrió `npm install`, que es el comando
que decía la documentación del proyecto, y `npm install` tiene permiso para
reescribir el lock. Esa es su definición, no un efecto secundario:

| | `npm install` | `npm ci` |
|---|---|---|
| De dónde saca el árbol | Resuelve los rangos de `package.json` | Del lock, literal |
| ¿Reescribe el lock? | **Sí**, si encuentra algo más nuevo | Nunca |
| Si el lock y `package.json` no coinciden | Los reconcilia en silencio | Falla y avisa |
| `node_modules` | Lo parcha | Lo borra y lo rehace |

## Qué se verificó

La primera lectura fue tranquilizadora y **equivocada**. Comparando los dos
locks entrada por entrada, en vez de por líneas de diff:

```
563 entradas antes  →  563 entradas después
```

Ninguna dependencia real cambiaba. Las únicas cinco diferencias eran
`@emnapi/core`, `@emnapi/runtime` y `@emnapi/wasi-threads`, que dejaban de estar
izadas arriba y pasaban a estar anidadas bajo
`@unrs/resolver-binding-wasm32-wasi` —el binding WASM opcional que arrastra
ESLint—, más un salto de `1.2.1` a `1.2.3`. Ni Next, ni React, ni Prisma se
movían un dígito. Parecía ruido cosmético.

**No lo era.** Al probar `npm ci` de verdad, el lock nuevo no se puede instalar:

```
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and
npm error package-lock.json are in sync.
npm error Missing: @emnapi/runtime@1.11.3 from lock file
npm error Missing: @emnapi/core@1.11.3 from lock file
```

Los dos locks, probados en directorios limpios:

| Lock | `npm ci` |
|---|---|
| El anterior a `35559a5` | `added 482 packages` |
| El de `35559a5` | **falla, EUSAGE** |

O sea que `35559a5` dejó el lock internamente inconsistente, y **el problema
sobrevivió escondido justamente por el comportamiento que esta decisión viene a
eliminar**: `npm install` reconcilia en silencio, así que a los tres les seguía
instalando bien y nadie se enteró.

**La lección, que es la parte reutilizable de todo esto:** comparar dos locks
dice si describen los mismos paquetes, no si alguno de los dos es instalable.
Lo único que responde esa pregunta es correr `npm ci`.

## Sobre revertir el archivo

La reacción inicial fue revertir el lock, y se descartó con el argumento de que
la causa era el comando y no el archivo: el próximo `npm install` de cualquiera
lo habría vuelto a mover. **Ese argumento sigue en pie, pero era incompleto.**
Revertir sí habría devuelto un lock instalable, cosa que en ese momento nadie
sabía que hacía falta.

Las dos cosas son ciertas y hacen falta las dos: reparar el archivo **y**
cambiar el comando. Reparar sin cambiar el comando deja el problema listo para
repetirse; cambiar el comando sin reparar deja un repositorio donde el comando
nuevo no corre.

## Decisión

**El arranque y la puesta al día usan `npm ci`.** El lock deja de ser una
sugerencia y pasa a ser lo que dice ser: la definición del árbol de
dependencias, igual en las tres máquinas.

**`npm install` no desaparece: cambia de rol.** Queda para agregar o cambiar una
dependencia **a propósito**, que es el único momento en que el lock tiene que
cambiar. Ahí el cambio del lock es el punto del commit, no un polizón.

```bash
npm ci                     # arranque y puesta al dia
npm run setup              # y siempre despues, que npm ci borra node_modules

npm install <paquete>      # solo para agregar o cambiar una dependencia
```

**El lock se regenera una vez, en la tarea 1.13**, con un `npm install`
deliberado —el primer uso del rol nuevo— y se verifica con `npm ci` antes de
commitearlo. Sin esa reparación el comando nuevo no arranca.

## Consecuencias

- **`npm ci` borra `node_modules` entero.** Es más lento que un `install`
  incremental, y obliga a correr `npm run setup` después. Ese orden ya era el
  documentado por la decisión 0001, así que en la práctica no cambia nada.
- **`npm ci` falla si el lock y `package.json` se desincronizan**, en vez de
  arreglarlo callado. Es la ventaja principal, no un costo: es exactamente lo
  que dejó pasar el lock roto durante un día entero.
- **npm 11 sigue bloqueando los scripts de instalación de las dependencias con
  `npm ci` igual que con `npm install`.** El cliente de Prisma se sigue
  generando con `npm run setup`. La decisión 0001 no se toca.
- **Un `git pull` que traiga un lock distinto ahora obliga a un `npm ci`
  completo**, no a un `install` incremental. Es el precio de que los tres tengan
  el mismo árbol.
- **No se agrega `save-exact` ni nada en `.npmrc`.** Fija las versiones que uno
  escribe en `package.json`, no los rangos flotantes de las dependencias de
  terceros, que es de donde vino esto. No resuelve el problema.
- Si alguna vez el proyecto necesitara que `npm install` sea el comando de
  arranque —por ejemplo si se adoptara otro gestor de paquetes con otras
  reglas—, se escribe una decisión nueva que reemplace a esta: **las decisiones
  no se editan.**
