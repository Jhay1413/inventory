-- CreateTable
CREATE TABLE "product_type" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_model_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_type_name_key" ON "product_type"("name");

-- CreateIndex
CREATE INDEX "product_model_productTypeId_idx" ON "product_model"("productTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "product_model_productTypeId_name_key" ON "product_model"("productTypeId", "name");

-- AddForeignKey
ALTER TABLE "product_model" ADD CONSTRAINT "product_model_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
