import { NextRequest, NextResponse } from "next/server"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import {
  AccessoryListQuerySchema,
  CreateAccessorySchema,
} from "@/types/api/accessories"
import * as service from "@/app/api/_services/accessories.service"

export async function handleListAccessories(req: NextRequest) {
  const parsedQuery = AccessoryListQuerySchema.safeParse({
    search: req.nextUrl.searchParams.get("search") ?? undefined,
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
    const accessories = await service.listAccessories({ search: parsedQuery.data.search })
    return NextResponse.json({ accessories })
  } catch {
    return NextResponse.json({ error: "Failed to fetch accessories" }, { status: 500 })
  }
}

export async function handleCreateAccessory(req: NextRequest) {
  const parsedBody = CreateAccessorySchema.safeParse(await req.json().catch(() => null))

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
    const accessory = await service.createAccessory(
      { name: parsedBody.data.name },
      { actorOrganizationId: activeOrganizationId, isAdminOrganization }
    )

    return NextResponse.json({ accessory }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create accessory"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
