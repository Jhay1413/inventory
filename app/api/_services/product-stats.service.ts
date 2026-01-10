import * as dal from "@/app/api/_dal/product-stats.dal"

export async function getProductStats(opts?: {
  branchId?: string
  currentBranchId?: string
}) {
  const [
    total,
    available,
    sold,
    brandNew,
    currentBranchStock,
    pendingTransfers,
    pendingAccessoryTransfers,
  ] = await Promise.all([
    dal.countAll(opts),
    dal.countAvailable(opts),
    dal.countSold(opts),
    dal.countBrandNew(opts),
    opts?.currentBranchId ? dal.countCurrentBranch(opts.currentBranchId) : Promise.resolve(0),
    opts?.currentBranchId
      ? dal.countPendingTransfersFrom(opts.currentBranchId)
      : Promise.resolve(0),
    opts?.currentBranchId
      ? dal.countPendingAccessoryTransfersFrom(opts.currentBranchId)
      : Promise.resolve(0),
  ])

  return {
    total,
    available,
    sold,
    brandNew,
    currentBranchStock,
    pendingTransfers,
    pendingAccessoryTransfers,
  }
}
