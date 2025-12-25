-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed');

-- CreateTable
CREATE TABLE "transfer" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fromBranchId" TEXT NOT NULL,
    "toBranchId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transfer_productId_idx" ON "transfer"("productId");

-- CreateIndex
CREATE INDEX "transfer_fromBranchId_idx" ON "transfer"("fromBranchId");

-- CreateIndex
CREATE INDEX "transfer_toBranchId_idx" ON "transfer"("toBranchId");

-- CreateIndex
CREATE INDEX "transfer_requestedById_idx" ON "transfer"("requestedById");

-- AddForeignKey
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_toBranchId_fkey" FOREIGN KEY ("toBranchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
