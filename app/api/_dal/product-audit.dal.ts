import { prisma } from "@/app/lib/db"

type ProductAuditLogCreateArgs = Parameters<typeof prisma.productAuditLog.create>[0]
type ProductAuditLogCreateData = ProductAuditLogCreateArgs["data"]
type ProductAuditLogFindManyArgs = Parameters<typeof prisma.productAuditLog.findMany>[0]

type ProductAuditLogDelegate = {
  create: typeof prisma.productAuditLog.create
  findMany: typeof prisma.productAuditLog.findMany
}

export type AuditDbClient = {
  productAuditLog: ProductAuditLogDelegate
}

export async function createProductAuditLog(
  db: AuditDbClient,
  data: {
    productId: string
    action: ProductAuditLogCreateData["action"]
    actorUserId: string
    actorOrganizationId?: string | null
    fromBranchId?: string | null
    toBranchId?: string | null
    transferId?: string | null
    invoiceId?: string | null
    details?: ProductAuditLogCreateData["details"]
  }
) {
  const createData: ProductAuditLogCreateData = {
    product: { connect: { id: data.productId } },
    action: data.action,
    actorUser: { connect: { id: data.actorUserId } },
    actorOrganization: data.actorOrganizationId
      ? { connect: { id: data.actorOrganizationId } }
      : undefined,
    fromBranchId: data.fromBranchId ?? null,
    toBranchId: data.toBranchId ?? null,
    transfer: data.transferId ? { connect: { id: data.transferId } } : undefined,
    invoice: data.invoiceId ? { connect: { id: data.invoiceId } } : undefined,
    details: data.details,
  }

  return db.productAuditLog.create({ data: createData })
}

export async function listProductAuditLogsForProduct(
  db: AuditDbClient,
  args: {
    productId: string
    take?: number
    skip?: number
  }
) {
  const query: ProductAuditLogFindManyArgs = {
    where: { productId: args.productId },
    orderBy: { createdAt: "desc" },
    take: args.take,
    skip: args.skip,
    include: {
      actorUser: { select: { id: true, name: true, email: true } },
      actorOrganization: { select: { id: true, name: true } },
      transfer: {
        select: {
          id: true,
          status: true,
          reason: true,
          notes: true,
          fromBranch: { select: { id: true, name: true } },
          toBranch: { select: { id: true, name: true } },
        },
      },
      invoice: {
        select: {
          id: true,
          status: true,
          paymentType: true,
          salePrice: true,
          customerName: true,
          customerPhone: true,
        },
      },
    },
  }

  return db.productAuditLog.findMany(query)
}
