import { prisma } from "@/app/lib/db"

export async function listProductTypes() {
  return prisma.productType.findMany({
    orderBy: { name: "asc" },
  })
}

export async function createProductType(name: string) {
  return prisma.productType.create({
    data: { name },
  })
}
