import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Cliente Prisma unico para toda la aplicacion.
//
// En desarrollo, Next.js recarga los modulos en cada cambio. Si el cliente se
// creara con un `new PrismaClient()` suelto, cada recarga abriria un pool de
// conexiones nuevo y PostgreSQL terminaria rechazando conexiones despues de un
// rato de trabajo. Por eso se guarda la instancia en `globalThis`, que las
// recargas no limpian, y se reutiliza.
//
// En produccion no hace falta: el modulo se evalua una sola vez.
//
// Desde Prisma 7 esto importa MAS, no menos: el pool ya no lo maneja Prisma por
// dentro, lo creamos aca con `new Pool()`. Cada recarga sin este singleton seria
// un pool de `pg` nuevo y abierto, que nadie cierra.
//
// El adaptador no es opcional. Prisma 7 no se conecta sin el: si falta, el
// cliente corta con "PrismaClient requires a driver adapter to connect to your
// database". El porque, y por que estan `pg`, `@prisma/adapter-pg`, `@types/pg`
// y `dotenv` en un stack declarado cerrado, esta en
// `docs/decisiones/0004-el-driver-adapter-de-prisma-7.md`.
const globalParaPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function crearClientePrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalParaPrisma.prisma ?? crearClientePrisma();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = db;
}
