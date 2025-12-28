import { prisma } from "@/app/lib/db"

export async function listAccessories(filters: { search?: string }) {
  const search = filters.search?.trim()

  return prisma.accessory.findMany({
    where: search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy: { name: "asc" },
  })
}

export async function getAccessoryById(id: string) {
  return prisma.accessory.findUnique({ where: { id } })
}

export async function getAccessoryByName(name: string) {
  return prisma.accessory.findUnique({ where: { name } })
}

export async function createAccessory(name: string) {
  return prisma.accessory.create({ data: { name } })
}
