import { prisma } from "@/app/lib/db"

export async function upsertAccessoryStock(args: {
  accessoryId: string
  branchId: string
  addQuantity: number
}) {
  return prisma.accessoryStock.upsert({
    where: {
      accessoryId_branchId: {
        accessoryId: args.accessoryId,
        branchId: args.branchId,
      },
    },
    create: {
      accessoryId: args.accessoryId,
      branchId: args.branchId,
      quantity: args.addQuantity,
    },
    update: {
      quantity: {
        increment: args.addQuantity,
      },
    },
    include: {
      accessory: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true, slug: true } },
    },
  })
}

export async function listAccessoryStocks(filters: {
  accessoryId?: string
  branchId?: string
  limit?: number
  offset?: number
}) {
  return prisma.accessoryStock.findMany({
    where: {
      ...(filters.accessoryId ? { accessoryId: filters.accessoryId } : {}),
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
    },
    include: {
      accessory: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
    take: filters.limit,
    skip: filters.offset,
  })
}

export async function countAccessoryStocks(filters: { accessoryId?: string; branchId?: string }) {
  return prisma.accessoryStock.count({
    where: {
      ...(filters.accessoryId ? { accessoryId: filters.accessoryId } : {}),
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
    },
  })
}

export async function getAccessoryStock(args: { accessoryId: string; branchId: string }) {
  return prisma.accessoryStock.findUnique({
    where: { accessoryId_branchId: args },
  })
}
