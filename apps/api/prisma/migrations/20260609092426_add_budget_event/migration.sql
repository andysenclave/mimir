-- CreateTable
CREATE TABLE "BudgetEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(18,4),
    "month" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BudgetEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BudgetEvent_userId_createdAt_idx" ON "BudgetEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BudgetEvent_month_idx" ON "BudgetEvent"("month");

-- AddForeignKey
ALTER TABLE "BudgetEvent" ADD CONSTRAINT "BudgetEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
