-- CreateEnum
CREATE TYPE "InvoicePaymentType" AS ENUM ('Cash', 'Credit', 'Installment');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('Pending', 'PartiallyPaid', 'Paid', 'Cancelled');

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "salePrice" INTEGER NOT NULL,
    "paymentType" "InvoicePaymentType" NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'Pending',
    "customerName" TEXT,
    "customerPhone" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_productId_key" ON "invoice"("productId");

-- CreateIndex
CREATE INDEX "invoice_branchId_idx" ON "invoice"("branchId");

-- CreateIndex
CREATE INDEX "invoice_createdById_idx" ON "invoice"("createdById");

-- CreateIndex
CREATE INDEX "invoice_status_idx" ON "invoice"("status");

-- CreateIndex
CREATE INDEX "invoice_createdAt_idx" ON "invoice"("createdAt");

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
