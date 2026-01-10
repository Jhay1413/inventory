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
  paymentType: "Cash" | "Credit" | "Installment" | "Bank"
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
  paymentType?: "Cash" | "Credit" | "Installment" | "Bank"
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

  // Exclude pending invoices from sales stats
  const salesWhere = {
    ...baseWhere,
    status: { notIn: ["Cancelled" as const, "Pending" as const] },
  }

  const [totalAgg, todayAgg, weekAgg] = await prisma.$transaction([
    prisma.invoice.aggregate({
      where: salesWhere,
      _sum: { salePrice: true },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      where: { ...salesWhere, createdAt: { gte: todayStart } },
      _sum: { salePrice: true },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      where: { ...salesWhere, createdAt: { gte: weekStart } },
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

export async function getPendingInvoiceStats(args: { branchId?: string }) {
  const pendingWhere = {
    branchId: args.branchId,
    status: "Pending" as const,
  }

  const pendingAgg = await prisma.invoice.aggregate({
    where: pendingWhere,
    _sum: { salePrice: true },
    _count: { _all: true },
  })

  return {
    pendingSales: pendingAgg._sum.salePrice ?? 0,
    pendingCount: pendingAgg._count._all ?? 0,
  }
}

export async function updateInvoiceTx(args: {
  id: string
  branchId?: string
  data: {
    freebieProductIds?: string[]
    freebieAccessoryItems?: FreebieAccessoryItemInput[]
    salePrice?: number
    paymentType?: "Cash" | "Credit" | "Installment" | "Bank"
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
        select: {
          id: true,
          productId: true,
          branchId: true,
          createdById: true,
          status: true,
          paidAt: true,
          cancelledAt: true,
          product: { select: { id: true, availability: true, branchId: true } },
          items: { select: { id: true, productId: true, isFreebie: true } },
          accessoryItems: { select: { id: true, accessoryId: true, quantity: true, isFreebie: true } },
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
      const branchIdForStock = existing.branch.id

      // === HANDLE FREEBIE UPDATES ===
      const updateFreebies = args.data.freebieProductIds !== undefined || args.data.freebieAccessoryItems !== undefined

      if (updateFreebies) {
        // Get old freebies
        const oldFreebieProducts = existing.items.filter(item => item.isFreebie)
        const oldFreebieProductIds = oldFreebieProducts.map(item => item.productId)
        const oldFreebieAccessories = existing.accessoryItems.filter(item => item.isFreebie)

        // Get new freebies
        const newFreebieProductIds = Array.from(new Set(args.data.freebieProductIds ?? []))
          .filter(id => id !== existing.product.id)
        const newFreebieAccessoryItems = normalizeFreebieAccessoryItems(args.data.freebieAccessoryItems)

        // STEP 1: Restore status of removed freebie products
        if (oldFreebieProductIds.length > 0) {
          await tx.product.updateMany({
            where: { 
              id: { in: oldFreebieProductIds },
              availability: DbProductAvailability.Sold
            },
            data: { availability: DbProductAvailability.Available }
          })
        }

        // STEP 2: Restore stock for removed accessory freebies
        for (const item of oldFreebieAccessories) {
          await tx.accessoryStock.update({
            where: {
              accessoryId_branchId: { accessoryId: item.accessoryId, branchId: branchIdForStock },
            },
            data: { quantity: { increment: item.quantity } }
          })
        }

        // STEP 3: Delete all old freebie records
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: args.id, isFreebie: true }
        })
        
        await tx.invoiceAccessoryItem.deleteMany({
          where: { invoiceId: args.id, isFreebie: true }
        })

        // STEP 4: Validate and insert new freebie products
        if (newFreebieProductIds.length > 0) {
          const freebies = await tx.product.findMany({
            where: { id: { in: newFreebieProductIds } },
            select: { id: true, branchId: true, availability: true },
          })

          if (freebies.length !== newFreebieProductIds.length) {
            throw new Error("One or more freebie products not found")
          }

          for (const p of freebies) {
            if (p.branchId !== branchIdForStock) {
              throw new Error("Freebie product does not belong to the same branch")
            }
            if (p.availability !== DbProductAvailability.Available) {
              throw new Error("Freebie product is not available")
            }
          }

          // Insert new freebie product items
          await tx.invoiceItem.createMany({
            data: newFreebieProductIds.map(productId => ({
              invoiceId: args.id,
              productId,
              unitPrice: 0,
              discountAmount: 0,
              netAmount: 0,
              isFreebie: true,
            }))
          })

          // Mark new freebie products as Sold
          await tx.product.updateMany({
            where: { id: { in: newFreebieProductIds } },
            data: { availability: DbProductAvailability.Sold }
          })

          // Create audit logs
          for (const productId of newFreebieProductIds) {
            await createProductAuditLog(tx, {
              productId,
              action: "Sold",
              actorUserId: existing.createdById,
              invoiceId: args.id,
              details: { isFreebie: true },
            })
          }
        }

        // STEP 5: Validate and insert new accessory freebies
        if (newFreebieAccessoryItems.length > 0) {
          for (const item of newFreebieAccessoryItems) {
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

          // Insert new accessory freebie items
          await tx.invoiceAccessoryItem.createMany({
            data: newFreebieAccessoryItems.map(item => ({
              invoiceId: args.id,
              accessoryId: item.accessoryId,
              quantity: item.quantity,
              isFreebie: true,
            }))
          })
        }
      }

      // === UPDATE INVOICE BASIC FIELDS ===
      const nextPaidAt = nextStatus === "Paid" ? existing.paidAt ?? new Date() : null
      const nextCancelledAt = nextStatus === "Cancelled" ? existing.cancelledAt ?? new Date() : null

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

      // === HANDLE STATUS CHANGES (main product + current freebies) ===
      const currentProductIds = Array.from(
        new Set([existing.product.id, ...invoice.items.map((i) => i.productId)])
      )

      await tx.product.updateMany({
        where: {
          id: { in: currentProductIds },
          availability: { in: [DbProductAvailability.Available, DbProductAvailability.Sold] },
        },
        data: {
          availability:
            nextStatus === "Cancelled" ? DbProductAvailability.Available : DbProductAvailability.Sold,
        },
      })

      const currentAccessoryItems = invoice.accessoryItems

      // If cancelling, restore accessory stock
      if (existing.status !== "Cancelled" && nextStatus === "Cancelled" && currentAccessoryItems.length) {
        for (const item of currentAccessoryItems) {
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

      // If re-activating from cancelled, re-decrement stock
      if (existing.status === "Cancelled" && nextStatus !== "Cancelled" && currentAccessoryItems.length) {
        for (const item of currentAccessoryItems) {
          const updated = await tx.accessoryStock.updateMany({
            where: {
              branchId: branchIdForStock,
              accessoryId: item.accessoryId,
              quantity: { gte: item.quantity },
            },
            data: { quantity: { decrement: item.quantity } },
          })
          if (updated.count !== 1) {
            throw new Error("Insufficient accessory stock")
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
