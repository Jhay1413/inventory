import { NextRequest, NextResponse } from "next/server"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import { TransferListQuerySchema } from "@/types/api/transfers"
import * as service from "@/app/api/_services/transfers-list.service"

export async function handleListTransfers(req: NextRequest) {
  const parsedQuery = TransferListQuerySchema.safeParse({
    direction: req.nextUrl.searchParams.get("direction") ?? undefined,
    status: req.nextUrl.searchParams.get("status") ?? undefined,
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
    const result = await service.listTransfers(parsedQuery.data, {
      organizationId: activeOrganizationId,
    })

    return NextResponse.json({
      transfers: result.transfers,
      pagination: {
        total: result.total,
        limit: parsedQuery.data.limit,
        offset: parsedQuery.data.offset,
        hasMore: parsedQuery.data.offset + parsedQuery.data.limit < result.total,
      },
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch transfers" }, { status: 500 })
  }
}
