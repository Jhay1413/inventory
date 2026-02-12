import { z } from "zod"
import { PaginationSchema } from "@/types/api/products"
import { ProductWithRelationsSchema } from "@/types/api/products"

export const TransferStatus = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
} as const

export const TransferSchema = z.object({
  id: z.string(),
  productId: z.string(),
  fromBranchId: z.string(),
  toBranchId: z.string(),
  requestedById: z.string(),
  receivedById: z.string().nullable().optional(),
  reason: z.string(),
  notes: z.string().nullable().optional(),
  status: z.enum([
    TransferStatus.PENDING,
    TransferStatus.APPROVED,
    TransferStatus.REJECTED,
    TransferStatus.CANCELLED,
    TransferStatus.COMPLETED,
  ] as const),
  receivedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Transfer = z.infer<typeof TransferSchema>

export const CreateTransferSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  toBranchId: z.string().min(1, "Destination branch is required"),
  reason: z.string().trim().min(1, "Reason is required"),
  notes: z.string().trim().min(1).optional(),
})

export type CreateTransferInput = z.infer<typeof CreateTransferSchema>

export const TransferResponseSchema = z.object({
  transfer: TransferSchema,
})

export type TransferResponse = z.infer<typeof TransferResponseSchema>

export const TransferDirectionSchema = z.enum(["incoming", "outgoing", "all"] as const)

const TransferStatusEnum = z.enum([
  TransferStatus.PENDING,
  TransferStatus.APPROVED,
  TransferStatus.REJECTED,
  TransferStatus.CANCELLED,
  TransferStatus.COMPLETED,
] as const)

export const TransferListQuerySchema = z.object({
  direction: TransferDirectionSchema,
  status: TransferStatusEnum.optional(),
  statusNot: TransferStatusEnum.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
})

export type TransferListQueryInput = z.input<typeof TransferListQuerySchema>
export type TransferListQuery = z.output<typeof TransferListQuerySchema>

export const TransferWithRelationsSchema = TransferSchema.extend({
  product: ProductWithRelationsSchema,
  fromBranch: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  toBranch: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  requestedBy: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  receivedBy: z.object({ id: z.string(), name: z.string(), email: z.string() }).nullable().optional(),
})

export type TransferWithRelations = z.infer<typeof TransferWithRelationsSchema>

export const TransfersListResponseSchema = z.object({
  transfers: z.array(TransferWithRelationsSchema),
  pagination: PaginationSchema,
})

export type TransfersListResponse = z.infer<typeof TransfersListResponseSchema>
