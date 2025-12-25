-- CreateEnum
CREATE TYPE "ProductAuditAction" AS ENUM ('ProductCreated', 'TransferRequested', 'TransferReceived', 'Sold');

-- CreateTable
CREATE TABLE "product_audit_log" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "action" "ProductAuditAction" NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorOrganizationId" TEXT,
    "fromBranchId" TEXT,
    "toBranchId" TEXT,
    "transferId" TEXT,
    "invoiceId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_audit_log_productId_createdAt_idx" ON "product_audit_log"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "product_audit_log_actorUserId_createdAt_idx" ON "product_audit_log"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "product_audit_log_actorOrganizationId_createdAt_idx" ON "product_audit_log"("actorOrganizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "product_audit_log" ADD CONSTRAINT "product_audit_log_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_audit_log" ADD CONSTRAINT "product_audit_log_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_audit_log" ADD CONSTRAINT "product_audit_log_actorOrganizationId_fkey" FOREIGN KEY ("actorOrganizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_audit_log" ADD CONSTRAINT "product_audit_log_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "transfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_audit_log" ADD CONSTRAINT "product_audit_log_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
