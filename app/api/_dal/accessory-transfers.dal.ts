import { prisma } from "@/app/lib/db"

export async function findOrganizationById(id: string) {
  return prisma.organization.findUnique({
    where: { id },
    select: { id: true },
  })
}

export async function createAccessoryTransfer(data: {
  accessoryId: string
  fromBranchId: string
  toBranchId: string
  requestedById: string
  quantity: number
  reason: string
  notes?: string
}) {
  return prisma.accessoryTransfer.create({
    data,
    include: {
      accessory: { select: { id: true, name: true } },
      fromBranch: { select: { id: true, name: true, slug: true } },
      toBranch: { select: { id: true, name: true, slug: true } },
      requestedBy: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function getAccessoryTransferById(id: string) {
  return prisma.accessoryTransfer.findUnique({
    where: { id },
    include: {
      accessory: { select: { id: true, name: true } },
      fromBranch: { select: { id: true, name: true, slug: true } },
      toBranch: { select: { id: true, name: true, slug: true } },
      requestedBy: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function listAccessoryTransfers(args: {
  branchId: string
  direction: "incoming" | "outgoing" | "all"
  status?: "Pending" | "Approved" | "Rejected" | "Cancelled" | "Completed"
  limit: number
  offset: number
}) {
  const where: any = {}

  if (args.status) where.status = args.status

  if (args.direction === "incoming") {
    where.toBranchId = args.branchId
  } else if (args.direction === "outgoing") {
    where.fromBranchId = args.branchId
  } else {
    where.OR = [{ fromBranchId: args.branchId }, { toBranchId: args.branchId }]
  }

  const [total, transfers] = await Promise.all([
    prisma.accessoryTransfer.count({ where }),
    prisma.accessoryTransfer.findMany({
      where,
      include: {
        accessory: { select: { id: true, name: true } },
        fromBranch: { select: { id: true, name: true, slug: true } },
        toBranch: { select: { id: true, name: true, slug: true } },
        requestedBy: { select: { id: true, name: true, email: true } },
        receivedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      take: args.limit,
      skip: args.offset,
    }),
  ])

  return { total, transfers }
}
