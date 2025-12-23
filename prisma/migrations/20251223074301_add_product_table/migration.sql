-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('BrandNew', 'SecondHand');

-- CreateEnum
CREATE TYPE "ProductAvailability" AS ENUM ('Available', 'Sold');

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "productTypeId" TEXT NOT NULL,
    "productModelId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "imei" VARCHAR(15) NOT NULL,
    "condition" "ProductCondition" NOT NULL,
    "availability" "ProductAvailability" NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_imei_key" ON "product"("imei");

-- CreateIndex
CREATE INDEX "product_productTypeId_idx" ON "product"("productTypeId");

-- CreateIndex
CREATE INDEX "product_productModelId_idx" ON "product"("productModelId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_productModelId_fkey" FOREIGN KEY ("productModelId") REFERENCES "product_model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
