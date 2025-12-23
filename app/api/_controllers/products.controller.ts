import { NextRequest, NextResponse } from "next/server"
import * as service from "@/app/api/_services/products.service"
import { CreateProductSchema, ProductListQuerySchema, UpdateProductSchema } from "@/types/api/products"

export async function handleListProducts(req: NextRequest) {
  const rawSearch = req.nextUrl.searchParams.get("search") ?? undefined
  const rawStatus = req.nextUrl.searchParams.get("status") ?? undefined

  const parsedQuery = ProductListQuerySchema.safeParse({
    limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    offset: req.nextUrl.searchParams.get("offset") ?? undefined,
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
    const result = await service.listProducts(parsedQuery.data)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function handleCreateProduct(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = CreateProductSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  try {
    const product = await service.createProduct(parsed.data)
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

export async function handleDeleteProduct(id: string) {
  try {
    await service.deleteProduct(id)
    return NextResponse.json({ message: "Deleted" })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete product"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
