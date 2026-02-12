import { NextRequest, NextResponse } from "next/server"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import { AccessoryTransferListQuerySchema } from "@/types/api/accessory-transfers"
import * as service from "@/app/api/_services/accessory-transfers.service"

export async function handleListAccessoryTransfers(req: NextRequest) {
  const parsedQuery = AccessoryTransferListQuerySchema.safeParse({
    direction: req.nextUrl.searchParams.get("direction") ?? undefined,
    status: req.nextUrl.searchParams.get("status") ?? undefined,
    statusNot: req.nextUrl.searchParams.get("statusNot") ?? undefined,
    search: req.nextUrl.searchParams.get("search") ?? undefined,
    limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    offset: req.nextUrl.searchParams.get("offset") ?? undefined,
  })

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: parsedQuery.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 }
    )
  }

  const { activeOrganizationId } = await getActiveOrgContext(req)
  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await service.listAccessoryTransfers(parsedQuery.data, {
      branchId: activeOrganizationId,
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch transfers" }, { status: 500 })
  }
}
