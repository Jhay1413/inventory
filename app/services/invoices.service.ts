import {
  InvoicesListResponseSchema,
  InvoiceResponseSchema,
  InvoiceStatsResponseSchema,
  type CreateInvoiceInput,
  type InvoiceListQueryInput,
  type InvoiceStatsQueryInput,
  type UpdateInvoiceInput,
} from "@/types/api/invoices"
import {
  ProductsListResponseSchema,
  type ProductListQueryInput,
} from "@/types/api/products"

class InvoicesService {
  private baseUrl = "/api/invoices"

  async create(payload: CreateInvoiceInput) {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to create invoice")
    }

    const data = await res.json()
    return InvoiceResponseSchema.parse(data)
  }

  async list(filters: InvoiceListQueryInput) {
    const params = new URLSearchParams()
    if (filters.limit) params.append("limit", String(filters.limit))
    if (filters.offset) params.append("offset", String(filters.offset))
    if (filters.search) params.append("search", filters.search)
    if (filters.status) params.append("status", filters.status)
    if (filters.paymentType) params.append("paymentType", filters.paymentType)
    if (filters.branchId) params.append("branchId", filters.branchId)
    if (filters.productTypeId) params.append("productTypeId", filters.productTypeId)
    if (filters.condition) params.append("condition", filters.condition)

    const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ""}`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to fetch invoices")
    }

    const data = await res.json()
    return InvoicesListResponseSchema.parse(data)
  }

  async stats(filters?: InvoiceStatsQueryInput) {
    const params = new URLSearchParams()
    if (filters?.branchId) params.append("branchId", filters.branchId)

    const url = `${this.baseUrl}/stats${params.toString() ? `?${params.toString()}` : ""}`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to fetch sales stats")
    }

    const data = await res.json()
    return InvoiceStatsResponseSchema.parse(data)
  }

  async getById(id: string) {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to fetch invoice")
    }

    const data = await res.json()
    return InvoiceResponseSchema.parse(data)
  }

  async update(id: string, payload: UpdateInvoiceInput) {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || "Failed to update invoice")
    }

    const data = await res.json()
    return InvoiceResponseSchema.parse(data)
  }

  async searchProductsForInvoice(
    filters: Pick<ProductListQueryInput, "search" | "limit" | "offset">
  ) {
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
}

export const invoicesService = new InvoicesService()
