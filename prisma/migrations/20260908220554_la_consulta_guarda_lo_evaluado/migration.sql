-- CreateTable
CREATE TABLE "MedicamentoEvaluado" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicamentoEvaluado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicamentoEvaluado_medicamentoId_idx" ON "MedicamentoEvaluado"("medicamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicamentoEvaluado_consultaId_medicamentoId_key" ON "MedicamentoEvaluado"("consultaId", "medicamentoId");

-- AddForeignKey
ALTER TABLE "MedicamentoEvaluado" ADD CONSTRAINT "MedicamentoEvaluado_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "ConsultaInteraccion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicamentoEvaluado" ADD CONSTRAINT "MedicamentoEvaluado_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
