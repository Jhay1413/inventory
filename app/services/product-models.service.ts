import {
  CreateProductModelSchema,
  ProductModelListQuerySchema,
  ProductModelResponseSchema,
  ProductModelsListResponseSchema,
  UpdateProductModelSchema,
  type CreateProductModelInput,
  type ProductModelListQueryInput,
  type ProductModel,
  type ProductModelResponse,
  type ProductModelsListResponse,
  type UpdateProductModelInput,
} from "@/types/api/product-models"
import { z } from "zod"

class ProductModelsService {
  private baseUrl = "/api/product-models"

  async list(filters: ProductModelListQueryInput = {}): Promise<ProductModelsListResponse> {
    const parsed = ProductModelListQuerySchema.parse(filters)

    const params = new URLSearchParams()
    if (parsed.productTypeId) params.append("productTypeId", parsed.productTypeId)
    if (parsed.search) params.append("search", parsed.search)
    params.append("limit", String(parsed.limit))
    params.append("offset", String(parsed.offset))

    const url = `${this.baseUrl}?${params.toString()}`

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch product models")
    }

    const data = await res.json()
    return ProductModelsListResponseSchema.parse(data)
  }

  async listAllByProductType(productTypeId: string, search?: string): Promise<ProductModel[]> {
    const trimmedProductTypeId = productTypeId.trim()
    if (!trimmedProductTypeId) return []

    const normalizedSearch = search?.trim() ? search.trim() : undefined

    const pageSize = 100
    const maxPages = 1000

    const results: ProductModel[] = []
    let offset = 0
    for (let page = 0; page < maxPages; page += 1) {
      const pageResult = await this.list({
        productTypeId: trimmedProductTypeId,
        search: normalizedSearch,
        limit: pageSize,
        offset,
      })

      results.push(...pageResult.productModels)

      if (!pageResult.pagination.hasMore) break
      offset += pageSize
    }

    return results
  }

  async getById(id: string): Promise<ProductModelResponse> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch product model")
    }

    const data = await res.json()
    return ProductModelResponseSchema.parse(data)
  }

  async create(payload: CreateProductModelInput): Promise<ProductModelResponse> {
    const parsedPayload = CreateProductModelSchema.parse(payload)

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedPayload),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to create product model")
    }

    const data = await res.json()
    return ProductModelResponseSchema.parse(data)
  }

  async update(id: string, payload: UpdateProductModelInput): Promise<ProductModelResponse> {
    const parsedPayload = UpdateProductModelSchema.parse(payload)

    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedPayload),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to update product model")
    }

    const data = await res.json()
    return ProductModelResponseSchema.parse(data)
  }

  async delete(id: string): Promise<{ message: string }> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to delete product model")
    }

    const data = await res.json()
    return z.object({ message: z.string() }).parse(data)
  }
}

export const productModelsService = new ProductModelsService()
