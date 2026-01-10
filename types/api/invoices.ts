import { z } from "zod"
import { PaginationSchema, ProductCondition, ProductWithRelationsSchema } from "@/types/api/products"
import { AccessorySchema } from "@/types/api/accessories"

export const InvoicePaymentType = {
  CASH: "Cash",
  CREDIT: "Credit",
  INSTALLMENT: "Installment",
  BANK: "Bank",
} as const

export const InvoiceStatus = {
  PENDING: "Pending",
  PARTIALLY_PAID: "PartiallyPaid",
  PAID: "Paid",
  CANCELLED: "Cancelled",
} as const

export const InvoiceSchema = z.object({
  id: z.string(),
  productId: z.string(),
  branchId: z.string(),
  createdById: z.string(),
  salePrice: z.number().int(),
  paymentType: z.enum([
    InvoicePaymentType.CASH,
    InvoicePaymentType.CREDIT,
    InvoicePaymentType.INSTALLMENT,
    InvoicePaymentType.BANK,
  ] as const),
  status: z.enum([
    InvoiceStatus.PENDING,
    InvoiceStatus.PARTIALLY_PAID,
    InvoiceStatus.PAID,
    InvoiceStatus.CANCELLED,
  ] as const),
  customerName: z.string().nullable().optional(),
  customerPhone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  paidAt: z.string().datetime().nullable().optional(),
  cancelledAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Invoice = z.infer<typeof InvoiceSchema>

export const InvoiceWithRelationsSchema = InvoiceSchema.extend({
  product: ProductWithRelationsSchema,
  branch: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  createdBy: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  items: z
    .array(
      z.object({
        id: z.string(),
        invoiceId: z.string(),
        productId: z.string(),
        unitPrice: z.number().int(),
        discountAmount: z.number().int(),
        netAmount: z.number().int(),
        isFreebie: z.boolean(),
        createdAt: z.string().datetime(),
        product: ProductWithRelationsSchema,
      })
    )
    .default([]),
  accessoryItems: z
    .array(
      z.object({
        id: z.string(),
        invoiceId: z.string(),
        accessoryId: z.string(),
        quantity: z.number().int(),
        isFreebie: z.boolean(),
        createdAt: z.string().datetime(),
        accessory: AccessorySchema,
      })
    )
    .default([]),
})

export type InvoiceWithRelations = z.infer<typeof InvoiceWithRelationsSchema>

export const CreateInvoiceSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  freebieProductIds: z.array(z.string().min(1)).optional(),
  freebieAccessoryItems: z
    .array(
      z.object({
        accessoryId: z.string().min(1, "Accessory is required"),
        quantity: z.coerce.number().int().positive().max(100000),
      })
    )
    .optional(),
  salePrice: z.coerce.number().int().positive("Sales price is required"),
  paymentType: z.enum([
    InvoicePaymentType.CASH,
    InvoicePaymentType.CREDIT,
    InvoicePaymentType.INSTALLMENT,
    InvoicePaymentType.BANK,
  ] as const),
  status: z
    .enum([
      InvoiceStatus.PENDING,
      InvoiceStatus.PARTIALLY_PAID,
      InvoiceStatus.PAID,
      InvoiceStatus.CANCELLED,
    ] as const)
    .optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>

const UpdateInvoiceDataSchema = CreateInvoiceSchema.omit({ productId: true })
  .partial()
  .extend({
    status: z
      .enum([
        InvoiceStatus.PENDING,
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.PAID,
        InvoiceStatus.CANCELLED,
      ] as const)
      .optional(),
  })

// Update (API)
export const UpdateInvoiceSchema = UpdateInvoiceDataSchema.refine(
  (v) => Object.keys(v).length > 0,
  { message: "No fields to update" }
)

export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>

// Update (UI-only: includes id for reusable form submit handlers)
export const UpdateInvoiceFormSchema = UpdateInvoiceDataSchema.extend({
  id: z.string().min(1, "Invoice id is required"),
}).refine((v) => Object.keys(v).some((k) => k !== "id"), {
  message: "No fields to update",
})

export type UpdateInvoiceFormInput = z.infer<typeof UpdateInvoiceFormSchema>

export const InvoiceResponseSchema = z.object({
  invoice: InvoiceWithRelationsSchema,
})

export type InvoiceResponse = z.infer<typeof InvoiceResponseSchema>

export const InvoiceListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  branchId: z.string().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  status: z
    .enum([
      InvoiceStatus.PENDING,
      InvoiceStatus.PARTIALLY_PAID,
      InvoiceStatus.PAID,
      InvoiceStatus.CANCELLED,
    ] as const)
    .optional(),
  paymentType: z
    .enum([
      InvoicePaymentType.CASH,
      InvoicePaymentType.CREDIT,
      InvoicePaymentType.INSTALLMENT,
      InvoicePaymentType.BANK,
    ] as const)
    .optional(),
  productTypeId: z.string().min(1).optional(),
  condition: z.enum([ProductCondition.BRAND_NEW, ProductCondition.SECOND_HAND] as const).optional(),
})

export type InvoiceListQueryInput = z.input<typeof InvoiceListQuerySchema>
export type InvoiceListQuery = z.output<typeof InvoiceListQuerySchema>

export const InvoicesListResponseSchema = z.object({
  invoices: z.array(InvoiceWithRelationsSchema),
  pagination: PaginationSchema,
})

export type InvoicesListResponse = z.infer<typeof InvoicesListResponseSchema>

export const InvoiceStatsQuerySchema = z.object({
  branchId: z.string().min(1).optional(),
})

export type InvoiceStatsQueryInput = z.input<typeof InvoiceStatsQuerySchema>
export type InvoiceStatsQuery = z.output<typeof InvoiceStatsQuerySchema>

export const InvoiceStatsResponseSchema = z.object({
  totalSales: z.number().int(),
  todaySales: z.number().int(),
  weeklySales: z.number().int(),
  totalCount: z.number().int(),
  todayCount: z.number().int(),
  weeklyCount: z.number().int(),
  pendingSales: z.number().int(),
  pendingCount: z.number().int(),
})

export type InvoiceStatsResponse = z.infer<typeof InvoiceStatsResponseSchema>
