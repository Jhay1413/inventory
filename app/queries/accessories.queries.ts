"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { accessoriesService } from "@/app/services/accessories.service"
import type { AccessoryListQueryInput, CreateAccessoryInput } from "@/types/api/accessories"

export const accessoriesKeys = {
  all: ["accessories"] as const,
  lists: () => [...accessoriesKeys.all, "list"] as const,
} as const

export function useAccessories(filters: AccessoryListQueryInput = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...accessoriesKeys.lists(), filters] as const,
    queryFn: () => accessoriesService.list(filters),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  })
}

export function useCreateAccessory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAccessoryInput) => accessoriesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessoriesKeys.all })
      toast.success("Accessory saved")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create accessory")
    },
  })
}
