import { prisma } from "@/app/lib/db"

export async function countAll() {
  return prisma.product.count()
}

export async function countAvailable() {
  return prisma.product.count({ where: { availability: "Available" } })
}

export async function countSold() {
  return prisma.product.count({ where: { availability: "Sold" } })
}

export async function countBrandNew() {
  return prisma.product.count({ where: { condition: "BrandNew" } })
}
