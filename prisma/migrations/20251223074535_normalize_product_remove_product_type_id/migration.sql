/*
  Warnings:

  - You are about to drop the column `productTypeId` on the `product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_productTypeId_fkey";

-- DropIndex
DROP INDEX "product_productTypeId_idx";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "productTypeId";
