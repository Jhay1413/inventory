import { z } from 'zod';

export const ClientSchema = z.object({
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

export type Client = z.infer<typeof ClientSchema>;

export const CreateClientRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type CreateClientRequest = z.infer<typeof CreateClientRequestSchema>;

export const UpdateClientRequestSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type UpdateClientRequest = z.infer<typeof UpdateClientRequestSchema>;

export const ClientListResponseSchema = z.object({
  clients: z.array(
    ClientSchema.extend({
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

export type ClientListResponse = z.infer<typeof ClientListResponseSchema>;

export const ClientResponseSchema = z.object({
  client: ClientSchema.extend({
    creator: z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
    }),
  }),
});

export type ClientResponse = z.infer<typeof ClientResponseSchema>;

export const ClientFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type ClientFilters = z.infer<typeof ClientFiltersSchema>;
