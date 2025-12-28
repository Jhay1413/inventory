import { prisma } from "@/app/lib/db"
import { ProductAvailability as DbProductAvailability } from "@/app/generated/prisma/client"

export function returnInclude() {
  return {
    branch: { select: { id: true, name: true, slug: true } },
    createdBy: { select: { id: true, name: true, email: true } },
    productItems: {
      include: {
        product: {
          include: {
            productModel: { include: { productType: true } },
            branch: { select: { id: true, name: true, slug: true } },
          },
        },
        replacementProduct: {
          include: {
            productModel: { include: { productType: true } },
            branch: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    },
    accessoryItems: {
      include: {
        accessory: { select: { id: true, name: true } },
      },
    },
  } as const
}

export async function createReturnTx(args: {
  invoiceId: string
  branchId: string
  createdById: string
  reason?: string
  notes?: string
  productItems: Array<{
    productId: string
    defectNotes?: string
    resolution: "Exchange" | "Repair"
    replacementProductId?: string
  }>
  accessoryItems?: Array<{
    accessoryId: string
    quantity: number
    defectNotes?: string
    resolution: "Exchange" | "Repair"
  }>
}) {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: args.invoiceId },
      select: { id: true, branchId: true },
    })

    if (!invoice) throw new Error("Invoice not found")

    // Ensure returned products belong to the invoice (main product or invoice items)
    const invoiceItems = await tx.invoiceItem.findMany({
      where: { invoiceId: args.invoiceId },
      select: { productId: true },
    })

    const invoiceProduct = await tx.invoice.findUnique({
      where: { id: args.invoiceId },
      select: { productId: true },
    })

    const allowedProductIds = new Set<string>([
      ...(invoiceProduct?.productId ? [invoiceProduct.productId] : []),
      ...invoiceItems.map((it) => it.productId),
    ])

    for (const it of args.productItems) {
      if (!allowedProductIds.has(it.productId)) {
        throw new Error("Returned product is not part of the invoice")
      }
      if (it.resolution === "Exchange" && !it.replacementProductId) {
        throw new Error("Replacement product is required for exchange")
      }
    }

    // Validate replacement products and mark them sold by adding them to invoice items.
    for (const it of args.productItems) {
      if (it.resolution !== "Exchange" || !it.replacementProductId) continue

      const replacement = await tx.product.findUnique({
        where: { id: it.replacementProductId },
        select: { id: true, availability: true, isDefective: true },
      })

      if (!replacement) throw new Error("Replacement product not found")
      if (replacement.availability !== "Available") throw new Error("Replacement product is not available")
      if (replacement.isDefective) throw new Error("Replacement product is defective")

      // Add to invoice as a freebie (exchange)
      await tx.invoiceItem.create({
        data: {
          invoiceId: args.invoiceId,
          productId: replacement.id,
          unitPrice: 0,
          discountAmount: 0,
          netAmount: 0,
          isFreebie: true,
        },
      })

      await tx.product.update({
        where: { id: replacement.id },
        data: {
          availability: "Sold",
          status: "Exchanged",
        },
      })
    }

    // Mark returned products as defective and in return flow
    for (const it of args.productItems) {
      await tx.product.update({
        where: { id: it.productId },
        data: {
          isDefective: true,
          defectNotes: it.defectNotes,
          availability: DbProductAvailability.Returned,
          status: it.resolution === "Repair" ? "UnderRepair" : "Returned",
        },
      })
    }

    const created = await tx.return.create({
      data: {
        invoiceId: args.invoiceId,
        branchId: args.branchId,
        createdById: args.createdById,
        status: "Open",
        reason: args.reason,
        notes: args.notes,
        productItems: {
          create: args.productItems.map((it) => ({
            productId: it.productId,
            defectNotes: it.defectNotes,
            resolution: it.resolution,
            replacementProductId: it.replacementProductId,
          })),
        },
        accessoryItems: args.accessoryItems?.length
          ? {
              create: args.accessoryItems.map((it) => ({
                accessoryId: it.accessoryId,
                quantity: it.quantity,
                defectNotes: it.defectNotes,
                resolution: it.resolution,
              })),
            }
          : undefined,
      },
      include: returnInclude(),
    })

    return created
  })
}

export async function getReturnById(id: string) {
  return prisma.return.findUnique({
    where: { id },
    include: returnInclude(),
  })
}

export async function listReturns(args: {
  limit: number
  offset: number
  status?: "Open" | "Processing" | "Completed" | "Rejected"
}) {
  return prisma.return.findMany({
    where: args.status ? { status: args.status } : undefined,
    include: returnInclude(),
    orderBy: [{ createdAt: "desc" }],
    take: args.limit,
    skip: args.offset,
  })
}

export async function countReturns(args: { status?: "Open" | "Processing" | "Completed" | "Rejected" }) {
  return prisma.return.count({
    where: args.status ? { status: args.status } : undefined,
  })
}

export async function updateReturnStatus(id: string, status: "Open" | "Processing" | "Completed" | "Rejected") {
  return prisma.return.update({
    where: { id },
    data: { status },
    include: returnInclude(),
  })
}
