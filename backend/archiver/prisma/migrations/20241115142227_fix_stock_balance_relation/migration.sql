/*
  Warnings:

  - You are about to drop the column `stockBalanceId` on the `User` table. All the data in the column will be lost.
  - Added the required column `marketId` to the `StockBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `StockBalance` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_stockBalanceId_fkey";

-- DropIndex
DROP INDEX "User_stockBalanceId_key";

-- AlterTable
ALTER TABLE "StockBalance" ADD COLUMN     "marketId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "stockBalanceId";

-- AddForeignKey
ALTER TABLE "StockBalance" ADD CONSTRAINT "StockBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBalance" ADD CONSTRAINT "StockBalance_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
