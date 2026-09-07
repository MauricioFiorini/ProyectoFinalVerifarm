import "dotenv/config";
import { PrismaClient, TipoUsuario, UnidadMedida } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  USUARIO_ADMIN_ID,
  USUARIO_FARMACEUTICO_ID,
  USUARIO_MEDICO_ID,
} from "../src/lib/usuariosSemilla";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// SOBRE LOS NOMBRES
//
// El nombre es el PRINCIPIO ACTIVO, sin dosis ni concentracion: "Paracetamol",
// no "Paracetamol 500mg". Con la dosis adentro, "Paracetamol 500mg" y
// "Paracetamol 1g" son cadenas distintas y la restriccion de nombre unico no
// impide cargar la misma droga dos veces.
// Ver docs/decisiones/0006-el-nombre-no-lleva-la-dosis.md
//
// SOBRE LOS RxCUI
//
// Todos son de nivel INGREDIENTE (TTY=IN) y estan verificados uno por uno contra
// la API de RxNorm (RxNav) el 2026-09-07, con los endpoints
// /REST/rxcui.json?name= y /REST/rxcui/{id}/properties.json
// Ver docs/decisiones/0008-los-rxcui-son-de-ingrediente.md
//
// La verificacion encontro que SIETE de los diez codigos anteriores estaban mal,
// y tres de ellos apuntaban a una droga distinta:
//
//   Amoxicilina  725    -> era "amphetamine"
//   Clonazepam   32968  -> era "clopidogrel"
//   Sertralina   36567  -> era "simvastatin"
//   Ibuprofeno   200803 -> no resolvia
//   Haloperidol  5174   -> no resolvia
//   Paracetamol  198440 -> era un producto (SCD), no un ingrediente
//
// Queda anotado porque es la razon por la que el campo `rxcui` es opcional: un
// codigo ausente se ve, uno equivocado no. Ninguno se completo de memoria.

type MedicamentoSemilla = {
  nombre: string;
  /** RxCUI de ingrediente. Null solo si no resuelve en RxNorm. */
  rxcui: string | null;
  /** Nombre del ingrediente en RxNorm, para poder reverificar sin adivinar. */
  nombreRxNorm: string;
  unidad: UnidadMedida;
  stockMinimo: number;
};

const MEDICAMENTOS: MedicamentoSemilla[] = [
  {
    nombre: "Paracetamol",
    rxcui: "161",
    nombreRxNorm: "acetaminophen",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 100,
  },
  {
    nombre: "Ibuprofeno",
    rxcui: "5640",
    nombreRxNorm: "ibuprofen",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 50,
  },
  {
    nombre: "Amoxicilina",
    rxcui: "723",
    nombreRxNorm: "amoxicillin",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 30,
  },
  {
    nombre: "Clonazepam",
    rxcui: "2598",
    nombreRxNorm: "clonazepam",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 20,
  },
  {
    nombre: "Diazepam",
    rxcui: "3322",
    nombreRxNorm: "diazepam",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 20,
  },
  {
    nombre: "Fluoxetina",
    rxcui: "4493",
    nombreRxNorm: "fluoxetine",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 40,
  },
  {
    nombre: "Sertralina",
    rxcui: "36437",
    nombreRxNorm: "sertraline",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 40,
  },
  {
    nombre: "Haloperidol",
    rxcui: "5093",
    nombreRxNorm: "haloperidol",
    unidad: UnidadMedida.AMPOLLA,
    stockMinimo: 10,
  },
  {
    nombre: "Risperidona",
    rxcui: "35636",
    nombreRxNorm: "risperidone",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 30,
  },
  {
    nombre: "Escitalopram",
    rxcui: "321988",
    nombreRxNorm: "escitalopram",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 25,
  },
];

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar para que el seed sea idempotente. El orden evita romper claves
  // foraneas: primero lo que depende, despues lo que es dependido.
  console.log("Limpiando datos anteriores...");
  await prisma.medicamento.deleteMany();
  await prisma.usuario.deleteMany();

  // Los `id` van escritos, no generados. Sin esto cambian en cada corrida y
  // cualquier constante que los referencie se rompe.
  // Ver src/lib/usuariosSemilla.ts
  console.log("Creando 3 usuarios de prueba...");
  await prisma.usuario.createMany({
    data: [
      {
        id: USUARIO_ADMIN_ID,
        email: "admin@verifarm.com",
        nombre: "Admin Sistema",
        tipo: TipoUsuario.ADMINISTRADOR,
      },
      {
        id: USUARIO_FARMACEUTICO_ID,
        email: "farmacia@verifarm.com",
        nombre: "Farm. Pérez",
        tipo: TipoUsuario.FARMACEUTICO,
      },
      {
        id: USUARIO_MEDICO_ID,
        email: "medico@verifarm.com",
        nombre: "Dr. House",
        tipo: TipoUsuario.MEDICO,
      },
    ],
  });

  console.log(`Creando ${MEDICAMENTOS.length} medicamentos de prueba...`);
  await prisma.medicamento.createMany({
    data: MEDICAMENTOS.map(({ nombre, rxcui, unidad, stockMinimo }) => ({
      nombre,
      rxcui,
      unidad,
      stockMinimo,
    })),
  });

  console.log("✅ Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
