-- AlterTable
ALTER TABLE "product" ADD COLUMN     "branchId" TEXT;

-- CreateIndex
CREATE INDEX "product_branchId_idx" ON "product"("branchId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
