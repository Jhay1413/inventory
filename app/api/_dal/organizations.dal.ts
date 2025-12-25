import { prisma } from "@/app/lib/db"

export async function listOrganizations() {
  return prisma.organization.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: [{ name: "asc" }],
  })
}
