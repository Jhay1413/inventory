import { NextRequest, NextResponse } from "next/server"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import {
  AccessoryStockListQuerySchema,
  CreateAccessoryStockSchema,
} from "@/types/api/accessory-stock"
import * as service from "@/app/api/_services/accessory-stock.service"

export async function handleListAccessoryStock(req: NextRequest) {
  const parsedQuery = AccessoryStockListQuerySchema.safeParse({
    accessoryId: req.nextUrl.searchParams.get("accessoryId") ?? undefined,
    branchId: req.nextUrl.searchParams.get("branchId") ?? undefined,
    limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    offset: req.nextUrl.searchParams.get("offset") ?? undefined,
  })

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: parsedQuery.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 }
    )
  }

  const { activeOrganizationId, isAdminOrganization } = await getActiveOrgContext(req)
  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const requestedBranchId = parsedQuery.data.branchId
  let branchId: string | undefined = requestedBranchId

  if (!isAdminOrganization) {
    // Branch users can view overall inventory (all branches) when no branch is requested.
    // If they do request a branch filter, only allow their active branch.
    if (requestedBranchId && requestedBranchId !== activeOrganizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    branchId = requestedBranchId ? activeOrganizationId : undefined
  }

  try {
    const result = await service.listAccessoryStocks({
      accessoryId: parsedQuery.data.accessoryId,
      branchId,
      limit: parsedQuery.data.limit,
      offset: parsedQuery.data.offset,
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch accessory stock" }, { status: 500 })
  }
}

export async function handleAddAccessoryStock(req: NextRequest) {
  const parsedBody = CreateAccessoryStockSchema.safeParse(await req.json().catch(() => null))
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    )
  }

  const { activeOrganizationId, isAdminOrganization } = await getActiveOrgContext(req)
  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdminOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const stock = await service.addAccessoryStock(
      {
        accessoryId: parsedBody.data.accessoryId,
        quantity: parsedBody.data.quantity,
      },
      { actorOrganizationId: activeOrganizationId, isAdminOrganization }
    )

    return NextResponse.json({ stock }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to add accessory stock"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
