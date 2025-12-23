import * as dal from "@/app/api/_dal/product-stats.dal"

export async function getProductStats() {
  const [total, available, sold, brandNew] = await Promise.all([
    dal.countAll(),
    dal.countAvailable(),
    dal.countSold(),
    dal.countBrandNew(),
  ])

  return {
    total,
    available,
    sold,
    brandNew,
  }
}
