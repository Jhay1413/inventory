import {
  CreateProductSchema,
  ProductListQuerySchema,
  ProductResponseSchema,
  ProductsListResponseSchema,
  UpdateProductSchema,
  type CreateProductInput,
  type ProductListQueryInput,
  type ProductResponse,
  type ProductsListResponse,
  type UpdateProductInput,
} from "@/types/api/products"
import {
  ProductAuditLogsResponseSchema,
  type ProductAuditLogsResponse,
} from "@/types/api/product-audit"

class ProductsService {
  private baseUrl = "/api/products"

  async list(filters: ProductListQueryInput = {}): Promise<ProductsListResponse> {
    const parsed = ProductListQuerySchema.parse(filters)

    const params = new URLSearchParams()
    params.append("limit", String(parsed.limit))
    params.append("offset", String(parsed.offset))

    if (parsed.search) params.append("search", parsed.search)
    if (parsed.status) params.append("status", parsed.status)
    if (parsed.productTypeId) params.append("productTypeId", parsed.productTypeId)
    if (parsed.productModelId) params.append("productModelId", parsed.productModelId)
    if (parsed.condition) params.append("condition", parsed.condition)
    if (parsed.availability) params.append("availability", parsed.availability)
    if (parsed.branchId) params.append("branchId", parsed.branchId)

    const res = await fetch(`${this.baseUrl}?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch products")
    }

    const data = await res.json()
    return ProductsListResponseSchema.parse(data)
  }

  async create(payload: CreateProductInput): Promise<ProductResponse> {
    const parsedPayload = CreateProductSchema.parse(payload)

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedPayload),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to create product")
    }

    const data = await res.json()
    return ProductResponseSchema.parse(data)
  }

  async update(id: string, payload: UpdateProductInput): Promise<ProductResponse> {
    const parsedPayload = UpdateProductSchema.parse(payload)

    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedPayload),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to update product")
    }

    const data = await res.json()
    return ProductResponseSchema.parse(data)
  }

  async delete(id: string): Promise<{ message: string }> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to delete product")
    }

    const data = await res.json()
    // API returns { message: "Deleted" }
    return data as { message: string }
  }

  async auditLogs(productId: string): Promise<ProductAuditLogsResponse> {
    const res = await fetch(`${this.baseUrl}/${productId}/audit`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch audit logs")
    }

    const data = await res.json()
    return ProductAuditLogsResponseSchema.parse(data)
  }
}

export const productsService = new ProductsService()
