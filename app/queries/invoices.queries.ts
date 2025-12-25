"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { invoicesService } from "@/app/services/invoices.service"
import type {
  CreateInvoiceInput,
  InvoiceListQueryInput,
  InvoiceStatsQueryInput,
  UpdateInvoiceFormInput,
} from "@/types/api/invoices"
import { productKeys } from "@/app/queries/products.queries"
import { productStatsKeys } from "@/app/queries/product-stats.queries"
import { inventoryKeys } from "@/app/queries/inventory.queries"

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (filters: InvoiceListQueryInput) => [...invoiceKeys.lists(), filters] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  stats: () => [...invoiceKeys.all, "stats"] as const,
  statsFor: (filters?: InvoiceStatsQueryInput) => [...invoiceKeys.stats(), filters ?? {}] as const,
} as const

export function useInvoices(filters: InvoiceListQueryInput) {
  return useQuery({
    queryKey: invoiceKeys.list(filters),
    queryFn: () => invoicesService.list(filters),
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}

export function useInvoice(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesService.getById(id),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}

export function useInvoiceStats(filters?: InvoiceStatsQueryInput, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: invoiceKeys.statsFor(filters),
    queryFn: () => invoicesService.stats(filters),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateInvoiceInput) => invoicesService.create(payload),
    onSuccess: () => {
      // Creating an invoice marks product Sold; refresh all relevant views
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productStatsKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() })
      toast.success("Sale saved")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save sale")
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateInvoiceFormInput) =>
      invoicesService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.invoice.id) })
      queryClient.invalidateQueries({ queryKey: invoiceKeys.stats() })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productStatsKeys.all })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      toast.success("Sale updated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update sale")
    },
  })
}

export function useInvoiceProductsSearch(
  filters: { search?: string; limit?: number; offset?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...invoiceKeys.all, "products-search", filters] as const,
    queryFn: () => invoicesService.searchProductsForInvoice(filters),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}
