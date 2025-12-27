"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { productsService } from "@/app/services/products.service"
import type { CreateProductInput, ProductListQueryInput, UpdateProductInput } from "@/types/api/products"
import { productStatsKeys } from "@/app/queries/product-stats.queries"
import { inventoryKeys } from "@/app/queries/inventory.queries"

export const productKeys = {
  all: ["products"] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (productId: string) => [...productKeys.details(), productId] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductListQueryInput) => [...productKeys.lists(), filters] as const,
  audits: () => [...productKeys.all, "audit"] as const,
  audit: (productId: string) => [...productKeys.audits(), productId] as const,
} as const

export function useProduct(productId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => productsService.get(productId),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 10,
    gcTime: 1000 * 60 * 5,
  })
}

export function useProducts(filters: ProductListQueryInput = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsService.list(filters),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductInput) => productsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productStatsKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      toast.success("Product created")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product")
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductInput }) =>
      productsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productStatsKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      toast.success("Product updated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product")
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productStatsKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      toast.success("Product deleted")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product")
    },
  })
}

export function useProductAuditLogs(productId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: productKeys.audit(productId),
    queryFn: () => productsService.auditLogs(productId),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 10,
    gcTime: 1000 * 60 * 5,
  })
}
