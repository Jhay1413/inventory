import { NextResponse } from "next/server"
import * as service from "../_services/product-types.service"
import { CreateProductTypeSchema } from "@/types/api/product-types"

export async function handleGetProductTypes() {
  try {
    const productTypes = await service.getProductTypes()
    return NextResponse.json({ productTypes })
  } catch {
    return NextResponse.json({ error: "Failed to fetch product types" }, { status: 500 })
  }
}

export async function handleCreateProductType(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const parsed = CreateProductTypeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      )
    }

    const productType = await service.addProductType(parsed.data.name)
    return NextResponse.json({ productType }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create product type"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
