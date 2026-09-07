/*
  Warnings:

  - Added the required column `fechaIngreso` to the `Lote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lote" ADD COLUMN     "fechaIngreso" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Medicamento" ALTER COLUMN "rxcui" DROP NOT NULL;
