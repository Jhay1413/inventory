import {
  TransferResponseSchema,
  type CreateTransferInput,
  type TransferResponse,
  TransfersListResponseSchema,
  type TransferListQueryInput,
} from "@/types/api/transfers"
import { ProductsListResponseSchema, type ProductListQueryInput } from "@/types/api/products"

class TransfersService {
  private baseUrl = "/api/transfers"

  async create(payload: CreateTransferInput): Promise<TransferResponse> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to create transfer")
    }

    const data = await res.json()
    return TransferResponseSchema.parse(data)
  }

  async searchProductsForTransfer(filters: Pick<ProductListQueryInput, "search" | "limit" | "offset">) {
    const params = new URLSearchParams()
    if (filters.limit) params.append("limit", String(filters.limit))
    if (filters.offset) params.append("offset", String(filters.offset))
    if (filters.search) params.append("search", filters.search)

    const url = `${this.baseUrl}/products${params.toString() ? `?${params.toString()}` : ""}`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to fetch products")
    }

    const data = await res.json()
    return ProductsListResponseSchema.parse(data)
  }

  async list(filters: TransferListQueryInput) {
    const params = new URLSearchParams()
    if (filters.direction) params.append("direction", String(filters.direction))
    if (filters.status) params.append("status", String(filters.status))
    if (filters.limit) params.append("limit", String(filters.limit))
    if (filters.offset) params.append("offset", String(filters.offset))

    const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ""}`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to fetch transfers")
    }

    const data = await res.json()
    return TransfersListResponseSchema.parse(data)
  }

  async receive(id: string): Promise<TransferResponse> {
    const res = await fetch(`${this.baseUrl}/${id}/receive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to receive transfer")
    }

    const data = await res.json()
    return TransferResponseSchema.parse(data)
  }
}

export const transfersService = new TransfersService()
