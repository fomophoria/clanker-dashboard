/*
  Warnings:

  - The primary key for the `Burn` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `amountRaw` on the `Burn` table. All the data in the column will be lost.
  - You are about to drop the column `block` on the `Burn` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Burn` table. All the data in the column will be lost.
  - You are about to drop the column `fromAddr` on the `Burn` table. All the data in the column will be lost.
  - You are about to drop the column `logIndex` on the `Burn` table. All the data in the column will be lost.
  - You are about to drop the column `toAddr` on the `Burn` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Burn` table. All the data in the column will be lost.
  - You are about to drop the column `ts` on the `Burn` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Burn` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `amountHuman` to the `Burn` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Burn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "txHash" TEXT NOT NULL,
    "amountHuman" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Burn" ("id", "txHash") SELECT "id", "txHash" FROM "Burn";
DROP TABLE "Burn";
ALTER TABLE "new_Burn" RENAME TO "Burn";
CREATE INDEX "Burn_timestamp_idx" ON "Burn"("timestamp");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
