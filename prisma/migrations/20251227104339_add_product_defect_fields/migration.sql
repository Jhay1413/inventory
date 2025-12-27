-- AlterTable
ALTER TABLE "product" ADD COLUMN     "defectNotes" TEXT,
ADD COLUMN     "isDefective" BOOLEAN NOT NULL DEFAULT false;
