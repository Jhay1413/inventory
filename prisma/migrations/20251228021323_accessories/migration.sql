-- CreateTable
CREATE TABLE "accessory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "accessory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessory_stock" (
    "id" TEXT NOT NULL,
    "accessoryId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accessory_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessory_transfer" (
    "id" TEXT NOT NULL,
    "accessoryId" TEXT NOT NULL,
    "fromBranchId" TEXT NOT NULL,
    "toBranchId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "receivedById" TEXT,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'Pending',
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accessory_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accessory_name_key" ON "accessory"("name");

-- CreateIndex
CREATE INDEX "accessory_stock_branchId_idx" ON "accessory_stock"("branchId");

-- CreateIndex
CREATE INDEX "accessory_stock_accessoryId_idx" ON "accessory_stock"("accessoryId");

-- CreateIndex
CREATE UNIQUE INDEX "accessory_stock_accessoryId_branchId_key" ON "accessory_stock"("accessoryId", "branchId");

-- CreateIndex
CREATE INDEX "accessory_transfer_accessoryId_idx" ON "accessory_transfer"("accessoryId");

-- CreateIndex
CREATE INDEX "accessory_transfer_fromBranchId_idx" ON "accessory_transfer"("fromBranchId");

-- CreateIndex
CREATE INDEX "accessory_transfer_toBranchId_idx" ON "accessory_transfer"("toBranchId");

-- CreateIndex
CREATE INDEX "accessory_transfer_requestedById_idx" ON "accessory_transfer"("requestedById");

-- CreateIndex
CREATE INDEX "accessory_transfer_receivedById_idx" ON "accessory_transfer"("receivedById");

-- CreateIndex
CREATE INDEX "accessory_transfer_status_idx" ON "accessory_transfer"("status");

-- AddForeignKey
ALTER TABLE "accessory_stock" ADD CONSTRAINT "accessory_stock_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "accessory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessory_stock" ADD CONSTRAINT "accessory_stock_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessory_transfer" ADD CONSTRAINT "accessory_transfer_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "accessory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessory_transfer" ADD CONSTRAINT "accessory_transfer_fromBranchId_fkey" FOREIGN KEY ("fromBranchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessory_transfer" ADD CONSTRAINT "accessory_transfer_toBranchId_fkey" FOREIGN KEY ("toBranchId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessory_transfer" ADD CONSTRAINT "accessory_transfer_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessory_transfer" ADD CONSTRAINT "accessory_transfer_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
