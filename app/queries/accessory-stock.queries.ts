"use client"

import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { accessoryStockService } from "@/app/services/accessory-stock.service"
import type { AccessoryStockListQueryInput, CreateAccessoryStockInput } from "@/types/api/accessory-stock"
import { authClient } from "@/app/lib/auth-client"

export const accessoryStockKeys = {
  all: ["accessory-stock"] as const,
  lists: () => [...accessoryStockKeys.all, "list"] as const,
} as const

export function useAccessoryStockList(filters: AccessoryStockListQueryInput = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...accessoryStockKeys.lists(), filters] as const,
    queryFn: () => accessoryStockService.list(filters),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}

export function useAccessoryStockForActiveBranch(
  filters: Omit<AccessoryStockListQueryInput, "branchId"> = {},
  options?: { enabled?: boolean }
) {
  const { data: activeOrganization } = authClient.useActiveOrganization()

  const activeOrganizationId = React.useMemo(() => {
    if (!activeOrganization || typeof activeOrganization !== "object") return undefined
    if (!("id" in activeOrganization)) return undefined
    const id = (activeOrganization as { id?: unknown }).id
    return typeof id === "string" ? id : undefined
  }, [activeOrganization])

  return useQuery({
    queryKey: [...accessoryStockKeys.lists(), { ...filters, branchId: activeOrganizationId }],
    queryFn: () => accessoryStockService.list({ ...filters, branchId: activeOrganizationId }),
    enabled: (options?.enabled ?? true) && !!activeOrganizationId,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}

export function useAddAccessoryStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAccessoryStockInput) => accessoryStockService.add(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessoryStockKeys.all })
      toast.success("Accessory stock added")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add accessory stock")
    },
  })
}
