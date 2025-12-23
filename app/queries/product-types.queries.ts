"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { productTypesService } from "@/app/services/product-types.service"
import type { CreateProductTypeInput } from "@/types/api/product-types"

export const productTypeKeys = {
  all: ["product-types"] as const,
  lists: () => [...productTypeKeys.all, "list"] as const,
  list: () => [...productTypeKeys.lists()] as const,
} as const

export function useProductTypes() {
  return useQuery({
    queryKey: productTypeKeys.list(),
    queryFn: () => productTypesService.getAll(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })
}

export function useCreateProductType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductTypeInput) => productTypesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productTypeKeys.lists() })
      toast.success("Product type created")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product type")
    },
  })
}
