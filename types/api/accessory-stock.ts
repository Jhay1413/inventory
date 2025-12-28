import { z } from "zod"
import { OrganizationSchema } from "@/types/api/organizations"
import { AccessorySchema } from "@/types/api/accessories"
import { PaginationSchema } from "@/types/api/products"

export const AccessoryStockSchema = z.object({
  id: z.string(),
  accessoryId: z.string(),
  branchId: z.string(),
  quantity: z.number().int().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type AccessoryStock = z.infer<typeof AccessoryStockSchema>

export const AccessoryStockWithRelationsSchema = AccessoryStockSchema.extend({
  accessory: AccessorySchema,
  branch: OrganizationSchema,
})

export type AccessoryStockWithRelations = z.infer<typeof AccessoryStockWithRelationsSchema>

export const AccessoryStockListQuerySchema = z.object({
  accessoryId: z.string().min(1).optional(),
  branchId: z.string().min(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type AccessoryStockListQueryInput = z.input<typeof AccessoryStockListQuerySchema>
export type AccessoryStockListQuery = z.output<typeof AccessoryStockListQuerySchema>

export const AccessoryStockListResponseSchema = z.object({
  stocks: z.array(AccessoryStockWithRelationsSchema),
  pagination: PaginationSchema,
})

export type AccessoryStockListResponse = z.infer<typeof AccessoryStockListResponseSchema>

export const CreateAccessoryStockSchema = z.object({
  accessoryId: z.string().min(1, "Accessory is required"),
  quantity: z.number().int().positive().max(100000),
})

export type CreateAccessoryStockInput = z.infer<typeof CreateAccessoryStockSchema>

export const AccessoryStockResponseSchema = z.object({
  stock: AccessoryStockWithRelationsSchema,
})

export type AccessoryStockResponse = z.infer<typeof AccessoryStockResponseSchema>
