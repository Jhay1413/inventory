import { z } from "zod"

import { ProductAvailability, ProductCondition } from "@/types/api/products"

export const InventoryItemSchema = z.object({
  productModelId: z.string(),
  productModelName: z.string(),
  productTypeId: z.string(),
  productTypeName: z.string(),
  total: z.number().int().min(0),
  available: z.number().int().min(0),
  sold: z.number().int().min(0),
  brandNew: z.number().int().min(0),
  secondHand: z.number().int().min(0),
})

export type InventoryItem = z.infer<typeof InventoryItemSchema>

export const InventoryResponseSchema = z.object({
  items: z.array(InventoryItemSchema),
  totals: z.object({
    total: z.number().int().min(0),
    available: z.number().int().min(0),
    sold: z.number().int().min(0),
    brandNew: z.number().int().min(0),
    secondHand: z.number().int().min(0),
  }),
})

export type InventoryResponse = z.infer<typeof InventoryResponseSchema>

export const InventoryQuerySchema = z.object({
  productTypeId: z.string().min(1).optional(),
  availability: z.enum([ProductAvailability.AVAILABLE, ProductAvailability.SOLD] as const).optional(),
  condition: z.enum([ProductCondition.BRAND_NEW, ProductCondition.SECOND_HAND] as const).optional(),
  search: z.string().trim().min(1).optional(),
})

export type InventoryQueryInput = z.input<typeof InventoryQuerySchema>
export type InventoryQuery = z.output<typeof InventoryQuerySchema>
