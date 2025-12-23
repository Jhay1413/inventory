import {
  InventoryQuerySchema,
  InventoryResponseSchema,
  type InventoryQueryInput,
  type InventoryResponse,
} from "@/types/api/inventory"

class InventoryService {
  private baseUrl = "/api/inventory"

  async get(query: InventoryQueryInput = {}): Promise<InventoryResponse> {
    const parsed = InventoryQuerySchema.parse(query)

    const params = new URLSearchParams()
    if (parsed.productTypeId) params.append("productTypeId", parsed.productTypeId)
    if (parsed.availability) params.append("availability", parsed.availability)
    if (parsed.condition) params.append("condition", parsed.condition)
    if (parsed.search) params.append("search", parsed.search)

    const res = await fetch(`${this.baseUrl}?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch inventory")
    }

    const data = await res.json()
    return InventoryResponseSchema.parse(data)
  }
}

export const inventoryService = new InventoryService()
