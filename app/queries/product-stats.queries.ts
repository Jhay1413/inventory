"use client"

import { useQuery } from "@tanstack/react-query"
import { productStatsService } from "@/app/services/product-stats.service"

export const productStatsKeys = {
  all: ["product-stats"] as const,
} as const

export function useProductStats() {
  return useQuery({
    queryKey: productStatsKeys.all,
    queryFn: () => productStatsService.get(),
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchOnMount: "always",
  })
}
