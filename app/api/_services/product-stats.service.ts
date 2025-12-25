import * as dal from "@/app/api/_dal/product-stats.dal"

export async function getProductStats(opts?: { branchId?: string }) {
  const [total, available, sold, brandNew] = await Promise.all([
    dal.countAll(opts),
    dal.countAvailable(opts),
    dal.countSold(opts),
    dal.countBrandNew(opts),
  ])

  return {
    total,
    available,
    sold,
    brandNew,
  }
}
