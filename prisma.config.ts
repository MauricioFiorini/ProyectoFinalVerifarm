// Configuracion de Prisma 7.
//
// Dos cambios de la version 7 respecto de la 6, que explican este archivo:
//
//   1. La URL de conexion ya no va en `schema.prisma`: va aca.
//   2. Prisma ya no carga `.env` por su cuenta, asi que hay que importar
//      `dotenv/config` explicitamente antes de leer `process.env`.
//
// La URL sale de DATABASE_URL. Esta documentada en `.env.example`.
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  }
});
