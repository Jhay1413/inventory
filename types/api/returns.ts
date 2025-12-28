import { z } from "zod"

import { PaginationSchema, ProductWithRelationsSchema } from "@/types/api/products"
import { AccessorySchema } from "@/types/api/accessories"

export const ReturnStatus = {
  OPEN: "Open",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
} as const

export const ReturnResolution = {
  EXCHANGE: "Exchange",
  REPAIR: "Repair",
} as const

export const ReturnProductItemSchema = z.object({
  id: z.string(),
  returnId: z.string(),
  productId: z.string(),
  defectNotes: z.string().nullable().optional(),
  resolution: z.enum([ReturnResolution.EXCHANGE, ReturnResolution.REPAIR] as const),
  replacementProductId: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  product: ProductWithRelationsSchema,
  replacementProduct: ProductWithRelationsSchema.nullable().optional(),
})

export const ReturnAccessoryItemSchema = z.object({
  id: z.string(),
  returnId: z.string(),
  accessoryId: z.string(),
  quantity: z.number().int().positive(),
  defectNotes: z.string().nullable().optional(),
  resolution: z.enum([ReturnResolution.EXCHANGE, ReturnResolution.REPAIR] as const),
  createdAt: z.string().datetime(),
  accessory: AccessorySchema,
})

export const ReturnSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  branchId: z.string(),
  createdById: z.string(),
  status: z.enum([
    ReturnStatus.OPEN,
    ReturnStatus.PROCESSING,
    ReturnStatus.COMPLETED,
    ReturnStatus.REJECTED,
  ] as const),
  reason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const ReturnWithRelationsSchema = ReturnSchema.extend({
  branch: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  createdBy: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  productItems: z.array(ReturnProductItemSchema).default([]),
  accessoryItems: z.array(ReturnAccessoryItemSchema).default([]),
})

export type ReturnWithRelations = z.infer<typeof ReturnWithRelationsSchema>

export const CreateReturnSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  reason: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).optional(),
  productItems: z
    .array(
      z.object({
        productId: z.string().min(1),
        defectNotes: z.string().trim().min(1).optional(),
        resolution: z.enum([ReturnResolution.EXCHANGE, ReturnResolution.REPAIR] as const),
        replacementProductId: z.string().min(1).optional(),
      })
    )
    .min(1, "Select at least one product to return")
    .default([]),
  accessoryItems: z
    .array(
      z.object({
        accessoryId: z.string().min(1),
        quantity: z.coerce.number().int().positive().max(100000),
        defectNotes: z.string().trim().min(1).optional(),
        resolution: z.enum([ReturnResolution.EXCHANGE, ReturnResolution.REPAIR] as const),
      })
    )
    .optional(),
})

export type CreateReturnInput = z.infer<typeof CreateReturnSchema>

export const ReturnListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(15),
  offset: z.coerce.number().int().min(0).default(0),
  status: z
    .enum([
      ReturnStatus.OPEN,
      ReturnStatus.PROCESSING,
      ReturnStatus.COMPLETED,
      ReturnStatus.REJECTED,
    ] as const)
    .optional(),
})

export type ReturnListQueryInput = z.input<typeof ReturnListQuerySchema>

export const ReturnsListResponseSchema = z.object({
  returns: z.array(ReturnWithRelationsSchema),
  pagination: PaginationSchema,
})

export type ReturnsListResponse = z.infer<typeof ReturnsListResponseSchema>

export const ReturnResponseSchema = z.object({
  return: ReturnWithRelationsSchema,
})

export type ReturnResponse = z.infer<typeof ReturnResponseSchema>

export const UpdateReturnSchema = z
  .object({
    status: z
      .enum([
        ReturnStatus.OPEN,
        ReturnStatus.PROCESSING,
        ReturnStatus.COMPLETED,
        ReturnStatus.REJECTED,
      ] as const)
      .optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" })

export type UpdateReturnInput = z.infer<typeof UpdateReturnSchema>
