// npm run setup — deja el entorno listo para trabajar, despues de `npm install`.
//
// Existe porque en una maquina donde el proyecto nunca corrio hacen falta pasos
// que no hace ningun comando y cuyos errores no apuntan a su causa. El peor es
// la generacion del cliente de Prisma: npm 11 bloquea por defecto los scripts de
// instalacion de las dependencias, asi que el `postinstall` de Prisma no corre y
// el sintoma aparece mucho despues, como un error de TypeScript que no nombra ni
// a npm ni a Prisma.
//
// Esa generacion NO va en un `postinstall` de este proyecto: se probo y hace
// fallar el `npm install` entero cuando todavia no existe el `.env`. El porque
// esta en docs/decisiones/0001-generacion-del-cliente-prisma.md.
//
// El script se puede correr las veces que haga falta: no crea el `.env`, no
// levanta Docker y lo unico que escribe es lo que genera Prisma, que sobrescribe
// su propia salida.

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import process from "node:process";

const ARCHIVO_ENV = ".env";
const CLAVE = "DATABASE_URL=";
const PUERTO_ESPERADO = "5433";

// Los pasos se arman segun el caso: repetirle "cp .env.example .env" a alguien
// que ya lo hizo manda a revisar el paso equivocado.
const COMPLETAR = [
  "- Completar DATABASE_URL con la URL de ejemplo que ese mismo archivo trae",
  "  comentada.",
  `- Ojo con el puerto: es el ${PUERTO_ESPERADO}, no el 5432. El porque esta`,
  "  explicado en docker-compose.yml.",
];

const CREAR_Y_COMPLETAR = ["- cp .env.example .env", ...COMPLETAR];

function abortar(titulo, lineas) {
  process.stderr.write(`\n${titulo}\n\n`);
  for (const linea of lineas) {
    process.stderr.write(`  ${linea}\n`);
  }
  process.stderr.write("\n");
  process.exit(1);
}

// 1. El archivo tiene que existir.
if (!existsSync(ARCHIVO_ENV)) {
  abortar(
    "Falta el archivo .env. No se versiona, asi que en un clon nuevo hay que crearlo.",
    CREAR_Y_COMPLETAR,
  );
}

// 2. Y DATABASE_URL tiene que tener valor. No alcanza con que el archivo exista:
//    `.env.example` trae la clave vacia y la URL que sirve esta comentada, asi
//    que un `cp` sin editar deja el archivo creado y la variable sin valor. Sin
//    esta verificacion el script daria el visto bueno y `prisma generate`
//    fallaria igual, con el error opaco que este script viene a evitar.
const lineaDeLaClave = readFileSync(ARCHIVO_ENV, "utf8")
  .split("\n")
  .map((linea) => linea.trim())
  .find((linea) => linea.startsWith(CLAVE));

const url = (lineaDeLaClave ?? "")
  .slice(CLAVE.length)
  .trim()
  .replace(/^["']|["']$/g, "");

if (url === "") {
  abortar(
    "El archivo .env existe, pero DATABASE_URL esta vacia o no esta definida.",
    COMPLETAR,
  );
}

// 3. El puerto es un aviso, no un error: si alguien lo cambio en
//    docker-compose.yml porque tenia el 5433 ocupado, tiene que poder seguir.
let puerto = "";
try {
  puerto = new URL(url).port;
} catch {
  puerto = "";
}

if (puerto !== "" && puerto !== PUERTO_ESPERADO) {
  process.stdout.write(
    `Aviso: DATABASE_URL apunta al puerto ${puerto} y docker-compose.yml publica ` +
      `el ${PUERTO_ESPERADO}.\n` +
      "Si no los cambiaste a proposito, no va a conectar. Con PostgreSQL instalado " +
      "en Windows,\nel sintoma es 'Authentication failed against database server'.\n\n",
  );
}

// 4. Recien ahora, con el entorno verificado, se genera el cliente.
process.stdout.write("Generando el cliente de Prisma...\n\n");

try {
  execSync("npx prisma generate", { stdio: "inherit" });
} catch {
  abortar("No se pudo generar el cliente de Prisma.", [
    "El error de Prisma esta arriba. Dos causas frecuentes:",
    "",
    "- Node quedo viejo: Prisma 7 pide 20.19+, 22.12+ o 24.0+.",
    "- DATABASE_URL tiene un valor que Prisma no puede leer.",
  ]);
}

process.stdout.write("\nListo. El paso siguiente es:\n\n");
process.stdout.write(
  "  docker compose up -d   # Docker Desktop tiene que estar abierto\n",
);
process.stdout.write("  npm run dev\n\n");
