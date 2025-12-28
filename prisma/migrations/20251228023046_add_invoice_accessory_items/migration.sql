-- CreateTable
CREATE TABLE "invoice_accessory_item" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "accessoryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isFreebie" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_accessory_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invoice_accessory_item_invoiceId_idx" ON "invoice_accessory_item"("invoiceId");

-- CreateIndex
CREATE INDEX "invoice_accessory_item_accessoryId_idx" ON "invoice_accessory_item"("accessoryId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_accessory_item_invoiceId_accessoryId_key" ON "invoice_accessory_item"("invoiceId", "accessoryId");

-- AddForeignKey
ALTER TABLE "invoice_accessory_item" ADD CONSTRAINT "invoice_accessory_item_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_accessory_item" ADD CONSTRAINT "invoice_accessory_item_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "accessory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
