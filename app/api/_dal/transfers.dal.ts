import { prisma } from "@/app/lib/db"

export async function findProductForTransfer(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      branchId: true,
      availability: true,
    },
  })
}

export async function findOrganizationById(id: string) {
  return prisma.organization.findUnique({
    where: { id },
    select: { id: true },
  })
}

export async function createTransfer(data: {
  productId: string
  fromBranchId: string
  toBranchId: string
  requestedById: string
  reason: string
  notes?: string
}) {
  return prisma.transfer.create({
    data: {
      productId: data.productId,
      fromBranchId: data.fromBranchId,
      toBranchId: data.toBranchId,
      requestedById: data.requestedById,
      reason: data.reason,
      notes: data.notes,
    },
  })
}
