import { z } from "zod"

export const AccessorySchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type Accessory = z.infer<typeof AccessorySchema>

export const AccessoryListQuerySchema = z.object({
  search: z.string().min(1).optional(),
})

export type AccessoryListQueryInput = z.input<typeof AccessoryListQuerySchema>

export const AccessoriesListResponseSchema = z.object({
  accessories: z.array(AccessorySchema),
})

export type AccessoriesListResponse = z.infer<typeof AccessoriesListResponseSchema>

export const CreateAccessorySchema = z.object({
  name: z.string().min(1, "Name is required"),
})

export type CreateAccessoryInput = z.infer<typeof CreateAccessorySchema>

export const AccessoryResponseSchema = z.object({
  accessory: AccessorySchema,
})

export type AccessoryResponse = z.infer<typeof AccessoryResponseSchema>
