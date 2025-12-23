import { z } from "zod"
import { ProductTypeSchema } from "@/types/api/product-types"

export const ProductCondition = {
  BRAND_NEW: "BrandNew",
  SECOND_HAND: "SecondHand",
} as const

export const ProductAvailability = {
  AVAILABLE: "Available",
  SOLD: "Sold",
} as const

export const ProductSchema = z.object({
  id: z.string(),
  productModelId: z.string(),
  color: z.string(),
  ram: z.number().int(),
  imei: z.string().regex(/^\d{15}$/),
  condition: z.enum([ProductCondition.BRAND_NEW, ProductCondition.SECOND_HAND] as const),
  availability: z.enum([ProductAvailability.AVAILABLE, ProductAvailability.SOLD] as const),
  status: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Product = z.infer<typeof ProductSchema>

export const ProductModelWithTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  productTypeId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  productType: ProductTypeSchema,
})

export const ProductWithRelationsSchema = ProductSchema.extend({
  productModel: ProductModelWithTypeSchema,
})

export type ProductWithRelations = z.infer<typeof ProductWithRelationsSchema>

export const ProductListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  search: z
    .string()
    .trim()
    .min(1)
    .optional(),
  status: z.string().trim().min(1).optional(),
  productTypeId: z.string().min(1).optional(),
  productModelId: z.string().min(1).optional(),
  condition: z.enum([ProductCondition.BRAND_NEW, ProductCondition.SECOND_HAND] as const).optional(),
  availability: z.enum([ProductAvailability.AVAILABLE, ProductAvailability.SOLD] as const).optional(),
})

export type ProductListQueryInput = z.input<typeof ProductListQuerySchema>
export type ProductListQuery = z.output<typeof ProductListQuerySchema>

export const PaginationSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
})

export const ProductsListResponseSchema = z.object({
  products: z.array(ProductWithRelationsSchema),
  pagination: PaginationSchema,
})

export type ProductsListResponse = z.infer<typeof ProductsListResponseSchema>

export const ProductResponseSchema = z.object({
  product: ProductWithRelationsSchema,
})

export type ProductResponse = z.infer<typeof ProductResponseSchema>

export const CreateProductSchema = z.object({
  productModelId: z.string().min(1, "Product model is required"),
  color: z.string().min(1, "Color is required"),
  ram: z.number().int().min(1, "RAM must be a number"),
  imei: z.string().regex(/^\d{15}$/, { message: "IMEI must be exactly 15 digits" }),
  condition: z.enum([ProductCondition.BRAND_NEW, ProductCondition.SECOND_HAND] as const),
  availability: z.enum([ProductAvailability.AVAILABLE, ProductAvailability.SOLD] as const),
  status: z.string().min(1, "Status is required"),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>

export const UpdateProductSchema = z
  .object({
    productModelId: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
    ram: z.number().int().min(1).optional(),
    imei: z.string().regex(/^\d{15}$/).optional(),
    condition: z.enum([ProductCondition.BRAND_NEW, ProductCondition.SECOND_HAND] as const).optional(),
    availability: z
      .enum([ProductAvailability.AVAILABLE, ProductAvailability.SOLD] as const)
      .optional(),
    status: z.string().min(1).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" })

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
