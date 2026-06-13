-- AlterTable
ALTER TABLE "CourseProgress" ADD COLUMN     "quizScore" INTEGER;

-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "explanation" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "AISuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "ctaLink" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AISuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AISuggestion_userId_generatedAt_idx" ON "AISuggestion"("userId", "generatedAt");

-- AddForeignKey
ALTER TABLE "AISuggestion" ADD CONSTRAINT "AISuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

