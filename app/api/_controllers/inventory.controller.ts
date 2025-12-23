import { NextRequest, NextResponse } from "next/server"
import { InventoryQuerySchema } from "@/types/api/inventory"
import * as service from "@/app/api/_services/inventory.service"

export async function handleGetInventory(req: NextRequest) {
  const rawSearch = req.nextUrl.searchParams.get("search") ?? undefined

  const parsedQuery = InventoryQuerySchema.safeParse({
    productTypeId: req.nextUrl.searchParams.get("productTypeId") ?? undefined,
    availability: req.nextUrl.searchParams.get("availability") ?? undefined,
    condition: req.nextUrl.searchParams.get("condition") ?? undefined,
    search: rawSearch?.trim() ? rawSearch.trim() : undefined,
  })

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: parsedQuery.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 }
    )
  }

  try {
    const result = await service.getInventory(parsedQuery.data)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}
