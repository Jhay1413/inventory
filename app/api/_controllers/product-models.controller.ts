import { NextRequest, NextResponse } from "next/server"
import * as service from "../_services/product-models.service"
import {
  CreateProductModelSchema,
  ProductModelListQuerySchema,
  UpdateProductModelSchema,
} from "@/types/api/product-models"

export async function handleListProductModels(req: NextRequest) {
  const productTypeIdParam = req.nextUrl.searchParams.get("productTypeId")
  const searchParam = req.nextUrl.searchParams.get("search")

  const parsedQuery = ProductModelListQuerySchema.safeParse({
    productTypeId: productTypeIdParam?.trim() || undefined,
    search: searchParam?.trim() || undefined,
    limit: req.nextUrl.searchParams.get("limit") ?? undefined,
    offset: req.nextUrl.searchParams.get("offset") ?? undefined,
  })

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: parsedQuery.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 }
    )
  }

  try {
    const result = await service.listProductModels(parsedQuery.data)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch product models" }, { status: 500 })
  }
}

export async function handleCreateProductModel(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = CreateProductModelSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  try {
    const productModel = await service.createProductModel(parsed.data)
    return NextResponse.json({ productModel }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create product model"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function handleGetProductModel(id: string) {
  try {
    const productModel = await service.getProductModel(id)
    if (!productModel) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ productModel })
  } catch {
    return NextResponse.json({ error: "Failed to fetch product model" }, { status: 500 })
  }
}

export async function handleUpdateProductModel(req: Request, id: string) {
  const body = await req.json().catch(() => null)
  const parsed = UpdateProductModelSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  try {
    const productModel = await service.updateProductModel(id, parsed.data)
    return NextResponse.json({ productModel })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update product model"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function handleDeleteProductModel(id: string) {
  try {
    await service.deleteProductModel(id)
    return NextResponse.json({ message: "Deleted" })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete product model"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
