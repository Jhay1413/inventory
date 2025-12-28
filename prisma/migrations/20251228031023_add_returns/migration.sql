-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('Open', 'Processing', 'Completed', 'Rejected');

-- CreateEnum
CREATE TYPE "ReturnResolution" AS ENUM ('Exchange', 'Repair');

-- CreateTable
CREATE TABLE "return" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'Open',
    "reason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_product_item" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "defectNotes" TEXT,
    "resolution" "ReturnResolution" NOT NULL,
    "replacementProductId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_product_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_accessory_item" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "accessoryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "defectNotes" TEXT,
    "resolution" "ReturnResolution" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_accessory_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "return_invoiceId_idx" ON "return"("invoiceId");

-- CreateIndex
CREATE INDEX "return_branchId_idx" ON "return"("branchId");

-- CreateIndex
CREATE INDEX "return_createdById_idx" ON "return"("createdById");

-- CreateIndex
CREATE INDEX "return_status_idx" ON "return"("status");

-- CreateIndex
CREATE INDEX "return_createdAt_idx" ON "return"("createdAt");

-- CreateIndex
CREATE INDEX "return_product_item_returnId_idx" ON "return_product_item"("returnId");

-- CreateIndex
CREATE INDEX "return_product_item_productId_idx" ON "return_product_item"("productId");

-- CreateIndex
CREATE INDEX "return_product_item_replacementProductId_idx" ON "return_product_item"("replacementProductId");

-- CreateIndex
CREATE UNIQUE INDEX "return_product_item_returnId_productId_key" ON "return_product_item"("returnId", "productId");

-- CreateIndex
CREATE INDEX "return_accessory_item_returnId_idx" ON "return_accessory_item"("returnId");

-- CreateIndex
CREATE INDEX "return_accessory_item_accessoryId_idx" ON "return_accessory_item"("accessoryId");

-- AddForeignKey
ALTER TABLE "return" ADD CONSTRAINT "return_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return" ADD CONSTRAINT "return_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return" ADD CONSTRAINT "return_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_product_item" ADD CONSTRAINT "return_product_item_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "return"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_product_item" ADD CONSTRAINT "return_product_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_product_item" ADD CONSTRAINT "return_product_item_replacementProductId_fkey" FOREIGN KEY ("replacementProductId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_accessory_item" ADD CONSTRAINT "return_accessory_item_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "return"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_accessory_item" ADD CONSTRAINT "return_accessory_item_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "accessory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
