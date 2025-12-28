import {
  CreateReturnSchema,
  ReturnListQuerySchema,
  ReturnResponseSchema,
  ReturnsListResponseSchema,
  UpdateReturnSchema,
  type CreateReturnInput,
  type ReturnListQueryInput,
  type ReturnResponse,
  type ReturnsListResponse,
  type UpdateReturnInput,
} from "@/types/api/returns"

class ReturnsService {
  private baseUrl = "/api/returns"

  async list(query: ReturnListQueryInput = {}): Promise<ReturnsListResponse> {
    const parsed = ReturnListQuerySchema.parse(query)

    const params = new URLSearchParams()
    params.append("limit", String(parsed.limit))
    params.append("offset", String(parsed.offset))
    if (parsed.status) params.append("status", parsed.status)

    const res = await fetch(`${this.baseUrl}?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData?.error || "Failed to fetch returns")
    }

    const data = await res.json()
    return ReturnsListResponseSchema.parse(data)
  }

  async get(id: string): Promise<ReturnResponse> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData?.error || "Failed to fetch return")
    }

    const data = await res.json()
    return ReturnResponseSchema.parse(data)
  }

  async create(payload: CreateReturnInput): Promise<ReturnResponse> {
    const parsed = CreateReturnSchema.parse(payload)

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData?.error || "Failed to create return")
    }

    const data = await res.json()
    return ReturnResponseSchema.parse(data)
  }

  async update(id: string, payload: UpdateReturnInput): Promise<ReturnResponse> {
    const parsed = UpdateReturnSchema.parse(payload)

    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData?.error || "Failed to update return")
    }

    const data = await res.json()
    return ReturnResponseSchema.parse(data)
  }
}

export const returnsService = new ReturnsService()
