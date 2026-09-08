/*
  Warnings:

  - Added the required column `fechaInicio` to the `MedicacionVigente` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MedicacionVigente_pacienteId_medicamentoId_key";

-- AlterTable
ALTER TABLE "MedicacionVigente" ADD COLUMN     "fechaFin" TIMESTAMP(3),
ADD COLUMN     "fechaInicio" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "motivoSuspension" TEXT;

-- CreateIndex
CREATE INDEX "MedicacionVigente_pacienteId_idx" ON "MedicacionVigente"("pacienteId");
