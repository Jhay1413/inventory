"use client"

import { useQuery } from "@tanstack/react-query"
import { inventoryService } from "@/app/services/inventory.service"
import type { InventoryQueryInput } from "@/types/api/inventory"

export const inventoryKeys = {
  all: ["inventory"] as const,
  list: (query: InventoryQueryInput) => [...inventoryKeys.all, query] as const,
} as const

export function useInventory(query: InventoryQueryInput = {}) {
  return useQuery({
    queryKey: inventoryKeys.list(query),
    queryFn: () => inventoryService.get(query),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  })
}
