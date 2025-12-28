import { NextRequest, NextResponse } from "next/server"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import { CreateAccessoryTransferSchema } from "@/types/api/accessory-transfers"
import * as service from "@/app/api/_services/accessory-transfers.service"

export async function handleCreateAccessoryTransfer(req: NextRequest) {
  const parsedBody = CreateAccessoryTransferSchema.safeParse(await req.json().catch(() => null))
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    )
  }

  const { activeOrganizationId, userId } = await getActiveOrgContext(req)
  if (!activeOrganizationId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await service.createAccessoryTransfer(parsedBody.data, {
      fromBranchId: activeOrganizationId,
      requestedById: userId,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ transfer: result.transfer }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create transfer"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
