"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { productModelsService } from "@/app/services/product-models.service"
import type {
  CreateProductModelInput,
  ProductModelListQueryInput,
  UpdateProductModelInput,
} from "@/types/api/product-models"

export const productModelKeys = {
  all: ["product-models"] as const,
  lists: () => [...productModelKeys.all, "list"] as const,
  list: (filters: ProductModelListQueryInput) => [...productModelKeys.lists(), filters] as const,
  details: () => [...productModelKeys.all, "detail"] as const,
  detail: (id: string) => [...productModelKeys.details(), id] as const,
} as const

export function useProductModels(filters: ProductModelListQueryInput = {}) {
  return useQuery({
    queryKey: productModelKeys.list(filters),
    queryFn: () => productModelsService.list(filters),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })
}

export function useProductModelsByProductType(productTypeId: string, search?: string) {
  const trimmedSearch = search?.trim() || undefined

  return useQuery({
    queryKey: productModelKeys.list({ productTypeId, search: trimmedSearch, limit: 100, offset: 0 }),
    queryFn: () => productModelsService.listAllByProductType(productTypeId, trimmedSearch),
    enabled: !!productTypeId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  })
}

export function useProductModel(id: string, enabled = true) {
  return useQuery({
    queryKey: productModelKeys.detail(id),
    queryFn: () => productModelsService.getById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

export function useCreateProductModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductModelInput) => productModelsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productModelKeys.lists() })
      toast.success("Product model created")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product model")
    },
  })
}

export function useUpdateProductModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductModelInput }) =>
      productModelsService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: productModelKeys.lists() })
      queryClient.setQueryData(productModelKeys.detail(variables.id), data)
      toast.success("Product model updated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product model")
    },
  })
}

export function useDeleteProductModel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productModelsService.delete(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: productModelKeys.lists() })
      queryClient.removeQueries({ queryKey: productModelKeys.detail(id) })
      toast.success("Product model deleted")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product model")
    },
  })
}
