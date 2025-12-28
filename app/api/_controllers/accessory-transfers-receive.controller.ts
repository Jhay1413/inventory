import { NextRequest, NextResponse } from "next/server"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import * as service from "@/app/api/_services/accessory-transfers-receive.service"

export async function handleReceiveAccessoryTransfer(req: NextRequest, params: { id: string }) {
  const { activeOrganizationId, userId } = await getActiveOrgContext(req)
  if (!activeOrganizationId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const transferId = params.id
  if (!transferId) {
    return NextResponse.json({ error: "Transfer id is required" }, { status: 400 })
  }

  try {
    const result = await service.receiveAccessoryTransfer({
      transferId,
      receiverOrgId: activeOrganizationId,
      receiverUserId: userId,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ transfer: result.transfer })
  } catch {
    return NextResponse.json({ error: "Failed to receive transfer" }, { status: 500 })
  }
}
