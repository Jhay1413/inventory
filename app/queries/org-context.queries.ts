import { useQuery } from "@tanstack/react-query"
import { orgContextService } from "@/app/services/org-context.service"

export const orgContextQueryKeys = {
  active: ["auth", "org-context"] as const,
}

export function useOrgContext(enabled = true) {
  return useQuery({
    queryKey: orgContextQueryKeys.active,
    queryFn: () => orgContextService.get(),
    enabled,
    staleTime: 60_000,
  })
}
