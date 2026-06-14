-- AlterTable
ALTER TABLE "Concept" ADD COLUMN     "triggerKind" TEXT,
ADD COLUMN     "triggerThreshold" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Concept_triggerKind_idx" ON "Concept"("triggerKind");

