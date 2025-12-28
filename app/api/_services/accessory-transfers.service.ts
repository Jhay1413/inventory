import type { CreateAccessoryTransferInput, AccessoryTransferListQuery } from "@/types/api/accessory-transfers"
import * as transfersDal from "@/app/api/_dal/accessory-transfers.dal"
import * as stockDal from "@/app/api/_dal/accessory-stock.dal"

export async function createAccessoryTransfer(
  input: CreateAccessoryTransferInput,
  ctx: { fromBranchId: string; requestedById: string }
): Promise<{ ok: true; transfer: unknown } | { ok: false; error: string }> {
  if (input.toBranchId === ctx.fromBranchId) {
    return { ok: false, error: "Destination branch must be different" }
  }

  const toOrg = await transfersDal.findOrganizationById(input.toBranchId)
  if (!toOrg) {
    return { ok: false, error: "Destination branch not found" }
  }

  const stock = await stockDal.getAccessoryStock({
    accessoryId: input.accessoryId,
    branchId: ctx.fromBranchId,
  })

  const available = stock?.quantity ?? 0
  if (available < input.quantity) {
    return { ok: false, error: "Insufficient accessory stock" }
  }

  const transfer = await transfersDal.createAccessoryTransfer({
    accessoryId: input.accessoryId,
    fromBranchId: ctx.fromBranchId,
    toBranchId: input.toBranchId,
    requestedById: ctx.requestedById,
    quantity: input.quantity,
    reason: input.reason,
    notes: input.notes,
  })

  return { ok: true, transfer }
}

export async function listAccessoryTransfers(
  query: AccessoryTransferListQuery,
  ctx: { branchId: string }
) {
  const { total, transfers } = await transfersDal.listAccessoryTransfers({
    branchId: ctx.branchId,
    direction: query.direction,
    status: query.status,
    limit: query.limit,
    offset: query.offset,
  })

  return {
    transfers,
    pagination: {
      total,
      limit: query.limit,
      offset: query.offset,
      hasMore: query.offset + query.limit < total,
    },
  }
}
