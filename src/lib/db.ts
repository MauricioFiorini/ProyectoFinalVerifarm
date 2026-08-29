import { PrismaClient } from "@prisma/client";

// Cliente Prisma unico para toda la aplicacion.
//
// En desarrollo, Next.js recarga los modulos en cada cambio. Si el cliente se
// creara con un `new PrismaClient()` suelto, cada recarga abriria un pool de
// conexiones nuevo y PostgreSQL terminaria rechazando conexiones despues de un
// rato de trabajo. Por eso se guarda la instancia en `globalThis`, que las
// recargas no limpian, y se reutiliza.
//
// En produccion no hace falta: el modulo se evalua una sola vez.
const globalParaPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalParaPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = db;
}
