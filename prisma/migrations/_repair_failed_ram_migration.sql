/* Cleanup for failed migration 20251223082000_product_ram_to_int
   Drops partially-created ram_int column if it exists.
*/
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'product'
      AND column_name = 'ram_int'
  ) THEN
    ALTER TABLE "product" DROP COLUMN "ram_int";
  END IF;
END $$;
