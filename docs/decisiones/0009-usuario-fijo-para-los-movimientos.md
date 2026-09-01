# 0009 — Usuario fijo del seed para los movimientos de stock

**Fecha:** 2026-09-01
**Estado:** vigente

**Cierra la decisión abierta D7.**

## Contexto

`MovimientoStock.usuarioId` es obligatorio y tiene relación con `Usuario`. Pero
la autenticación está fuera del alcance del prototipo por decisión escrita
(`docs/CONTEXTO.md` sección 6), así que no hay ninguna sesión de la cual sacar el
usuario que registra un movimiento.

## Decisión

**Se usa un usuario fijo del seed, referenciado desde una constante en el
servicio**, con un comentario que diga que se reemplaza cuando entre la
autenticación.

Es la salida más barata de las que se evaluaron, y no deja deuda escondida: la
constante es el único lugar a tocar el día que haya sesión, y el comentario dice
exactamente eso.

No se hace opcional el campo ni se relaja la relación: el historial de
movimientos es un libro mayor y cada asiento tiene que tener autor, aunque en el
prototipo sea siempre el mismo.

## Qué se verificó, y por qué importa

El seed crea los usuarios con `@default(uuid())`, sin `id` explícito. **Eso
significa que el id cambia en cada corrida.** Comprobado ejecutando el seed dos
veces seguidas contra la base local:

```
primera corrida:  01efb636-84a4-4557-a34c-b7949beaea8c | Admin Sistema
segunda corrida:  ff3d97ca-acbe-42a8-b2dc-89228c28fdbf | Admin Sistema
```

Una constante con un UUID pegado **se rompe la primera vez que alguien vuelve a
sembrar**, y el error va a ser una violación de clave foránea que no menciona ni
al seed ni a la constante. Es de los que cuestan una tarde.

## Cómo se implementa

1. **Darle `id` explícito y fijo** al usuario del seed que se va a usar. Un UUID
   escrito a mano, constante entre corridas.
2. **Una sola constante**, en un solo archivo, apuntando a ese id.
3. **El comentario al lado**, diciendo que se borra cuando entre la
   autenticación.

El usuario elegido es el farmacéutico (`farmacia@verifarm.com`), que es quien
registra ingresos y egresos en el dominio real.

## Consecuencias

- **No hace falta migración**: el esquema no cambia, cambia el dato del seed.
- **Hay que corregir el seed**, que es parte de la tarea **2.11**, junto con las
  decisiones 0006 y 0008. Es el mismo archivo.
- **Desbloquea la 4.02** y con ella el resto de la fase 4.
- Si más adelante el seed se rehace de cero —la tarea 6.06 lo hace—, ese `id`
  fijo tiene que sobrevivir. Conviene que la constante y el seed se lean uno al
  lado del otro.
