/*
  Convert product.ram from TEXT -> INTEGER.
  Existing values like '8GB' become 8; non-numeric values become 0.
*/

ALTER TABLE "product" ADD COLUMN "ram_int" INTEGER;

UPDATE "product"
SET "ram_int" = NULLIF(regexp_replace("ram", '\\D', '', 'g'), '')::INTEGER;

UPDATE "product" SET "ram_int" = 0 WHERE "ram_int" IS NULL;

ALTER TABLE "product" ALTER COLUMN "ram_int" SET NOT NULL;
ALTER TABLE "product" ALTER COLUMN "ram_int" SET DEFAULT 0;

ALTER TABLE "product" DROP COLUMN "ram";
ALTER TABLE "product" RENAME COLUMN "ram_int" TO "ram";
