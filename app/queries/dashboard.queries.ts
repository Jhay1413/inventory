import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/app/services/dashboard.service"

export const dashboardQueryKeys = {
  adminSummary: ["dashboard", "admin", "summary"] as const,
  branchSummary: ["dashboard", "branch", "summary"] as const,
}

export function useAdminDashboardSummary(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.adminSummary,
    queryFn: () => dashboardService.adminSummary(),
    enabled,
  })
}

export function useBranchDashboardSummary(enabled = true) {
  return useQuery({
    queryKey: dashboardQueryKeys.branchSummary,
    queryFn: () => dashboardService.branchSummary(),
    enabled,
  })
}
