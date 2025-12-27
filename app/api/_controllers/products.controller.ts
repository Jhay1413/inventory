import { NextRequest, NextResponse } from "next/server"
import * as service from "@/app/api/_services/products.service"
import { CreateProductSchema, ProductListQuerySchema, UpdateProductSchema } from "@/types/api/products"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"

export async function handleListProducts(req: NextRequest) {
  const rawSearch = req.nextUrl.searchParams.get("search") ?? undefined
  const rawStatus = req.nextUrl.searchParams.get("status") ?? undefined

  const parsedQuery = ProductListQuerySchema.safeParse({
    limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    offset: req.nextUrl.searchParams.get("offset") ?? undefined,
    branchId: req.nextUrl.searchParams.get("branchId") ?? undefined,
    search: rawSearch?.trim() ? rawSearch.trim() : undefined,
    status: rawStatus?.trim() ? rawStatus.trim() : undefined,
    productTypeId: req.nextUrl.searchParams.get("productTypeId") ?? undefined,
    productModelId: req.nextUrl.searchParams.get("productModelId") ?? undefined,
    condition: req.nextUrl.searchParams.get("condition") ?? undefined,
    availability: req.nextUrl.searchParams.get("availability") ?? undefined,
  })

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: parsedQuery.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 }
    )
  }

  try {
    const { activeOrganizationId, isAdminOrganization } = await getActiveOrgContext(req)
    if (!activeOrganizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requestedBranchId = parsedQuery.data.branchId
    const branchId = isAdminOrganization ? requestedBranchId : activeOrganizationId
    const result = await service.listProducts(parsedQuery.data, { branchId })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function handleCreateProduct(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = CreateProductSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  const { activeOrganizationId, isAdminOrganization, userId } = await getActiveOrgContext(req)
  if (!userId || !activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdminOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const product = await service.createProduct(parsed.data, {
      actorUserId: userId,
      actorOrganizationId: activeOrganizationId,
    })
    return NextResponse.json({ product }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create product"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function handleUpdateProduct(req: NextRequest, id: string) {
  const body = await req.json().catch(() => null)
  const parsed = UpdateProductSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  try {
    const product = await service.updateProduct(id, parsed.data)
    return NextResponse.json({ product })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update product"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function handleGetProduct(req: NextRequest, id: string) {
  try {
    const { activeOrganizationId } = await getActiveOrgContext(req)
    if (!activeOrganizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const product = await service.getProduct(id)
    return NextResponse.json({ product })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch product"
    const status = message === "Product not found" ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function handleDeleteProduct(id: string) {
  try {
    await service.deleteProduct(id)
    return NextResponse.json({ message: "Deleted" })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete product"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
