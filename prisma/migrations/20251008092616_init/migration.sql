-- CreateTable
CREATE TABLE "Burn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "txHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "fromAddr" TEXT NOT NULL,
    "toAddr" TEXT NOT NULL,
    "amountRaw" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "ts" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Burn_txHash_key" ON "Burn"("txHash");

-- CreateIndex
CREATE INDEX "Burn_token_toAddr_idx" ON "Burn"("token", "toAddr");

-- CreateIndex
CREATE INDEX "Burn_ts_idx" ON "Burn"("ts");
