# 0004 — El driver adapter de Prisma 7 y las cuatro dependencias que trae

**Fecha:** 2026-09-01
**Estado:** vigente

## Contexto

`docs/CONVENCIONES.md` declara el stack **cerrado**: Next.js, TypeScript,
Prisma, Tailwind y Zod. Entre la tarea 2.08 y la 3.01 entraron cuatro
dependencias que no están en esa lista:

| Dependencia | Tipo | Para qué |
|---|---|---|
| `pg` | producción | El driver de PostgreSQL para Node. Es quien abre las conexiones. |
| `@prisma/adapter-pg` | producción | El adaptador que le presenta ese driver a Prisma. |
| `@types/pg` | desarrollo | Los tipos de `pg`, que el paquete no trae. Sin esto, `tsc` no compila. |
| `dotenv` | desarrollo | Cargar el `.env` en los scripts que corren fuera de Next. |

Entraron sin decisión escrita. **Están bien**, pero un stack declarado cerrado
más cuatro dependencias sin justificar es exactamente la situación en la que
alguien —persona o asistente— las saca "para simplificar" y rompe el arranque.

## El adaptador no es una preferencia: sin él Prisma 7 no se conecta

Esto no se tomó de la documentación ni de memoria. Está **verificado contra el
paquete instalado**, `@prisma/client@7.10.0`, en su runtime:

```
PrismaClient requires a driver adapter to connect to your database,
but none was provided.

PrismaClient was instantiated without any options.
A driver adapter is required to connect to your database.
```

Son los dos mensajes con los que el cliente corta si se lo instancia con un
`new PrismaClient()` suelto, como se hacía en Prisma 6.

Hay una segunda evidencia dentro del propio repositorio, y es la que explica por
qué no hay ninguna otra salida: el bloque `datasource` de `prisma/schema.prisma`
**no tiene `url`**.

```prisma
datasource db {
  provider = "postgresql"
}
```

La URL vive en `prisma.config.ts`, que es donde la 7 la espera. Eso alcanza para
la CLI —`migrate`, `generate`, `db seed`—, pero el cliente generado que corre
dentro de la aplicación no lee ese archivo. Sin `url` en el esquema y sin
adaptador, el cliente no tiene de dónde sacar la conexión.

## Por qué son cuatro y no una

- **`@prisma/adapter-pg` no trae el driver.** Es la pieza de traducción: espera
  que le pasen un `Pool` de `pg` ya construido. Por eso `pg` es dependencia de
  producción y no una transitiva que venga sola.
- **`@types/pg` es aparte porque `pg` no publica sus tipos.** Sin él,
  `import { Pool } from "pg"` falla en `tsc --noEmit`, o sea que `npm run check`
  no pasa. Va en desarrollo: los tipos no existen en tiempo de ejecución.
- **`dotenv` está porque Prisma 7 ya no carga el `.env` solo.** Next sí lo carga,
  así que la aplicación no lo necesita; lo necesitan `prisma.config.ts` y
  `prisma/seed.ts`, que corren fuera de Next. Es la misma razón que ya estaba
  documentada en la sección 11 de `CONVENCIONES.md`.

## Decisión

**Las cuatro se quedan, y el stack cerrado se lee con esta excepción anotada.**

`pg` y `@prisma/adapter-pg` no son una biblioteca nueva en el sentido que la
regla del stack cerrado quiere evitar: no agregan una forma de hacer las cosas
ni compiten con nada del stack. Son **el mecanismo de conexión de Prisma 7**,
que en la 6 venía adentro del cliente y en la 7 se sacó afuera. Sacarlas no
simplifica: rompe.

**El cliente se instancia en un solo lugar, `src/lib/db.ts`**, y ese archivo
lleva el comentario que lo explica. Nadie construye un `PrismaClient` por su
cuenta en otro archivo.

**`prisma/seed.ts` es la única excepción**, y es deliberada: corre fuera de Next,
como proceso suelto, y necesita cerrar su pool con `pool.end()` para no quedarse
colgado. Importar el singleton de la aplicación ahí traería el `globalThis` y el
manejo de recargas de Next a un script que no los usa.

## Consecuencias

- **El pool de conexiones ahora es responsabilidad del proyecto, no de Prisma.**
  Lo creamos nosotros con `new Pool()`. Por eso el singleton de `globalThis` en
  `src/lib/db.ts` importa más que en Prisma 6, no menos: sin él, cada recarga de
  Next en desarrollo dejaría un pool abierto que nadie cierra.
- **Cualquier script que corra fuera de Next tiene que importar `dotenv/config`
  antes de leer `process.env.DATABASE_URL`.** `prisma/seed.ts` y
  `prisma.config.ts` ya lo hacen.
- **`src/lib/db.ts` hoy no importa `dotenv/config`**, y dentro de Next no hace
  falta. Pero si alguna vez un script fuera de Next importa ese módulo,
  `DATABASE_URL` va a llegar `undefined` y `pg` va a intentar conectarse a sus
  valores por defecto en vez de fallar con un error claro. Queda anotado como
  cosa a mirar si aparece ese caso; no se cambia ahora porque hoy nadie lo hace.
- **Estas cuatro no habilitan agregar otras.** El stack sigue cerrado y las altas
  siguen el procedimiento de la sección 11 de `CONVENCIONES.md`.
- Si Prisma volviera a integrar el driver, o el proyecto cambiara de motor de
  base, se escribe una decisión nueva que reemplace a esta. **Las decisiones no
  se editan.**
