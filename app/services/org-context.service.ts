import {
  OrgContextResponse,
  OrgContextResponseSchema,
} from "@/types/api/org-context"

export const orgContextService = {
  async get(): Promise<OrgContextResponse> {
    const response = await fetch("/api/auth/org-context", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to load organization context")
    }

    const data = await response.json()
    return OrgContextResponseSchema.parse(data)
  },
}
