-- AlterTable
ALTER TABLE "transfer" ADD COLUMN     "receivedAt" TIMESTAMP(3),
ADD COLUMN     "receivedById" TEXT;

-- CreateIndex
CREATE INDEX "transfer_receivedById_idx" ON "transfer"("receivedById");

-- AddForeignKey
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
