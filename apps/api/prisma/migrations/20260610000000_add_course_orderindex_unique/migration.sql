-- DropIndex
DROP INDEX "Course_orderIndex_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Course_orderIndex_key" ON "Course"("orderIndex");
