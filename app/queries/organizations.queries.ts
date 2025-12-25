"use client"

import { useQuery } from "@tanstack/react-query"
import { organizationsService } from "@/app/services/organizations.service"

export const organizationKeys = {
  all: ["organizations"] as const,
  list: () => [...organizationKeys.all, "list"] as const,
} as const

export function useOrganizations(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: organizationKeys.list(),
    queryFn: () => organizationsService.list(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  })
}
