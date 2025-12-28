"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { returnsService } from "@/app/services/returns.service"
import type { CreateReturnInput, ReturnListQueryInput, UpdateReturnInput } from "@/types/api/returns"
import { productKeys } from "@/app/queries/products.queries"
import { productStatsKeys } from "@/app/queries/product-stats.queries"
import { inventoryKeys } from "@/app/queries/inventory.queries"

export const returnKeys = {
  all: ["returns"] as const,
  lists: () => [...returnKeys.all, "list"] as const,
  list: (query: ReturnListQueryInput) => [...returnKeys.lists(), query] as const,
  details: () => [...returnKeys.all, "detail"] as const,
  detail: (id: string) => [...returnKeys.details(), id] as const,
} as const

export function useReturns(query: ReturnListQueryInput = {}) {
  return useQuery({
    queryKey: returnKeys.list(query),
    queryFn: () => returnsService.list(query),
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}

export function useReturn(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: returnKeys.detail(id),
    queryFn: () => returnsService.get(id),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}

export function useCreateReturn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateReturnInput) => returnsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: returnKeys.all })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productStatsKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      toast.success("Return created")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create return")
    },
  })
}

type UpdateReturnArgs = { id: string } & UpdateReturnInput

export function useUpdateReturn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateReturnArgs) => returnsService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: returnKeys.all })
      queryClient.invalidateQueries({ queryKey: returnKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productStatsKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      toast.success("Return updated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update return")
    },
  })
}
