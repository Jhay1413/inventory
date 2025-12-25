import { ProductAvailability } from "@/types/api/products"
import type { CreateTransferInput } from "@/types/api/transfers"
import * as dal from "@/app/api/_dal/transfers.dal"
import { prisma } from "@/app/lib/db"
import { createProductAuditLog } from "@/app/api/_dal/product-audit.dal"

export async function createTransfer(
  input: CreateTransferInput,
  ctx: { fromBranchId: string; requestedById: string }
) {
  const toOrg = await dal.findOrganizationById(input.toBranchId)
  if (!toOrg) {
    return { ok: false as const, error: "Destination branch not found" }
  }
  if (input.toBranchId === ctx.fromBranchId) {
    return { ok: false as const, error: "Destination branch must be different" }
  }

  const product = await dal.findProductForTransfer(input.productId)
  if (!product) {
    return { ok: false as const, error: "Product not found" }
  }
  if (!product.branchId || product.branchId !== ctx.fromBranchId) {
    return { ok: false as const, error: "Product is not in the source branch" }
  }
  if (product.availability !== ProductAvailability.AVAILABLE) {
    return { ok: false as const, error: "Product is not available for transfer" }
  }

  const transfer = await dal.createTransfer({
    productId: input.productId,
    fromBranchId: ctx.fromBranchId,
    toBranchId: input.toBranchId,
    requestedById: ctx.requestedById,
    reason: input.reason,
    notes: input.notes,
  })

  await createProductAuditLog(prisma, {
    productId: input.productId,
    action: "TransferRequested",
    actorUserId: ctx.requestedById,
    actorOrganizationId: ctx.fromBranchId,
    fromBranchId: ctx.fromBranchId,
    toBranchId: input.toBranchId,
    transferId: transfer.id,
    details: {
      reason: input.reason,
      notes: input.notes ?? null,
      status: transfer.status,
    },
  })

  return { ok: true as const, transfer }
}
