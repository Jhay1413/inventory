import { z } from "zod"
import { PaginationSchema } from "@/types/api/products"
import { TransferStatus } from "@/types/api/transfers"
import { OrganizationSchema } from "@/types/api/organizations"
import { AccessorySchema } from "@/types/api/accessories"

export const AccessoryTransferSchema = z.object({
  id: z.string(),
  accessoryId: z.string(),
  fromBranchId: z.string(),
  toBranchId: z.string(),
  requestedById: z.string(),
  receivedById: z.string().nullable().optional(),
  quantity: z.number().int().positive(),
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

export type AccessoryTransfer = z.infer<typeof AccessoryTransferSchema>

export const CreateAccessoryTransferSchema = z.object({
  accessoryId: z.string().min(1, "Accessory is required"),
  toBranchId: z.string().min(1, "Destination branch is required"),
  quantity: z.number().int().positive().max(100000),
  reason: z.string().trim().min(1, "Reason is required"),
  notes: z.string().trim().min(1).optional(),
})

export type CreateAccessoryTransferInput = z.infer<typeof CreateAccessoryTransferSchema>

export const AccessoryTransferResponseSchema = z.object({
  transfer: AccessoryTransferSchema,
})

export type AccessoryTransferResponse = z.infer<typeof AccessoryTransferResponseSchema>

export const AccessoryTransferDirectionSchema = z.enum(["incoming", "outgoing", "all"] as const)

const AccessoryTransferStatusEnum = z.enum([
  TransferStatus.PENDING,
  TransferStatus.APPROVED,
  TransferStatus.REJECTED,
  TransferStatus.CANCELLED,
  TransferStatus.COMPLETED,
] as const)

export const AccessoryTransferListQuerySchema = z.object({
  direction: AccessoryTransferDirectionSchema,
  status: AccessoryTransferStatusEnum.optional(),
  statusNot: AccessoryTransferStatusEnum.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
})

export type AccessoryTransferListQueryInput = z.input<typeof AccessoryTransferListQuerySchema>
export type AccessoryTransferListQuery = z.output<typeof AccessoryTransferListQuerySchema>

export const AccessoryTransferWithRelationsSchema = AccessoryTransferSchema.extend({
  accessory: AccessorySchema,
  fromBranch: OrganizationSchema,
  toBranch: OrganizationSchema,
  requestedBy: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  receivedBy: z.object({ id: z.string(), name: z.string(), email: z.string() }).nullable().optional(),
})

export type AccessoryTransferWithRelations = z.infer<typeof AccessoryTransferWithRelationsSchema>

export const AccessoryTransfersListResponseSchema = z.object({
  transfers: z.array(AccessoryTransferWithRelationsSchema),
  pagination: PaginationSchema,
})

export type AccessoryTransfersListResponse = z.infer<typeof AccessoryTransfersListResponseSchema>
