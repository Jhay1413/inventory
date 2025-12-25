import {
  DashboardSummaryResponse,
  DashboardSummaryResponseSchema,
} from "@/types/api/dashboard"

export const dashboardService = {
  async adminSummary(): Promise<DashboardSummaryResponse> {
    const response = await fetch("/api/dashboard/admin", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to load admin dashboard")
    }

    const data = await response.json()
    return DashboardSummaryResponseSchema.parse(data)
  },

  async branchSummary(): Promise<DashboardSummaryResponse> {
    const response = await fetch("/api/dashboard/branch", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to load branch dashboard")
    }

    const data = await response.json()
    return DashboardSummaryResponseSchema.parse(data)
  },
}
