-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('ADMINISTRADOR', 'FARMACEUTICO', 'MEDICO', 'ENFERMERO');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "UnidadMedida" AS ENUM ('MG', 'ML', 'G', 'UI', 'COMPRIMIDO', 'AMPOLLA', 'GOTA');

-- CreateEnum
CREATE TYPE "Severidad" AS ENUM ('ALTA', 'MEDIA', 'BAJA');

-- CreateTable
CREATE TABLE "Medicamento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rxcui" TEXT NOT NULL,
    "unidad" "UnidadMedida" NOT NULL,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "numeroLote" TEXT NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoStock" (
    "id" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" TEXT NOT NULL,
    "seudonimo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicacionVigente" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicacionVigente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultaInteraccion" (
    "id" TEXT NOT NULL,
    "pacienteId" TEXT,
    "usuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultaInteraccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObservacionInteraccion" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "medicamento1Id" TEXT NOT NULL,
    "medicamento2Id" TEXT NOT NULL,
    "severidad" "Severidad" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObservacionInteraccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaccion" (
    "id" TEXT NOT NULL,
    "rxcui1" TEXT NOT NULL,
    "rxcui2" TEXT NOT NULL,
    "severidad" "Severidad" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interaccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAuditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "detalles" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Medicamento_nombre_key" ON "Medicamento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Medicamento_rxcui_key" ON "Medicamento"("rxcui");

-- CreateIndex
CREATE UNIQUE INDEX "Lote_medicamentoId_numeroLote_key" ON "Lote"("medicamentoId", "numeroLote");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_seudonimo_key" ON "Paciente"("seudonimo");

-- CreateIndex
CREATE UNIQUE INDEX "MedicacionVigente_pacienteId_medicamentoId_key" ON "MedicacionVigente"("pacienteId", "medicamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Interaccion_rxcui1_rxcui2_key" ON "Interaccion"("rxcui1", "rxcui2");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicacionVigente" ADD CONSTRAINT "MedicacionVigente_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicacionVigente" ADD CONSTRAINT "MedicacionVigente_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultaInteraccion" ADD CONSTRAINT "ConsultaInteraccion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultaInteraccion" ADD CONSTRAINT "ConsultaInteraccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservacionInteraccion" ADD CONSTRAINT "ObservacionInteraccion_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "ConsultaInteraccion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservacionInteraccion" ADD CONSTRAINT "ObservacionInteraccion_medicamento1Id_fkey" FOREIGN KEY ("medicamento1Id") REFERENCES "Medicamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservacionInteraccion" ADD CONSTRAINT "ObservacionInteraccion_medicamento2Id_fkey" FOREIGN KEY ("medicamento2Id") REFERENCES "Medicamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAuditoria" ADD CONSTRAINT "RegistroAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
