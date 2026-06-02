-- CreateTable
CREATE TABLE "MarketSnapshot" (
    "symbol" TEXT NOT NULL,
    "ltp" DECIMAL(18,4) NOT NULL,
    "open" DECIMAL(18,4),
    "high" DECIMAL(18,4),
    "low" DECIMAL(18,4),
    "close" DECIMAL(18,4),
    "change" DECIMAL(18,4),
    "changePct" DECIMAL(8,4),
    "volume" BIGINT,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("symbol")
);
