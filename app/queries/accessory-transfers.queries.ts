"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { accessoryTransfersService } from "@/app/services/accessory-transfers.service"
import type { CreateAccessoryTransferInput, AccessoryTransferListQueryInput } from "@/types/api/accessory-transfers"
import { accessoryStockKeys } from "@/app/queries/accessory-stock.queries"

export const accessoryTransferKeys = {
  all: ["accessory-transfers"] as const,
  lists: () => [...accessoryTransferKeys.all, "list"] as const,
} as const

export function useCreateAccessoryTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAccessoryTransferInput) => accessoryTransfersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessoryTransferKeys.lists() })
      toast.success("Transfer request submitted")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create transfer")
    },
  })
}

export function useReceiveAccessoryTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transferId: string) => accessoryTransfersService.receive(transferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessoryTransferKeys.all })
      queryClient.invalidateQueries({ queryKey: accessoryStockKeys.all })
      toast.success("Transfer received")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to receive transfer")
    },
  })
}

export function useAccessoryTransfers(filters: AccessoryTransferListQueryInput, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...accessoryTransferKeys.lists(), filters] as const,
    queryFn: () => accessoryTransfersService.list(filters),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}
