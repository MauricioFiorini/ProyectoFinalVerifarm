import 'dotenv/config';
import { PrismaClient, TipoUsuario, UnidadMedida } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 1. Limpiar base de datos para asegurar idempotencia (en orden para evitar problemas de FK)
  console.log('Limpiando datos anteriores...');
  await prisma.medicamento.deleteMany();
  await prisma.usuario.deleteMany();

  // 2. Crear 3 Usuarios
  console.log('Creando 3 usuarios de prueba...');
  await prisma.usuario.createMany({
    data: [
      { email: 'admin@verifarm.com', nombre: 'Admin Sistema', tipo: TipoUsuario.ADMINISTRADOR },
      { email: 'farmacia@verifarm.com', nombre: 'Farm. Pérez', tipo: TipoUsuario.FARMACEUTICO },
      { email: 'medico@verifarm.com', nombre: 'Dr. House', tipo: TipoUsuario.MEDICO },
    ],
  });

  // 3. Crear 10 Medicamentos
  // RxCUI reales de ejemplo (sintéticos para la app)
  console.log('Creando 10 medicamentos de prueba...');
  await prisma.medicamento.createMany({
    data: [
      { nombre: 'Paracetamol 500mg', rxcui: '198440', unidad: UnidadMedida.COMPRIMIDO, stockMinimo: 100 },
      { nombre: 'Ibuprofeno 400mg', rxcui: '200803', unidad: UnidadMedida.COMPRIMIDO, stockMinimo: 50 },
      { nombre: 'Amoxicilina 500mg', rxcui: '725', unidad: UnidadMedida.COMPRIMIDO, stockMinimo: 30 },
      { nombre: 'Clonazepam 2mg', rxcui: '32968', unidad: UnidadMedida.COMPRIMIDO, stockMinimo: 20 },
      { nombre: 'Diazepam 10mg', rxcui: '3322', unidad: UnidadMedida.COMPRIMIDO, stockMinimo: 20 },
      { nombre: 'Fluoxetina 20mg', rxcui: '4493', unidad: UnidadMedida.COMPRIMIDO, stockMinimo: 40 },
      { nombre: 'Sertralina 50mg', rxcui: '36567', unidad: UnidadMedida.COMPRIMIDO, stockMinimo: 40 },
      { nombre: 'Haloperidol 5mg/ml', rxcui: '5174', unidad: UnidadMedida.AMPOLLA, stockMinimo: 10 },
      { nombre: 'Risperidona 1mg', rxcui: '35636', unidad: UnidadMedida.COMPRIMIDO, stockMinimo: 30 },
      { nombre: 'Escitalopram 10mg', rxcui: '321988', unidad: UnidadMedida.COMPRIMIDO, stockMinimo: 25 },
    ],
  });

  console.log('✅ Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
