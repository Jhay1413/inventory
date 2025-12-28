import {
  AccessoryStockListQuerySchema,
  AccessoryStockListResponseSchema,
  type AccessoryStockListQueryInput,
  type AccessoryStockListResponse,
  CreateAccessoryStockSchema,
  AccessoryStockResponseSchema,
  type CreateAccessoryStockInput,
  type AccessoryStockResponse,
} from "@/types/api/accessory-stock"

class AccessoryStockService {
  private baseUrl = "/api/accessory-stock"

  async list(filters: AccessoryStockListQueryInput = {}): Promise<AccessoryStockListResponse> {
    const parsed = AccessoryStockListQuerySchema.parse(filters)

    const params = new URLSearchParams()
    params.append("limit", String(parsed.limit))
    params.append("offset", String(parsed.offset))
    if (parsed.accessoryId) params.append("accessoryId", parsed.accessoryId)
    if (parsed.branchId) params.append("branchId", parsed.branchId)

    const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ""}`
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData?.error || "Failed to fetch accessory stock")
    }

    const data = await res.json()
    return AccessoryStockListResponseSchema.parse(data)
  }

  async add(payload: CreateAccessoryStockInput): Promise<AccessoryStockResponse> {
    const parsed = CreateAccessoryStockSchema.parse(payload)

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData?.error || "Failed to add accessory stock")
    }

    const data = await res.json()
    return AccessoryStockResponseSchema.parse(data)
  }
}

export const accessoryStockService = new AccessoryStockService()
