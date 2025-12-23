import {
  CreateProductTypeSchema,
  ProductTypeResponseSchema,
  ProductTypesListResponseSchema,
  type CreateProductTypeInput,
  type ProductTypeResponse,
  type ProductTypesListResponse,
} from "@/types/api/product-types"

class ProductTypesService {
  private baseUrl = "/api/product-types"

  async getAll(): Promise<ProductTypesListResponse> {
    const res = await fetch(this.baseUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch product types")
    }

    const data = await res.json()
    return ProductTypesListResponseSchema.parse(data)
  }

  async create(payload: CreateProductTypeInput): Promise<ProductTypeResponse> {
    const parsedPayload = CreateProductTypeSchema.parse(payload)

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedPayload),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to create product type")
    }

    const data = await res.json()
    return ProductTypeResponseSchema.parse(data)
  }
}

export const productTypesService = new ProductTypesService()
