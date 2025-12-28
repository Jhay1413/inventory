import { prisma } from "@/app/lib/db"

export async function receiveAccessoryTransfer(args: {
  transferId: string
  receiverOrgId: string
  receiverUserId: string
}) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.accessoryTransfer.findUnique({
      where: { id: args.transferId },
      select: {
        id: true,
        status: true,
        accessoryId: true,
        fromBranchId: true,
        toBranchId: true,
        quantity: true,
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

    const fromStock = await tx.accessoryStock.findUnique({
      where: {
        accessoryId_branchId: {
          accessoryId: transfer.accessoryId,
          branchId: transfer.fromBranchId,
        },
      },
      select: { quantity: true },
    })

    const available = fromStock?.quantity ?? 0
    if (available < transfer.quantity) {
      return { ok: false as const, error: "Insufficient accessory stock in source branch" }
    }

    await tx.accessoryStock.update({
      where: {
        accessoryId_branchId: {
          accessoryId: transfer.accessoryId,
          branchId: transfer.fromBranchId,
        },
      },
      data: {
        quantity: { decrement: transfer.quantity },
      },
    })

    await tx.accessoryStock.upsert({
      where: {
        accessoryId_branchId: {
          accessoryId: transfer.accessoryId,
          branchId: transfer.toBranchId,
        },
      },
      create: {
        accessoryId: transfer.accessoryId,
        branchId: transfer.toBranchId,
        quantity: transfer.quantity,
      },
      update: {
        quantity: { increment: transfer.quantity },
      },
    })

    const updatedTransfer = await tx.accessoryTransfer.update({
      where: { id: transfer.id },
      data: {
        status: "Completed",
        receivedById: args.receiverUserId,
        receivedAt: new Date(),
      },
    })

    return { ok: true as const, transfer: updatedTransfer }
  })
}
