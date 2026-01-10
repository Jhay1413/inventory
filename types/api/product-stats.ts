import { z } from "zod"

export const ProductStatsSchema = z.object({
  total: z.number(),
  available: z.number(),
  sold: z.number(),
  brandNew: z.number(),
  currentBranchStock: z.number(),
  pendingTransfers: z.number(),
  pendingAccessoryTransfers: z.number(),
})

export type ProductStats = z.infer<typeof ProductStatsSchema>

export const ProductStatsResponseSchema = z.object({
  stats: ProductStatsSchema,
})

export type ProductStatsResponse = z.infer<typeof ProductStatsResponseSchema>
