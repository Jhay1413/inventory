import { ProductStatsResponseSchema, type ProductStatsResponse } from "@/types/api/product-stats"

class ProductStatsService {
  private baseUrl = "/api/products/stats"

  async get(): Promise<ProductStatsResponse> {
    const res = await fetch(this.baseUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch product stats")
    }

    const data = await res.json()
    return ProductStatsResponseSchema.parse(data)
  }
}

export const productStatsService = new ProductStatsService()
