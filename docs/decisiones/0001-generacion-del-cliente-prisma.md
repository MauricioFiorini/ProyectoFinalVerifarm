# 0001 — La generación del cliente Prisma no va en un `postinstall`

**Fecha:** 2026-08-31
**Estado:** vigente

## Contexto

En una máquina donde el proyecto nunca corrió hacen falta tres pasos que no hace
ningún comando: crear el `.env`, usar el puerto 5433 y correr `npx prisma
generate` a mano. El tercero es el peor de los tres.

npm 11 bloquea por defecto los scripts de instalación **de las dependencias**,
así que el `postinstall` de Prisma —el que genera el cliente— no corre. La
instalación termina bien y el problema aparece mucho después, como un error de
TypeScript que no nombra ni a npm ni a Prisma:

```
Module '"@prisma/client"' has no exported member 'PrismaClient'
```

La causa real está a tres saltos del síntoma: `@prisma/client` es una sola línea
que reexporta `.prisma/client/default`, y ese archivo lo escribe `prisma
generate`.

La salida natural era un `postinstall` en el `package.json` del proyecto, que sí
corre bajo npm 11 —el bloqueo es para las dependencias, no para el paquete raíz—
y que además es lo que recomienda la documentación de Prisma para este caso.

## Qué se probó

Clon limpio, Node 24.20.0, npm 11.19.0, con `"postinstall": "prisma generate"`
agregado a `package.json`.

**Falló.** El script arranca, pero `prisma generate` carga `prisma.config.ts`,
que resuelve `env("DATABASE_URL")` al construir la datasource. Sin `.env`
todavía creado, aborta:

```
PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL
```

Y como el `postinstall` falla, **falla el `npm install` entero**.

El resultado es peor que el problema que venía a resolver. Hoy la instalación
termina y el error aparece después, cuando ya se puede leer la documentación y
crear el `.env`. Con el `postinstall`, quien clone y corra `npm install` por
instinto —antes de crear el `.env`, que es lo que hace cualquiera— se traba en
la instalación misma, sin haber llegado a tener un proyecto instalado.

## Decisión

**No se usa `postinstall`.** La generación del cliente queda en un script
explícito, `npm run setup`, que se corre después de `npm install` y con el
`.env` ya creado, y que verifica el entorno antes de generar: si falta el `.env`
o `DATABASE_URL` está vacía, corta con un mensaje que dice qué hacer, en vez de
dejar salir el `PrismaConfigEnvError`.

El orden de arranque en un clon limpio queda fijado así, y es el que está
documentado:

```
cp .env.example .env    # y completar DATABASE_URL
npm install
npm run setup
```

## Consecuencias

- **`npm install` sigue siendo pasivo.** No genera nada, no arranca nada y no
  puede fallar por el entorno. Es una propiedad que se elige a propósito.
- **Hay un comando más que conocer.** El costo se paga documentándolo en
  `docs/CONVENCIONES.md` (secciones 11 y 12), en los pasos previos de la tarea
  1.11 del roadmap y en el traspaso.
- **Las trampas conocidas de `docs/CONVENCIONES.md` sección 14 siguen haciendo
  falta.** Son la red para quien corra los comandos sueltos, o para quien tenga
  `ignore-scripts=true` en su `.npmrc`, donde ningún script corre.
- **`npm run setup` sirve además a partir de la fase 2.** Cada cambio de
  `prisma/schema.prisma` obliga a regenerar el cliente, así que el mismo comando
  cubre el clon limpio y la puesta al día después de un `git pull`.
- Si alguna vez `prisma.config.ts` deja de resolver la URL de entrada, o Prisma
  cambia ese comportamiento, el `postinstall` vuelve a ser viable. En ese caso
  se escribe una decisión nueva que reemplace a esta: **las decisiones no se
  editan.**
