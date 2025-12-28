import * as dal from "@/app/api/_dal/accessory-stock.dal"
import * as productsDal from "@/app/api/_dal/products.dal"

export async function listAccessoryStocks(filters: {
  accessoryId?: string
  branchId?: string
  limit?: number
  offset?: number
}) {
  const [total, stocks] = await Promise.all([
    dal.countAccessoryStocks({ accessoryId: filters.accessoryId, branchId: filters.branchId }),
    dal.listAccessoryStocks(filters),
  ])

  return {
    stocks,
    pagination: {
      total,
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      hasMore: (filters.offset ?? 0) + (filters.limit ?? 50) < total,
    },
  }
}

export async function addAccessoryStock(
  input: { accessoryId: string; quantity: number },
  ctx: { actorOrganizationId: string | null; isAdminOrganization: boolean }
) {
  // Match existing product create behavior: stock is received into warehouse.
  const warehouseId = await productsDal.getOrganizationIdBySlug("warehouse")
  if (!warehouseId) {
    throw new Error("Warehouse branch not found")
  }

  if (!ctx.actorOrganizationId) throw new Error("Unauthorized")
  if (!ctx.isAdminOrganization) throw new Error("Forbidden")

  const stock = await dal.upsertAccessoryStock({
    accessoryId: input.accessoryId,
    branchId: warehouseId,
    addQuantity: input.quantity,
  })

  return stock
}
