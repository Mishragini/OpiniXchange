/*
  Warnings:

  - Added the required column `side` to the `StockBalance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StockBalance" ADD COLUMN     "side" "Side" NOT NULL;
