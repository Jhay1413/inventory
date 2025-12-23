import { z } from "zod"

export const ProductModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  productTypeId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type ProductModel = z.infer<typeof ProductModelSchema>

export const ProductModelListQuerySchema = z.object({
  productTypeId: z.string().min(1).optional(),
  search: z.string().min(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export type ProductModelListQueryInput = z.input<typeof ProductModelListQuerySchema>
export type ProductModelListQuery = z.output<typeof ProductModelListQuerySchema>

export const PaginationSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
})

export const ProductModelsListResponseSchema = z.object({
  productModels: z.array(ProductModelSchema),
  pagination: PaginationSchema,
})

export type ProductModelsListResponse = z.infer<typeof ProductModelsListResponseSchema>

export const ProductModelResponseSchema = z.object({
  productModel: ProductModelSchema,
})

export type ProductModelResponse = z.infer<typeof ProductModelResponseSchema>

export const CreateProductModelSchema = z.object({
  name: z.string().min(1, "Model name is required"),
  productTypeId: z.string().min(1, "Product type is required"),
})

export type CreateProductModelInput = z.infer<typeof CreateProductModelSchema>

export const UpdateProductModelSchema = z
  .object({
    name: z.string().min(1).optional(),
    productTypeId: z.string().min(1).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" })

export type UpdateProductModelInput = z.infer<typeof UpdateProductModelSchema>
