import {
  BranchesListResponseSchema,
  type BranchesListResponse,
} from "@/types/api/branches"
import type { BranchFormValues } from "@/types/branch"
import {
  CreateBranchResponseSchema,
  type CreateBranchResponse,
} from "@/types/api/branches"

class BranchesService {
  private baseUrl = "/api/branches"

  async list(): Promise<BranchesListResponse> {
    const res = await fetch(this.baseUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch branches")
    }

    const data = await res.json()
    return BranchesListResponseSchema.parse(data)
  }

  async create(input: BranchFormValues) {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to create branch")
    }

    const data = await res.json().catch(() => ({}))
    return CreateBranchResponseSchema.parse(data) as CreateBranchResponse
  }
}

export const branchesService = new BranchesService()
