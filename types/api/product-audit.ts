import { z } from "zod"

export const ProductAuditActionSchema = z.enum([
  "ProductCreated",
  "TransferRequested",
  "TransferReceived",
  "Sold",
])

export type ProductAuditAction = z.infer<typeof ProductAuditActionSchema>

export const AuditActorUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
})

export const AuditActorOrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const AuditBranchSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const AuditTransferSchema = z.object({
  id: z.string(),
  status: z.string(),
  reason: z.string(),
  notes: z.string().nullable().optional(),
  fromBranch: AuditBranchSchema,
  toBranch: AuditBranchSchema,
})

export const AuditInvoiceSchema = z.object({
  id: z.string(),
  status: z.string(),
  paymentType: z.string(),
  salePrice: z.number(),
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
})

export const ProductAuditLogSchema = z.object({
  id: z.string(),
  productId: z.string(),
  action: ProductAuditActionSchema,
  actorUserId: z.string(),
  actorUser: AuditActorUserSchema,
  actorOrganizationId: z.string().nullable().optional(),
  actorOrganization: AuditActorOrganizationSchema.nullable().optional(),
  fromBranchId: z.string().nullable().optional(),
  toBranchId: z.string().nullable().optional(),
  transferId: z.string().nullable().optional(),
  transfer: AuditTransferSchema.nullable().optional(),
  invoiceId: z.string().nullable().optional(),
  invoice: AuditInvoiceSchema.nullable().optional(),
  details: z.unknown().nullable().optional(),
  createdAt: z.string().datetime(),
})

export type ProductAuditLog = z.infer<typeof ProductAuditLogSchema>

export const ProductAuditLogsResponseSchema = z.object({
  logs: z.array(ProductAuditLogSchema),
})

export type ProductAuditLogsResponse = z.infer<typeof ProductAuditLogsResponseSchema>
