import {
  OrganizationsListResponseSchema,
  type OrganizationsListResponse,
} from "@/types/api/organizations"

class OrganizationsService {
  private baseUrl = "/api/organizations"

  async list(): Promise<OrganizationsListResponse> {
    const res = await fetch(this.baseUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch organizations")
    }

    const data = await res.json()
    return OrganizationsListResponseSchema.parse(data)
  }
}

export const organizationsService = new OrganizationsService()
