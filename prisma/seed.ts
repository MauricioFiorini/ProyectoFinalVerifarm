import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PrismaClient,
  Severidad,
  TipoMovimiento,
  TipoUsuario,
  UnidadMedida,
} from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { ordenarParRxcui } from "../src/lib/rxcui";
import {
  USUARIO_ADMIN_ID,
  USUARIO_FARMACEUTICO_ID,
  USUARIO_MEDICO_ID,
} from "../src/lib/usuariosSemilla";
import { crearConsulta } from "../src/services/consultas";
import { inicioDelDiaUtc, sumarDias } from "../src/lib/fechas";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================================
// SEED DEFINITIVO (Tarea 6.06 - Decisión 0012)
//
// SOBRE LOS NOMBRES
//
// El nombre es el PRINCIPIO ACTIVO, sin dosis ni concentración: "Paracetamol",
// no "Paracetamol 500mg". Con la dosis adentro, "Paracetamol 500mg" y
// "Paracetamol 1g" son cadenas distintas y la restricción de nombre único no
// impide cargar la misma droga dos veces.
// Ver docs/decisiones/0006-el-nombre-no-lleva-la-dosis.md
//
// SOBRE LOS RxCUI
//
// Todos son de nivel INGREDIENTE (TTY=IN) y están verificados uno por uno contra
// la API de RxNorm (RxNav) con /REST/rxcui.json?name= y
// /REST/rxcui/{id}/properties.json
// Ver docs/decisiones/0008-los-rxcui-son-de-ingrediente.md
//
// ALINEACIÓN CON ONCHigh (Decisión 0012)
//
// El catálogo incluye 25 fármacos verosímiles para una colonia psiquiátrica:
// - Antipsicóticos típicos y atípicos
// - Antidepresivos ISRS, IRSN, TCAs e IMAOs
// - Anticonvulsivantes / estabilizadores del ánimo y analgésicos
// - Medicamentos sin cruce en la fuente (ej. Clonazepam, Risperidona) para
//   demostrar la distinción entre "sin interacciones" y "sin datos en la fuente".
//
// FEFO Y STOCK
//
// - Haloperidol cuenta con DOS LOTES de distinto vencimiento para evidenciar
//   el reparto automático de unidades por FEFO al dispensar.
// - Clonazepam cuenta con un lote próximo a vencer (< 30 días) para disparar
//   la alerta visual de "Lote por vencer".
// - Risperidona cuenta con stock por debajo del mínimo para disparar la
//   alerta visual de "Bajo mínimo".
//
// PACIENTES Y CASOS CLÍNICOS
//
// - Pacientes sintéticos seudonimizados sin datos identificatorios.
// - Casos con interacciones graves detectables (ISRS + IMAO, prolongación de QT).
// - Casos con medicamentos sin cobertura en la fuente.
// ============================================================================

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
  // --- Analgésicos y antibióticos básicos (stock) ---
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

  // --- Psicofármacos sin cobertura en ONCHigh (demostración Decisión 0012) ---
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
    nombre: "Risperidona",
    rxcui: "35636",
    nombreRxNorm: "risperidone",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 30,
  },

  // --- Antipsicóticos (presentes en ONCHigh) ---
  {
    nombre: "Haloperidol",
    rxcui: "5093",
    nombreRxNorm: "haloperidol",
    unidad: UnidadMedida.AMPOLLA,
    stockMinimo: 15,
  },
  {
    nombre: "Clorpromazina",
    rxcui: "2403",
    nombreRxNorm: "chlorpromazine",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 30,
  },
  {
    nombre: "Tioridazina",
    rxcui: "10502",
    nombreRxNorm: "thioridazine",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 20,
  },
  {
    nombre: "Pimozida",
    rxcui: "8331",
    nombreRxNorm: "pimozide",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 15,
  },

  // --- Antidepresivos ISRS e IRSN (presentes en ONCHigh) ---
  {
    nombre: "Escitalopram",
    rxcui: "321988",
    nombreRxNorm: "escitalopram",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 25,
  },
  {
    nombre: "Citalopram",
    rxcui: "2556",
    nombreRxNorm: "citalopram",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 25,
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
    nombre: "Paroxetina",
    rxcui: "32937",
    nombreRxNorm: "paroxetine",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 30,
  },
  {
    nombre: "Venlafaxina",
    rxcui: "39786",
    nombreRxNorm: "venlafaxine",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 30,
  },

  // --- Antidepresivos Tricíclicos (TCAs presentes en ONCHigh) ---
  {
    nombre: "Amitriptilina",
    rxcui: "704",
    nombreRxNorm: "amitriptyline",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 30,
  },
  {
    nombre: "Nortriptilina",
    rxcui: "7531",
    nombreRxNorm: "nortriptyline",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 25,
  },
  {
    nombre: "Clomipramina",
    rxcui: "2597",
    nombreRxNorm: "clomipramine",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 20,
  },
  {
    nombre: "Imipramina",
    rxcui: "5691",
    nombreRxNorm: "imipramine",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 20,
  },

  // --- Inhibidores de la Monoaminooxidasa (IMAOs en ONCHigh) ---
  {
    nombre: "Tranilcipromina",
    rxcui: "10734",
    nombreRxNorm: "tranylcypromine",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 20,
  },
  {
    nombre: "Fenelzina",
    rxcui: "8123",
    nombreRxNorm: "phenelzine",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 20,
  },
  {
    nombre: "Selegilina",
    rxcui: "9639",
    nombreRxNorm: "selegiline",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 15,
  },

  // --- Anticonvulsivante / Estabilizador y Analgésico ---
  {
    nombre: "Carbamazepina",
    rxcui: "2002",
    nombreRxNorm: "carbamazepine",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 40,
  },
  {
    nombre: "Tramadol",
    rxcui: "10689",
    nombreRxNorm: "tramadol",
    unidad: UnidadMedida.COMPRIMIDO,
    stockMinimo: 30,
  },
];

