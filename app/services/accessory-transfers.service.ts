import {
  AccessoryTransferResponseSchema,
  AccessoryTransfersListResponseSchema,
  AccessoryTransferListQuerySchema,
  type CreateAccessoryTransferInput,
  type AccessoryTransferResponse,
  type AccessoryTransfersListResponse,
  type AccessoryTransferListQueryInput,
} from "@/types/api/accessory-transfers"

class AccessoryTransfersService {
  private baseUrl = "/api/accessory-transfers"

  async create(payload: CreateAccessoryTransferInput): Promise<AccessoryTransferResponse> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to create transfer")
    }

    const data = await res.json()
    return AccessoryTransferResponseSchema.parse(data)
  }

  async list(filters: AccessoryTransferListQueryInput): Promise<AccessoryTransfersListResponse> {
    const parsed = AccessoryTransferListQuerySchema.parse(filters)

    const params = new URLSearchParams()
    if (parsed.direction) params.append("direction", String(parsed.direction))
    if (parsed.status) params.append("status", String(parsed.status))
    if (parsed.statusNot) params.append("statusNot", String(parsed.statusNot))
    if (parsed.search) params.append("search", parsed.search)
    if (parsed.limit) params.append("limit", String(parsed.limit))
    if (parsed.offset) params.append("offset", String(parsed.offset))

    const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ""}`
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to fetch transfers")
    }

    const data = await res.json()
    return AccessoryTransfersListResponseSchema.parse(data)
  }

  async receive(id: string): Promise<AccessoryTransferResponse> {
    const res = await fetch(`${this.baseUrl}/${id}/receive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to receive transfer")
    }

    const data = await res.json()
    return AccessoryTransferResponseSchema.parse(data)
  }
}

export const accessoryTransfersService = new AccessoryTransfersService()
