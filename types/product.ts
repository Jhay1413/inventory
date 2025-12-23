import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdById: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;

export const CreateProductRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;

export const UpdateProductRequestSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;

export const ProductListResponseSchema = z.object({
  products: z.array(
    ProductSchema.extend({
      creator: z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
      }),
    })
  ),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
});

export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

export const ProductResponseSchema = z.object({
  product: ProductSchema.extend({
    creator: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
    }),
  }),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;

export const ProductFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
