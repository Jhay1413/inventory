import { prisma } from "@/app/lib/db"
import type { InventoryQuery } from "@/types/api/inventory"

export async function listProductsForInventory(query: InventoryQuery, opts?: { branchId?: string }) {
  return prisma.product.findMany({
    where: {
      ...(opts?.branchId ? { branchId: opts.branchId } : {}),
      ...(query.availability ? { availability: query.availability } : {}),
      ...(query.condition ? { condition: query.condition } : {}),
      ...(query.productTypeId
        ? {
            productModel: {
              productTypeId: query.productTypeId,
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { imei: { contains: query.search } },
              {
                productModel: {
                  name: {
                    contains: query.search,
                    mode: "insensitive",
                  },
                },
              },
              {
                productModel: {
                  productType: {
                    name: {
                      contains: query.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },
    select: {
      productModelId: true,
      availability: true,
      condition: true,
      productModel: {
        select: {
          name: true,
          productType: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })
}
