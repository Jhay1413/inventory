/*
  Ensure product.ram values are safely castable to integer.
  - 'Unknown' => '0'
  - '8GB' => '8'
*/
UPDATE "product"
SET "ram" = COALESCE(NULLIF(regexp_replace("ram", '[^0-9]', '', 'g'), ''), '0');
