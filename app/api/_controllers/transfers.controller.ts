import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/lib/auth"
import { CreateTransferSchema } from "@/types/api/transfers"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import * as service from "@/app/api/_services/transfers.service"

export async function handleCreateTransfer(req: NextRequest) {
  const parsedBody = CreateTransferSchema.safeParse(await req.json().catch(() => null))
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    )
  }

  const sessionResponse = await auth.api.getSession({ headers: req.headers })
  const requestedById =
    (sessionResponse as any)?.user?.id ??
    (sessionResponse as any)?.session?.userId ??
    null

  if (!requestedById) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { activeOrganizationId } = await getActiveOrgContext(req)
  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await service.createTransfer(parsedBody.data, {
    fromBranchId: activeOrganizationId,
    requestedById,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ transfer: result.transfer }, { status: 201 })
}
