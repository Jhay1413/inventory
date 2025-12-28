import * as dal from "@/app/api/_dal/returns.dal"

export async function createReturn(
  input: {
    invoiceId: string
    reason?: string
    notes?: string
    productItems: Array<{
      productId: string
      defectNotes?: string
      resolution: "Exchange" | "Repair"
      replacementProductId?: string
    }>
    accessoryItems?: Array<{
      accessoryId: string
      quantity: number
      defectNotes?: string
      resolution: "Exchange" | "Repair"
    }>
  },
  ctx: { actorOrganizationId: string; actorUserId: string }
) {
  return dal.createReturnTx({
    invoiceId: input.invoiceId,
    branchId: ctx.actorOrganizationId,
    createdById: ctx.actorUserId,
    reason: input.reason,
    notes: input.notes,
    productItems: input.productItems,
    accessoryItems: input.accessoryItems,
  })
}

export async function getReturn(id: string) {
  const found = await dal.getReturnById(id)
  if (!found) throw new Error("Return not found")
  return found
}

export async function listReturns(query: {
  limit: number
  offset: number
  status?: "Open" | "Processing" | "Completed" | "Rejected"
}) {
  const [total, returns] = await Promise.all([
    dal.countReturns({ status: query.status }),
    dal.listReturns(query),
  ])

  return {
    returns,
    pagination: {
      total,
      limit: query.limit,
      offset: query.offset,
      hasMore: query.offset + query.limit < total,
    },
  }
}

export async function updateReturn(id: string, input: { status?: "Open" | "Processing" | "Completed" | "Rejected" }) {
  if (!input.status) throw new Error("No fields to update")
  return dal.updateReturnStatus(id, input.status)
}
