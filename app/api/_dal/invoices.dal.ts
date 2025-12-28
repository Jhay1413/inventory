import { prisma } from "@/app/lib/db"
import { ProductAvailability as DbProductAvailability } from "@/app/generated/prisma/client"
import { createProductAuditLog } from "@/app/api/_dal/product-audit.dal"
import type { Prisma } from "@/app/generated/prisma/client"

const invoiceInclude = {
  product: {
    include: {
      productModel: {
        include: {
          productType: true,
        },
      },
    },
  },
  items: {
    include: {
      product: {
        include: {
          productModel: {
            include: {
              productType: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  accessoryItems: {
    include: {
      accessory: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  branch: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const

type FreebieAccessoryItemInput = { accessoryId: string; quantity: number }

function normalizeFreebieAccessoryItems(items?: FreebieAccessoryItemInput[]) {
  const map = new Map<string, number>()
  for (const item of items ?? []) {
    if (!item?.accessoryId) continue
    const qty = Math.trunc(Number(item.quantity))
    if (!Number.isFinite(qty) || qty <= 0) continue
    map.set(item.accessoryId, (map.get(item.accessoryId) ?? 0) + qty)
  }
  return Array.from(map.entries()).map(([accessoryId, quantity]) => ({ accessoryId, quantity }))
}

export async function createInvoiceTx(args: {
  productId: string
  freebieProductIds?: string[]
  freebieAccessoryItems?: FreebieAccessoryItemInput[]
  branchId: string
  createdById: string
  salePrice: number
  paymentType: "Cash" | "Credit" | "Installment"
  status: "Pending" | "PartiallyPaid" | "Paid" | "Cancelled"
  customerName?: string
  customerPhone?: string
  notes?: string
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const freebieIds = Array.from(new Set(args.freebieProductIds ?? []))
        .filter((id) => id !== args.productId)

      const freebieAccessoryItems = normalizeFreebieAccessoryItems(args.freebieAccessoryItems)

      const targetAvailability = args.status === "Cancelled" ? "Available" : "Sold"

      if (targetAvailability === "Sold") {
        if (freebieIds.length) {
          const freebies = await tx.product.findMany({
            where: { id: { in: freebieIds } },
            select: { id: true, branchId: true, availability: true },
          })

          if (freebies.length !== freebieIds.length) {
            return { ok: false as const, error: "One or more freebies not found" }
          }

          const invalid = freebies.find(
            (p) => p.branchId !== args.branchId || p.availability !== "Available"
          )
          if (invalid) {
            return {
              ok: false as const,
              error: "One or more freebies are not available in your branch",
            }
          }
        }

        if (freebieAccessoryItems.length) {
          const stocks = await tx.accessoryStock.findMany({
            where: {
              branchId: args.branchId,
              accessoryId: { in: freebieAccessoryItems.map((x) => x.accessoryId) },
            },
            select: { accessoryId: true, quantity: true },
          })

          if (stocks.length !== freebieAccessoryItems.length) {
            return { ok: false as const, error: "One or more accessory freebies not found" }
          }

          const insufficient = freebieAccessoryItems.find((item) => {
            const stock = stocks.find((s) => s.accessoryId === item.accessoryId)
            return !stock || stock.quantity < item.quantity
          })
          if (insufficient) {
            return { ok: false as const, error: "Insufficient accessory stock for freebies" }
          }
        }
      }

      const product = await tx.product.findUnique({
        where: { id: args.productId },
        select: { id: true, branchId: true, availability: true },
      })

      if (!product) {
        return { ok: false as const, error: "Product not found" }
      }

      if (product.branchId !== args.branchId) {
        return { ok: false as const, error: "Product does not belong to your branch" }
      }

      if (product.availability !== "Available") {
        return { ok: false as const, error: "Product is not available" }
      }

      const invoice = await tx.invoice.create({
        data: {
          product: { connect: { id: args.productId } },
          branch: { connect: { id: args.branchId } },
          createdBy: { connect: { id: args.createdById } },
          salePrice: args.salePrice,
          paymentType: args.paymentType,
          status: args.status,
          customerName: args.customerName,
          customerPhone: args.customerPhone,
          notes: args.notes,
          paidAt: args.status === "Paid" ? new Date() : null,
          cancelledAt: args.status === "Cancelled" ? new Date() : null,
          items: {
            create: [
              {
                productId: args.productId,
                unitPrice: args.salePrice,
                discountAmount: 0,
                netAmount: args.salePrice,
                isFreebie: false,
              },
              ...freebieIds.map((productId) => ({
                productId,
                unitPrice: 0,
                discountAmount: 0,
                netAmount: 0,
                isFreebie: true,
              })),
            ],
          },
          accessoryItems: {
            create: freebieAccessoryItems.map((item) => ({
              accessoryId: item.accessoryId,
              quantity: item.quantity,
              isFreebie: true,
            })),
          },
        },
        include: invoiceInclude,
      })

      await tx.product.updateMany({
        where: { id: { in: [args.productId, ...freebieIds] } },
        data: { availability: targetAvailability },
      })

      if (targetAvailability === "Sold" && freebieAccessoryItems.length) {
        for (const item of freebieAccessoryItems) {
          const updated = await tx.accessoryStock.updateMany({
            where: {
              branchId: args.branchId,
              accessoryId: item.accessoryId,
              quantity: { gte: item.quantity },
            },
            data: { quantity: { decrement: item.quantity } },
          })
          if (updated.count !== 1) {
            throw new Error("Insufficient accessory stock for freebies")
          }
        }
      }

      if (targetAvailability === "Sold") {
        const soldProductIds = [args.productId, ...freebieIds]
        await Promise.all(
          soldProductIds.map((productId) =>
            createProductAuditLog(tx, {
              productId,
              action: "Sold",
              actorUserId: args.createdById,
              actorOrganizationId: args.branchId,
              invoiceId: invoice.id,
              details: {
                status: invoice.status,
                paymentType: invoice.paymentType,
                salePrice: invoice.salePrice,
                isFreebie: productId !== args.productId,
              },
            })
          )
        )
      }

      return { ok: true as const, invoice }
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create invoice"
    return { ok: false as const, error: message }
  }
}

export async function getInvoiceById(args: { id: string; branchId?: string }) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: args.id, ...(args.branchId ? { branchId: args.branchId } : {}) },
    include: invoiceInclude,
  })

  if (!invoice) {
    return { ok: false as const, error: "Invoice not found" }
  }

  return { ok: true as const, invoice }
}

export async function listInvoices(args: {
  branchId?: string
  limit: number
  offset: number
  search?: string
  status?: "Pending" | "PartiallyPaid" | "Paid" | "Cancelled"
  paymentType?: "Cash" | "Credit" | "Installment"
  productTypeId?: string
  condition?: "BrandNew" | "SecondHand"
}) {
  const where: Prisma.InvoiceWhereInput = {}

  if (args.branchId) where.branchId = args.branchId
  if (args.status) where.status = args.status
  if (args.paymentType) where.paymentType = args.paymentType

  const productWhere: Prisma.ProductWhereInput = {}

  if (args.condition) {
    productWhere.condition = args.condition
  }

  if (args.productTypeId) {
    productWhere.productModel = { productTypeId: args.productTypeId }
  }

  if (Object.keys(productWhere).length > 0) {
    where.product = productWhere
  }

  if (args.search) {
    where.OR = [
      // Allow searching by invoice id
      { id: { contains: args.search } },
      // Optional: also match customer fields
      { customerName: { contains: args.search, mode: "insensitive" } },
      { customerPhone: { contains: args.search } },
      // Existing search behavior: product imei / model
      {
        product: {
          OR: [
            { imei: { contains: args.search } },
            {
              productModel: {
                name: { contains: args.search, mode: "insensitive" },
              },
            },
          ],
        },
      },
    ]
  }

  const [total, invoices] = await prisma.$transaction([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      include: invoiceInclude,
      orderBy: { createdAt: "desc" },
      take: args.limit,
      skip: args.offset,
    }),
  ])

  return {
    invoices,
    pagination: {
      total,
      limit: args.limit,
      offset: args.offset,
      hasMore: args.offset + invoices.length < total,
    },
  }
}

export async function getInvoiceStats(args: { branchId?: string }) {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 6)

  const baseWhere = {
    branchId: args.branchId,
    status: { not: "Cancelled" as const },
  }

  const [totalAgg, todayAgg, weekAgg] = await prisma.$transaction([
    prisma.invoice.aggregate({
      where: baseWhere,
      _sum: { salePrice: true },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      where: { ...baseWhere, createdAt: { gte: todayStart } },
      _sum: { salePrice: true },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      where: { ...baseWhere, createdAt: { gte: weekStart } },
      _sum: { salePrice: true },
      _count: { _all: true },
    }),
  ])

  return {
    totalSales: totalAgg._sum.salePrice ?? 0,
    todaySales: todayAgg._sum.salePrice ?? 0,
    weeklySales: weekAgg._sum.salePrice ?? 0,
    totalCount: totalAgg._count._all ?? 0,
    todayCount: todayAgg._count._all ?? 0,
    weeklyCount: weekAgg._count._all ?? 0,
  }
}

export async function updateInvoiceTx(args: {
  id: string
  branchId?: string
  data: {
    salePrice?: number
    paymentType?: "Cash" | "Credit" | "Installment"
    status?: "Pending" | "PartiallyPaid" | "Paid" | "Cancelled"
    customerName?: string
    customerPhone?: string
    notes?: string
  }
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.invoice.findFirst({
        where: { id: args.id, ...(args.branchId ? { branchId: args.branchId } : {}) },
        include: {
          product: { select: { id: true, availability: true, branchId: true } },
          items: { select: { productId: true } },
          accessoryItems: { select: { accessoryId: true, quantity: true } },
          branch: { select: { id: true } },
        },
      })

      if (!existing) {
        return { ok: false as const, error: "Invoice not found" }
      }

      if (args.branchId && existing.product.branchId !== args.branchId) {
        return { ok: false as const, error: "Invoice does not belong to your branch" }
      }

      const nextStatus = args.data.status ?? existing.status

      const nextPaidAt = nextStatus === "Paid" ? existing.paidAt ?? new Date() : null

      const nextCancelledAt =
        nextStatus === "Cancelled" ? existing.cancelledAt ?? new Date() : null

      const invoice = await tx.invoice.update({
        where: { id: args.id },
        data: {
          salePrice: args.data.salePrice,
          paymentType: args.data.paymentType,
          status: nextStatus,
          customerName: args.data.customerName,
          customerPhone: args.data.customerPhone,
          notes: args.data.notes,
          paidAt: nextPaidAt,
          cancelledAt: nextCancelledAt,
        },
        include: invoiceInclude,
      })

      const productIds = Array.from(
        new Set([existing.product.id, ...existing.items.map((i) => i.productId)])
      )

      // Keep product availability consistent with invoice status (applies to main + freebies)
      await tx.product.updateMany({
        // Do not override products that have moved into a return/exchange lifecycle.
        where: {
          id: { in: productIds },
          availability: { in: [DbProductAvailability.Available, DbProductAvailability.Sold] },
        },
        data: {
          availability:
            nextStatus === "Cancelled" ? DbProductAvailability.Available : DbProductAvailability.Sold,
        },
      })

      const branchIdForStock = existing.branch.id
      const accessoryItems = existing.accessoryItems

      // If cancelling, restore accessory stock. If re-activating from cancelled, re-decrement.
      if (existing.status !== "Cancelled" && nextStatus === "Cancelled" && accessoryItems.length) {
        for (const item of accessoryItems) {
          await tx.accessoryStock.upsert({
            where: {
              accessoryId_branchId: { accessoryId: item.accessoryId, branchId: branchIdForStock },
            },
            create: {
              accessoryId: item.accessoryId,
              branchId: branchIdForStock,
              quantity: item.quantity,
            },
            update: { quantity: { increment: item.quantity } },
          })
        }
      }

      if (existing.status === "Cancelled" && nextStatus !== "Cancelled" && accessoryItems.length) {
        for (const item of accessoryItems) {
          const updated = await tx.accessoryStock.updateMany({
            where: {
              branchId: branchIdForStock,
              accessoryId: item.accessoryId,
              quantity: { gte: item.quantity },
            },
            data: { quantity: { decrement: item.quantity } },
          })
          if (updated.count !== 1) {
            throw new Error("Insufficient accessory stock for freebies")
          }
        }
      }

      return { ok: true as const, invoice }
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update invoice"
    return { ok: false as const, error: message }
  }
}
