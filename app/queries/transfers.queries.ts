"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { transfersService } from "@/app/services/transfers.service"
import type { CreateTransferInput } from "@/types/api/transfers"
import { useQuery } from "@tanstack/react-query"
import type { TransferListQueryInput } from "@/types/api/transfers"
import { productKeys } from "@/app/queries/products.queries"
import { productStatsKeys } from "@/app/queries/product-stats.queries"
import { inventoryKeys } from "@/app/queries/inventory.queries"

export const transferKeys = {
  all: ["transfers"] as const,
  lists: () => [...transferKeys.all, "list"] as const,
} as const

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTransferInput) => transfersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transferKeys.lists() })
      toast.success("Transfer request submitted")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create transfer")
    },
  })
}

export function useReceiveTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transferId: string) => transfersService.receive(transferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productStatsKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      toast.success("Transfer received")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to receive transfer")
    },
  })
}

export function useTransferProductsSearch(
  filters: { search?: string; limit?: number; offset?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...transferKeys.all, "products-search", filters] as const,
    queryFn: () => transfersService.searchProductsForTransfer(filters),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}

export function useTransfers(filters: TransferListQueryInput, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...transferKeys.all, "list", filters] as const,
    queryFn: () => transfersService.list(filters),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}
