import { NextRequest, NextResponse } from "next/server"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import { ProductAvailability, ProductListQuerySchema } from "@/types/api/products"
import * as productsService from "@/app/api/_services/products.service"

export async function GET(req: NextRequest) {
  const { activeOrganizationId } = await getActiveOrgContext(req)
  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rawSearch = req.nextUrl.searchParams.get("search") ?? undefined

  const parsedQuery = ProductListQuerySchema.safeParse({
    limit: req.nextUrl.searchParams.get("limit") ?? 10,
    offset: req.nextUrl.searchParams.get("offset") ?? 0,
    search: rawSearch?.trim() ? rawSearch.trim() : undefined,
    availability: ProductAvailability.AVAILABLE,
  })

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: parsedQuery.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 }
    )
  }

  try {
    // Critical: ALWAYS scope to active org (even for admin org users)
    const result = await productsService.listProducts(parsedQuery.data, {
      branchId: activeOrganizationId,
    })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
