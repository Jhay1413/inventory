import * as dal from "@/app/api/_dal/inventory.dal"
import type { InventoryQuery } from "@/types/api/inventory"

export async function getInventory(query: InventoryQuery, opts?: { branchId?: string }) {
  const products = await dal.listProductsForInventory(query, { branchId: opts?.branchId })

  const byModel = new Map<
    string,
    {
      productModelId: string
      productModelName: string
      productTypeId: string
      productTypeName: string
      total: number
      available: number
      sold: number
      brandNew: number
      secondHand: number
    }
  >()

  for (const p of products) {
    const productModelId = p.productModelId
    const productModelName = p.productModel.name
    const productTypeId = p.productModel.productType.id
    const productTypeName = p.productModel.productType.name

    const existing = byModel.get(productModelId) ?? {
      productModelId,
      productModelName,
      productTypeId,
      productTypeName,
      total: 0,
      available: 0,
      sold: 0,
      brandNew: 0,
      secondHand: 0,
    }

    existing.total += 1
    if (p.availability === "Available") existing.available += 1
    if (p.availability === "Sold") existing.sold += 1
    if (p.condition === "BrandNew") existing.brandNew += 1
    if (p.condition === "SecondHand") existing.secondHand += 1

    byModel.set(productModelId, existing)
  }

  const items = Array.from(byModel.values()).sort((a, b) =>
    a.productTypeName.localeCompare(b.productTypeName) || a.productModelName.localeCompare(b.productModelName)
  )

  const totals = items.reduce(
    (acc, item) => {
      acc.total += item.total
      acc.available += item.available
      acc.sold += item.sold
      acc.brandNew += item.brandNew
      acc.secondHand += item.secondHand
      return acc
    },
    { total: 0, available: 0, sold: 0, brandNew: 0, secondHand: 0 }
  )

  return { items, totals }
}
