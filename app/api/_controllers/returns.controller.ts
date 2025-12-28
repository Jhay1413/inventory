import { NextRequest, NextResponse } from "next/server"

import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import {
  CreateReturnSchema,
  ReturnListQuerySchema,
  UpdateReturnSchema,
} from "@/types/api/returns"
import * as service from "@/app/api/_services/returns.service"

export async function handleCreateReturn(req: NextRequest) {
  const parsedBody = CreateReturnSchema.safeParse(await req.json().catch(() => null))
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
    const created = await service.createReturn(
      {
        invoiceId: parsedBody.data.invoiceId,
        reason: parsedBody.data.reason,
        notes: parsedBody.data.notes,
        productItems: parsedBody.data.productItems.map((it) => ({
          productId: it.productId,
          defectNotes: it.defectNotes,
          resolution: it.resolution,
          replacementProductId: it.replacementProductId,
        })),
        accessoryItems: parsedBody.data.accessoryItems?.map((it) => ({
          accessoryId: it.accessoryId,
          quantity: it.quantity,
          defectNotes: it.defectNotes,
          resolution: it.resolution,
        })),
      },
      { actorOrganizationId: activeOrganizationId, actorUserId: userId }
    )

    return NextResponse.json({ return: created }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create return"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function handleListReturns(req: NextRequest) {
  const parsedQuery = ReturnListQuerySchema.safeParse({
    limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    offset: req.nextUrl.searchParams.get("offset") ?? undefined,
    status: req.nextUrl.searchParams.get("status") ?? undefined,
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
    const result = await service.listReturns({
      limit: parsedQuery.data.limit,
      offset: parsedQuery.data.offset,
      status: parsedQuery.data.status,
    })

    // Note: returns are scoped by invoice/branch ownership in future; for now relies on auth org isolation.
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch returns" }, { status: 500 })
  }
}

export async function handleGetReturn(req: NextRequest, id: string) {
  const { activeOrganizationId } = await getActiveOrgContext(req)
  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const found = await service.getReturn(id)
    return NextResponse.json({ return: found })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch return"
    const status = message === "Return not found" ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function handleUpdateReturn(req: NextRequest, id: string) {
  const parsedBody = UpdateReturnSchema.safeParse(await req.json().catch(() => null))
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    )
  }

  const { activeOrganizationId } = await getActiveOrgContext(req)
  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const updated = await service.updateReturn(id, { status: parsedBody.data.status })
    return NextResponse.json({ return: updated })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update return"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
