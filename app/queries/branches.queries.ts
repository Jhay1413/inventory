"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { branchesService } from "@/app/services/branches.service"
import type { BranchFormValues } from "@/types/branch"

export const branchKeys = {
  all: ["branches"] as const,
  list: () => [...branchKeys.all, "list"] as const,
} as const

export function useBranches(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: branchKeys.list(),
    queryFn: () => branchesService.list(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  })
}

export function useCreateBranch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: BranchFormValues) => branchesService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: branchKeys.list() })
    },
  })
}
