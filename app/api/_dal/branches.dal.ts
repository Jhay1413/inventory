import { InvoiceStatus, ProductAvailability } from "@/app/generated/prisma/enums"
import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/db"

function safeParseOrgMetadata(metadata: string | null):
  | {
      isAdminOrganization?: boolean
      location?: string
      phone?: string
      manager?: string
      status?: "Active" | "Inactive"
      employees?: number
    }
  | null {
  if (!metadata) return null
  try {
    return JSON.parse(metadata) as {
      isAdminOrganization?: boolean
      location?: string
      phone?: string
      manager?: string
      status?: "Active" | "Inactive"
      employees?: number
    }
  } catch {
    return null
  }
}

function slugifyOrganizationSlug(input: string) {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+/, "")
    .replace(/_+$/, "")

  return slug || "branch"
}

async function generateUniqueOrganizationSlug(baseSlug: string) {
  const normalized = slugifyOrganizationSlug(baseSlug)

  // Try base, then a few deterministic-ish suffixes.
  const candidates = [
    normalized,
    `${normalized}_${Date.now().toString(36)}`,
    `${normalized}_${Date.now().toString(36)}_1`,
    `${normalized}_${Date.now().toString(36)}_2`,
  ]

  for (const candidate of candidates) {
    const existing = await prisma.organization.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!existing) return candidate
  }

  // Extremely unlikely fallback
  return `${normalized}-${Math.random().toString(36).slice(2, 8)}`
}

export async function listBranchesOverview() {
  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      metadata: true,
      _count: { select: { members: true } },
    },
    orderBy: [{ name: "asc" }],
  })

  const branchOrgs = organizations.filter((org) => {
    const meta = safeParseOrgMetadata(org.metadata)
    return meta?.isAdminOrganization !== true
  })

  const branchIds = branchOrgs.map((o) => o.id)
  if (branchIds.length === 0) {
    return [] as const
  }

  const stockCounts = await prisma.product.groupBy({
    by: ["branchId"],
    where: {
      branchId: { in: branchIds },
      availability: ProductAvailability.Available,
    },
    _count: { _all: true },
  })

  const now = new Date()
  const startOfMonthUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0))
  const startOfNextMonthUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0))

  const invoiceAgg = await prisma.invoice.groupBy({
    by: ["branchId"],
    where: {
      branchId: { in: branchIds },
      createdAt: { gte: startOfMonthUtc, lt: startOfNextMonthUtc },
      status: { in: [InvoiceStatus.Paid, InvoiceStatus.PartiallyPaid] },
    },
    _count: { _all: true },
    _sum: { salePrice: true },
  })

  const stockByBranchId = new Map<string, number>()
  for (const row of stockCounts) {
    if (!row.branchId) continue
    stockByBranchId.set(row.branchId, row._count._all)
  }

  const invoicesByBranchId = new Map<string, { monthlySales: number; revenue: number }>()
  for (const row of invoiceAgg) {
    invoicesByBranchId.set(row.branchId, {
      monthlySales: row._count._all,
      revenue: row._sum.salePrice ?? 0,
    })
  }

  return branchOrgs.map((org) => {
    const meta = safeParseOrgMetadata(org.metadata)

    const inv = invoicesByBranchId.get(org.id)
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      location: meta?.location ?? null,
      phone: meta?.phone ?? null,
      manager: meta?.manager ?? null,
      employees: typeof meta?.employees === "number" ? meta.employees : org._count.members,
      totalStock: stockByBranchId.get(org.id) ?? 0,
      monthlySales: inv?.monthlySales ?? 0,
      revenue: inv?.revenue ?? 0,
      status: meta?.status ?? "Active",
    }
  })
}

export async function createBranchOrganization(
  headers: Headers,
  input: {
    name: string
    slug: string
  }
) {
  const slug = await generateUniqueOrganizationSlug(input.slug)

  const metadata = {
    isAdminOrganization: false,
  } as const

  const result = await auth.api.createOrganization({
    headers,
    body: {
      name: input.name,
      slug,
      metadata,
      // requested: make userId empty
      userId: "",
      keepCurrentActiveOrganization: true,
    },
  })

  const organization = result
  if (!organization?.id) {
    throw new Error("Failed to create branch")
  }

  return organization as { id: string; name?: string; slug?: string }
}
