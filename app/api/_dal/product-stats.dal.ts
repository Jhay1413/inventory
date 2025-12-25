import { prisma } from "@/app/lib/db"

function whereFor(opts?: { branchId?: string }, extra?: Record<string, unknown>) {
  return {
    ...(opts?.branchId ? { branchId: opts.branchId } : {}),
    ...(extra ?? {}),
  }
}

export async function countAll(opts?: { branchId?: string }) {
  return prisma.product.count({ where: whereFor(opts) })
}

export async function countAvailable(opts?: { branchId?: string }) {
  return prisma.product.count({ where: whereFor(opts, { availability: "Available" }) })
}

export async function countSold(opts?: { branchId?: string }) {
  return prisma.product.count({ where: whereFor(opts, { availability: "Sold" }) })
}

export async function countBrandNew(opts?: { branchId?: string }) {
  return prisma.product.count({ where: whereFor(opts, { condition: "BrandNew" }) })
}
