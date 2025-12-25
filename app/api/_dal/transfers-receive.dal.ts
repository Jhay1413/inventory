import { prisma } from "@/app/lib/db"
import { createProductAuditLog } from "@/app/api/_dal/product-audit.dal"

export async function receiveTransfer(args: { transferId: string; receiverOrgId: string; receiverUserId: string }) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.transfer.findUnique({
      where: { id: args.transferId },
      select: {
        id: true,
        status: true,
        productId: true,
        fromBranchId: true,
        toBranchId: true,
      },
    })

    if (!transfer) {
      return { ok: false as const, error: "Transfer not found" }
    }

    if (transfer.toBranchId !== args.receiverOrgId) {
      return { ok: false as const, error: "You can only receive transfers sent to your branch" }
    }

    if (transfer.status === "Completed") {
      return { ok: false as const, error: "Transfer is already received" }
    }

    if (transfer.status === "Cancelled" || transfer.status === "Rejected") {
      return { ok: false as const, error: `Cannot receive a ${transfer.status.toLowerCase()} transfer` }
    }

    const product = await tx.product.findUnique({
      where: { id: transfer.productId },
      select: { id: true, branchId: true, availability: true },
    })

    if (!product) {
      return { ok: false as const, error: "Product not found" }
    }

    if (product.availability !== "Available") {
      return { ok: false as const, error: "Product is not available" }
    }

    // Safety: ensure the product is still in the source branch before moving.
    if (product.branchId !== transfer.fromBranchId) {
      return { ok: false as const, error: "Product is no longer in the source branch" }
    }

    await tx.product.update({
      where: { id: transfer.productId },
      data: { branchId: transfer.toBranchId },
    })

    const updatedTransfer = await tx.transfer.update({
      where: { id: transfer.id },
      data: {
        status: "Completed",
        receivedById: args.receiverUserId,
        receivedAt: new Date(),
      },
    })

    await createProductAuditLog(tx, {
      productId: transfer.productId,
      action: "TransferReceived",
      actorUserId: args.receiverUserId,
      actorOrganizationId: args.receiverOrgId,
      fromBranchId: transfer.fromBranchId,
      toBranchId: transfer.toBranchId,
      transferId: transfer.id,
      details: {
        status: updatedTransfer.status,
        receivedAt: updatedTransfer.receivedAt?.toISOString() ?? null,
      },
    })

    return { ok: true as const, transfer: updatedTransfer }
  })
}