type InteraccionSemilla = {
  rxcui1: string;
  rxcui2: string;
  severidad: keyof typeof Severidad;
  descripcion: string;
  fuente: string;
};

type ArchivoDeInteracciones = {
  generado: string;
  fuente: string;
  vigencia: string;
  paresUnicos: number;
  interacciones: InteraccionSemilla[];
};

async function cargarInteracciones() {
  const ruta = join(import.meta.dirname, "datos", "onchigh.json");
  const archivo = JSON.parse(
    readFileSync(ruta, "utf8"),
  ) as ArchivoDeInteracciones;

  const filas = archivo.interacciones.map((i) => {
    const [rxcui1, rxcui2] = ordenarParRxcui(i.rxcui1, i.rxcui2);
    return {
      rxcui1,
      rxcui2,
      severidad: Severidad[i.severidad],
      descripcion: i.descripcion,
      fuente: i.fuente,
    };
  });

  console.log(
    `Cargando ${filas.length} interacciones (${archivo.fuente}, generado el ${archivo.generado})...`,
  );
  await prisma.interaccion.createMany({ data: filas });
  console.log(
    `  todas con severidad ALTA: la fuente no publica una escala de gravedad.`,
  );
}

async function main() {
  console.log("🌱 Iniciando seed definitivo de la base de datos...");

  // Limpiar datos anteriores en orden topológico para no violar restricciones foráneas.
  console.log("Limpiando datos anteriores...");
  await prisma.observacionInteraccion.deleteMany();
  await prisma.medicamentoEvaluado.deleteMany();
  await prisma.consultaInteraccion.deleteMany();
  await prisma.medicacionVigente.deleteMany();
  await prisma.paciente.deleteMany();
  await prisma.movimientoStock.deleteMany();
  await prisma.lote.deleteMany();
  await prisma.medicamento.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.interaccion.deleteMany();

  // 1. Usuarios del sistema (con IDs fijos para trazabilidad y simulación)
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

  // 2. Medicamentos del catálogo
  console.log(`Creando ${MEDICAMENTOS.length} medicamentos del catálogo...`);
  await prisma.medicamento.createMany({
    data: MEDICAMENTOS.map(({ nombre, rxcui, unidad, stockMinimo }) => ({
      nombre,
      rxcui,
      unidad,
      stockMinimo,
    })),
  });

  // 3. Cargar interacciones de ONCHigh
  await cargarInteracciones();

  // Mapa auxiliar de medicamentos por nombre
  const medicamentosEnBd = await prisma.medicamento.findMany();
  const medMap = new Map(medicamentosEnBd.map((m) => [m.nombre, m]));

  // 4. Lotes y movimientos de stock (Demostración FEFO y alertas visuales)
  console.log("Creando lotes de stock para demostración de FEFO y alertas...");

  async function crearLoteConStock(
    nombreMed: string,
    numeroLote: string,
    fechaIngreso: Date,
    fechaVencimiento: Date,
    cantidad: number,
  ) {
    const med = medMap.get(nombreMed);
    if (!med)
      throw new Error(`Medicamento no encontrado para seed: ${nombreMed}`);

    const lote = await prisma.lote.create({
      data: {
        medicamentoId: med.id,
        numeroLote,
        fechaIngreso,
        fechaVencimiento,
      },
    });

    await prisma.movimientoStock.create({
      data: {
        loteId: lote.id,
        tipo: TipoMovimiento.INGRESO,
        cantidad,
        usuarioId: USUARIO_FARMACEUTICO_ID,
        createdAt: fechaIngreso,
      },
    });

    return lote;
  }

  // --- Las fechas son RELATIVAS al dia en que se siembra (tarea 6.11) -------
  //
  // POR QUE NO SON FECHAS FIJAS
  //
  // Lo eran, y el seed envejecia: el lote de Clonazepam vencia el 24/09/2026, y
  // pasada esa fecha la tarjeta de "lotes por vencer" se iba a cero y se caia un
  // momento de la demostracion. Un seed que solo sirve una semana no sirve.
  //
  // Con desfases, los tres estados de vencimiento —VENCIDO, POR_VENCER y
  // VIGENTE— se ven siempre, se siembre el dia que se siembre. Eso importa
  // porque el guion los muestra y porque el indicador de la 4.17 existe para
  // distinguirlos.
  //
  // Usa las primitivas de src/lib/fechas.ts, las mismas que el servicio: asi el
  // seed no inventa su propia idea de "el dia" y las fechas quedan como
  // medianoche UTC, que es la convencion de todo el sistema. Ver la tarea 4.18.
  const enDias = (n: number) => inicioDelDiaUtc(sumarDias(new Date(), n));

  // --- FEFO: Haloperidol con dos lotes de distinto vencimiento ---
  // Lote vigente que vence ANTES: es el que FEFO agota primero. A ~2 meses, o
  // sea fuera de la ventana de 30 dias, asi que figura Vigente y no Por vencer.
  await crearLoteConStock("Haloperidol", "HAL-L1", enDias(-39), enDias(67), 40);
  // Lote vigente que vence despues. Aporta las 10 que le faltan al primero.
  await crearLoteConStock("Haloperidol", "HAL-L2", enDias(-8), enDias(371), 80);

  // --- Lote VENCIDO, para que se vea el tercer estado (tarea 6.11) ----------
  //
  // Vence antes que los otros dos y FEFO NO LO TOCA. Es la unica forma de
  // MOSTRAR la exclusion de vencidos, que hasta ahora el guion afirmaba sin
  // poder ensenar: al dispensar 50, el sistema saltea estas 25 y reparte 40 + 10
  // entre los dos lotes vigentes.
  //
  // Ademas es lo que hace aparecer el renglon rojo de "N en lotes vencidos" en
  // la pantalla de lotes, que estaba construido desde la 4.17 y nunca se habia
  // visto funcionando porque el seed no tenia ningun lote vencido.
  //
  // Las 25 unidades NO cuentan para el disponible: ni en /stock ni en el total
  // de la pantalla de lotes. Estan fisicamente y no se pueden usar, que es
  // exactamente el problema que el proyecto viene a resolver.
  await crearLoteConStock(
    "Haloperidol",
    "HAL-VENCIDO",
    enDias(-400),
    enDias(-20),
    25,
  );

  // --- Alerta amarilla: Lote por vencer (< 30 días) ---
  // Clonazepam, a 15 dias: dentro de la ventana de 30.
  await crearLoteConStock(
    "Clonazepam",
    "CLO-POR-VENCER",
    enDias(-30),
    enDias(15),
    35,
  );

  // --- Alerta roja: Bajo mínimo ---
  // Risperidona: stock mínimo 30, pero solo ingresan 10 unidades
  await crearLoteConStock(
    "Risperidona",
    "RIS-01",
    enDias(-25),
    enDias(294),
    10,
  );

  // --- Stock regular de otros medicamentos ---
  await crearLoteConStock("Sertralina", "SER-01", enDias(-20), enDias(401), 80);
  await crearLoteConStock(
    "Tranilcipromina",
    "TRA-01",
    enDias(-20),
    enDias(478),
    50,
  );
  await crearLoteConStock(
    "Tioridazina",
    "TIO-01",
    enDias(-20),
    enDias(447),
    40,
  );
  await crearLoteConStock(
    "Escitalopram",
    "ESC-01",
    enDias(-20),
    enDias(355),
    60,
  );
  await crearLoteConStock(
    "Paracetamol",
    "PAR-01",
    enDias(-39),
    enDias(448),
    200,
  );
  await crearLoteConStock(
    "Amoxicilina",
    "AMX-01",
    enDias(-39),
    enDias(234),
    60,
  );

  // 5. Pacientes y medicación vigente
  console.log("Creando pacientes sintéticos con medicación vigente...");

  async function crearPacienteConMedicacion(
    seudonimo: string,
    medicamentos: { nombre: string; fechaInicio: Date }[],
  ) {
    const paciente = await prisma.paciente.create({
      data: { seudonimo },
    });

    for (const m of medicamentos) {
      const med = medMap.get(m.nombre);
      if (!med) throw new Error(`Medicamento no encontrado: ${m.nombre}`);

      await prisma.medicacionVigente.create({
        data: {
          pacienteId: paciente.id,
          medicamentoId: med.id,
          fechaInicio: m.fechaInicio,
        },
      });
    }

    return paciente;
  }

  // Paciente 1: Dispara interacción ISRS + IMAO (Sertralina + Tranilcipromina)
  const pac101 = await crearPacienteConMedicacion("PAC-101", [
    { nombre: "Sertralina", fechaInicio: enDias(-100) },
    { nombre: "Tranilcipromina", fechaInicio: enDias(-25) },
  ]);

  // Paciente 2: Dispara interacción QT (Haloperidol + Tioridazina)
  const pac102 = await crearPacienteConMedicacion("PAC-102", [
    { nombre: "Haloperidol", fechaInicio: enDias(-122) },
    { nombre: "Tioridazina", fechaInicio: enDias(-51) },
  ]);

  // Paciente 3: Sin cobertura en la fuente (Clonazepam + Risperidona - Decisión 0012)
  await crearPacienteConMedicacion("PAC-103", [
    { nombre: "Clonazepam", fechaInicio: enDias(-161) },
    { nombre: "Risperidona", fechaInicio: enDias(-117) },
  ]);

  // Paciente 4: Sin cobertura en la fuente, igual que PAC-103 (Paracetamol +
  // Amoxicilina). El nombre de esta variable decía "sin interacciones entre sí"
  // y era engañoso: no interactúan porque no hay con qué cruzarlas.
  await crearPacienteConMedicacion("PAC-104", [
    { nombre: "Paracetamol", fechaInicio: enDias(-8) },
    { nombre: "Amoxicilina", fechaInicio: enDias(-8) },
  ]);

  // Paciente 5: Revisado y sin interacciones (Carbamazepina + Fluoxetina).
  //
  // Es el TERCER estado del módulo clínico, y el único que la demostración no
  // podía mostrar. Las dos drogas figuran en ONCHigh —verificado contra la base,
  // no supuesto—, así que el cruce se hace de verdad y devuelve vacío. Eso es
  // "se revisó y no hay nada", que NO es lo mismo que el vacío de PAC-103 y
  // PAC-104, donde no hubo con qué cruzar. Decisión 0012.
  //
  // No lleva consulta registrada a propósito: la demostración lo evalúa en vivo,
  // igual que PAC-103, y una consulta más movería la tarjeta de "consultas del
  // día" que el guion afirma en 2.
  await crearPacienteConMedicacion("PAC-105", [
    { nombre: "Carbamazepina", fechaInicio: enDias(-73) },
    { nombre: "Fluoxetina", fechaInicio: enDias(-31) },
  ]);

  // 6. Consultas clínicas históricas registradas
  console.log("Registrando consultas clínicas iniciales...");
  const sertralina = medMap.get("Sertralina")!;
  const tranilcipromina = medMap.get("Tranilcipromina")!;
  const haloperidol = medMap.get("Haloperidol")!;
  const tioridazina = medMap.get("Tioridazina")!;

  // Consulta registrada para PAC-101 por Dr. House
  await crearConsulta({
    medicamentoIds: [sertralina.id, tranilcipromina.id],
    pacienteId: pac101.id,
    usuarioId: USUARIO_MEDICO_ID,
  });

  // Consulta registrada para PAC-102 por Dr. House
  await crearConsulta({
    medicamentoIds: [haloperidol.id, tioridazina.id],
    pacienteId: pac102.id,
    usuarioId: USUARIO_MEDICO_ID,
  });

  console.log("✅ Seed definitivo completado con éxito.");
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
