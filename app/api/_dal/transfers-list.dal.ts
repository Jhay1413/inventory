import { prisma } from "@/app/lib/db"
import type { TransferStatus } from "@/app/generated/prisma/enums"

export type TransferDirection = "incoming" | "outgoing" | "all"

export async function listTransfers(args: {
  direction: TransferDirection
  organizationId: string
  status?: TransferStatus
  limit: number
  offset: number
}) {
  const where =
    args.direction === "incoming"
      ? { toBranchId: args.organizationId }
      : args.direction === "outgoing"
        ? { fromBranchId: args.organizationId }
        : {
            OR: [{ fromBranchId: args.organizationId }, { toBranchId: args.organizationId }],
          }

  const finalWhere = args.status ? { ...where, status: args.status } : where

  const [total, transfers] = await Promise.all([
    prisma.transfer.count({ where: finalWhere }),
    prisma.transfer.findMany({
      where: finalWhere,
      orderBy: { createdAt: "desc" },
      skip: args.offset,
      take: args.limit,
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
        fromBranch: { select: { id: true, name: true, slug: true } },
        toBranch: { select: { id: true, name: true, slug: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
      },
    }),
  ])

  return { total, transfers }
}
