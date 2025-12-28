import {
  AccessoryListQuerySchema,
  AccessoriesListResponseSchema,
  type AccessoryListQueryInput,
  type AccessoriesListResponse,
  CreateAccessorySchema,
  AccessoryResponseSchema,
  type CreateAccessoryInput,
  type AccessoryResponse,
} from "@/types/api/accessories"

class AccessoriesService {
  private baseUrl = "/api/accessories"

  async list(filters: AccessoryListQueryInput = {}): Promise<AccessoriesListResponse> {
    const parsed = AccessoryListQuerySchema.parse(filters)

    const params = new URLSearchParams()
    if (parsed.search) params.append("search", parsed.search)

    const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ""}`

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData?.error || "Failed to fetch accessories")
    }

    const data = await res.json()
    return AccessoriesListResponseSchema.parse(data)
  }

  async create(payload: CreateAccessoryInput): Promise<AccessoryResponse> {
    const parsed = CreateAccessorySchema.parse(payload)

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData?.error || "Failed to create accessory")
    }

    const data = await res.json()
    return AccessoryResponseSchema.parse(data)
  }
}

export const accessoriesService = new AccessoriesService()
