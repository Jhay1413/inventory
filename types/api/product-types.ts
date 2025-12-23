import { z } from "zod"

export const ProductTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type ProductType = z.infer<typeof ProductTypeSchema>

export const CreateProductTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

export type CreateProductTypeInput = z.infer<typeof CreateProductTypeSchema>

export const ProductTypesListResponseSchema = z.object({
  productTypes: z.array(ProductTypeSchema),
})

export type ProductTypesListResponse = z.infer<typeof ProductTypesListResponseSchema>

export const ProductTypeResponseSchema = z.object({
  productType: ProductTypeSchema,
})

export type ProductTypeResponse = z.infer<typeof ProductTypeResponseSchema>
