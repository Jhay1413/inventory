import { prisma } from "@/app/lib/db"

type RecentActivityItem = {
  id: string
  type: "Sale" | "Transfer"
  branch: string
  product: string
  amount: number
  status: string
  time: string
  createdAt: Date
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function timeAgo(date: Date) {
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} mins ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hours ago`
  const days = Math.floor(hrs / 24)
  return `${days} days ago`
}

function safeSeriesKey(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24)
}

async function getNonAdminBranches() {
  const branches = await prisma.organization.findMany({
    select: { id: true, name: true, slug: true, metadata: true },
    orderBy: { name: "asc" },
  })

  return branches.filter((b) => {
    if (!b.metadata) return true
    try {
      const parsed = JSON.parse(b.metadata) as { isAdminOrganization?: boolean }
      return parsed.isAdminOrganization !== true
    } catch {
      return true
    }
  })
}

export async function getAdminDashboardSummary() {
  const today = new Date()
  const start90 = new Date(today)
  start90.setDate(start90.getDate() - 90)
  start90.setHours(0, 0, 0, 0)

  const start30 = new Date(today)
  start30.setDate(start30.getDate() - 30)
  start30.setHours(0, 0, 0, 0)

  const start60 = new Date(today)
  start60.setDate(start60.getDate() - 60)
  start60.setHours(0, 0, 0, 0)

  const [nonAdminBranches, revenueAgg, totalInventory, pendingTransfers, invoicesForChart] =
    await Promise.all([
      getNonAdminBranches(),
      prisma.invoice.aggregate({
        _sum: { salePrice: true },
        where: { status: { in: ["Paid", "PartiallyPaid"] } },
      }),
      prisma.product.count({ where: { availability: "Available" } }),
      prisma.transfer.count({ where: { status: { in: ["Pending", "Approved"] } } }),
      prisma.invoice.findMany({
        where: {
          status: { in: ["Paid", "PartiallyPaid"] },
          createdAt: { gte: start90 },
        },
        select: { createdAt: true, salePrice: true, branchId: true },
      }),
    ])

  // Pick the top 4 branches by revenue (last 90d) so the chart isn't empty
  const nonAdminBranchById = new Map(nonAdminBranches.map((b) => [b.id, b]))
  const revenueByBranchId = new Map<string, number>()
  for (const inv of invoicesForChart) {
    // Only consider non-admin branches
    if (!nonAdminBranchById.has(inv.branchId)) continue
    revenueByBranchId.set(inv.branchId, (revenueByBranchId.get(inv.branchId) ?? 0) + inv.salePrice)
  }

  const topBranchIds = Array.from(revenueByBranchId.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([branchId]) => branchId)

  const chartBranches = topBranchIds
    .map((id) => nonAdminBranchById.get(id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b))

  const hasBranchSeries = chartBranches.length > 0
  const series = hasBranchSeries
    ? chartBranches.map((b, idx) => {
        const key = safeSeriesKey(b.slug || b.name || b.id)
        return { key, label: b.name, color: `hsl(var(--chart-${idx + 1}))` }
      })
    : [{ key: "revenue", label: "Revenue", color: "hsl(var(--chart-1))" }]

  const branchKeyById = new Map(chartBranches.map((b, idx) => [b.id, series[idx]!.key]))

  const dateRows = new Map<string, Record<string, number | string>>()
  for (let i = 0; i <= 90; i++) {
    const d = new Date(start90)
    d.setDate(d.getDate() + i)
    const iso = toIsoDate(d)
    const base: Record<string, number | string> = { date: iso }
    for (const s of series) base[s.key] = 0
    dateRows.set(iso, base)
  }

  for (const inv of invoicesForChart) {
    const iso = toIsoDate(inv.createdAt)
    const row = dateRows.get(iso)
    if (!row) continue

    if (!hasBranchSeries) {
      row.revenue = (row.revenue as number) + inv.salePrice
      continue
    }

    const key = branchKeyById.get(inv.branchId)
    if (!key) continue
    row[key] = (row[key] as number) + inv.salePrice
  }

  const chartData = Array.from(dateRows.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  )

  // Low stock: models with <= 2 available units
  const lowStockThreshold = 2
  const modelCounts = await prisma.product.groupBy({
    by: ["productModelId"],
    where: { availability: "Available" },
    _count: { _all: true },
  })
  const lowStockAlerts = modelCounts.filter((g) => g._count._all <= lowStockThreshold).length

  const [recentInvoices, recentTransfers] = await Promise.all([
    prisma.invoice.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        branch: { select: { name: true } },
        product: { include: { productModel: true } },
      },
    }),
    prisma.transfer.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        fromBranch: { select: { name: true } },
        toBranch: { select: { name: true } },
        product: { include: { productModel: true } },
      },
    }),
  ])

  const activity: RecentActivityItem[] = [
    ...recentInvoices.map((inv) => ({
      id: inv.id,
      type: "Sale" as const,
      branch: inv.branch.name,
      product: inv.product.productModel.name,
      amount: inv.salePrice,
      status: inv.status,
      time: timeAgo(inv.createdAt),
      createdAt: inv.createdAt,
    })),
    ...recentTransfers.map((t) => ({
      id: t.id,
      type: "Transfer" as const,
      branch: `${t.fromBranch.name} → ${t.toBranch.name}`,
      product: t.product.productModel.name,
      amount: 0,
      status: t.status,
      time: timeAgo(t.createdAt),
      createdAt: t.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)

  const items60 = await prisma.invoiceItem.findMany({
    where: {
      isFreebie: false,
      createdAt: { gte: start60 },
      invoice: { status: { in: ["Paid", "PartiallyPaid"] } },
    },
    include: { product: { include: { productModel: true } } },
  })

  const currStart = start30.getTime()
  const prevStart = start60.getTime()

  const curr = new Map<string, { name: string; sales: number; revenue: number }>()
  const prev = new Map<string, { sales: number }>()

  for (const it of items60) {
    const modelId = it.product.productModelId
    const name = it.product.productModel.name
    const created = it.createdAt.getTime()

    if (created >= currStart) {
      const existing = curr.get(modelId) ?? { name, sales: 0, revenue: 0 }
      existing.sales += 1
      existing.revenue += it.netAmount
      curr.set(modelId, existing)
    } else if (created >= prevStart && created < currStart) {
      const existing = prev.get(modelId) ?? { sales: 0 }
      existing.sales += 1
      prev.set(modelId, existing)
    }
  }

  const topProducts = Array.from(curr.entries())
    .map(([modelId, v]) => {
      const prevSales = prev.get(modelId)?.sales ?? 0
      const growth =
        prevSales === 0 ? (v.sales > 0 ? 100 : 0) : Math.round(((v.sales - prevSales) / prevSales) * 100)
      return { name: v.name, sales: v.sales, revenue: v.revenue, growth }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    section: {
      totalRevenue: revenueAgg._sum.salePrice ?? 0,
      totalInventory,
      lowStockAlerts,
      pendingDeliveries: pendingTransfers,
      revenueScopeLabel: "All branches combined",
      revenueScopeDetail: `Sales across ${nonAdminBranches.length} locations`,
      inventoryScopeDetail: `${totalInventory.toLocaleString()} units available`,
    },
    chart: {
      title: "Sales Revenue by Branch",
      descriptionDesktop: "Daily revenue across all branches",
      descriptionMobile: "Revenue by branch",
      series,
      data: chartData,
    },
    activity: activity.map(({ createdAt: _createdAt, ...rest }) => rest),
    topProducts,
  }
}

export async function getBranchDashboardSummary(branchId: string) {
  const branch = await prisma.organization.findUnique({
    where: { id: branchId },
    select: { id: true, name: true },
  })

  if (!branch) {
    throw new Error("Branch not found")
  }

  const today = new Date()
  const start90 = new Date(today)
  start90.setDate(start90.getDate() - 90)
  start90.setHours(0, 0, 0, 0)

  const start30 = new Date(today)
  start30.setDate(start30.getDate() - 30)
  start30.setHours(0, 0, 0, 0)

  const start60 = new Date(today)
  start60.setDate(start60.getDate() - 60)
  start60.setHours(0, 0, 0, 0)

  const [revenueAgg, totalInventory, pendingTransfers, invoicesForChart] = await Promise.all([
    prisma.invoice.aggregate({
      _sum: { salePrice: true },
      where: { branchId: branch.id, status: { in: ["Paid", "PartiallyPaid"] } },
    }),
    prisma.product.count({ where: { availability: "Available", branchId: branch.id } }),
    prisma.transfer.count({
      where: {
        status: { in: ["Pending", "Approved"] },
        OR: [{ fromBranchId: branch.id }, { toBranchId: branch.id }],
      },
    }),
    prisma.invoice.findMany({
      where: {
        branchId: branch.id,
        status: { in: ["Paid", "PartiallyPaid"] },
        createdAt: { gte: start90 },
      },
      select: { createdAt: true, salePrice: true },
    }),
  ])

  const modelCounts = await prisma.product.groupBy({
    by: ["productModelId"],
    where: { availability: "Available", branchId: branch.id },
    _count: { _all: true },
  })
  const lowStockThreshold = 2
  const lowStockAlerts = modelCounts.filter((g) => g._count._all <= lowStockThreshold).length

  const dateRows = new Map<string, Record<string, number | string>>()
  for (let i = 0; i <= 90; i++) {
    const d = new Date(start90)
    d.setDate(d.getDate() + i)
    const iso = toIsoDate(d)
    dateRows.set(iso, { date: iso, revenue: 0 })
  }

  for (const inv of invoicesForChart) {
    const iso = toIsoDate(inv.createdAt)
    const row = dateRows.get(iso)
    if (!row) continue
    row.revenue = (row.revenue as number) + inv.salePrice
  }

  const chartData = Array.from(dateRows.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  )

  const [recentInvoices, recentTransfers] = await Promise.all([
    prisma.invoice.findMany({
      where: { branchId: branch.id },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { product: { include: { productModel: true } } },
    }),
    prisma.transfer.findMany({
      where: { OR: [{ fromBranchId: branch.id }, { toBranchId: branch.id }] },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        fromBranch: { select: { name: true } },
        toBranch: { select: { name: true } },
        product: { include: { productModel: true } },
      },
    }),
  ])

  const activity: RecentActivityItem[] = [
    ...recentInvoices.map((inv) => ({
      id: inv.id,
      type: "Sale" as const,
      branch: branch.name,
      product: inv.product.productModel.name,
      amount: inv.salePrice,
      status: inv.status,
      time: timeAgo(inv.createdAt),
      createdAt: inv.createdAt,
    })),
    ...recentTransfers.map((t) => ({
      id: t.id,
      type: "Transfer" as const,
      branch: `${t.fromBranch.name} → ${t.toBranch.name}`,
      product: t.product.productModel.name,
      amount: 0,
      status: t.status,
      time: timeAgo(t.createdAt),
      createdAt: t.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)

  const items60 = await prisma.invoiceItem.findMany({
    where: {
      isFreebie: false,
      createdAt: { gte: start60 },
      invoice: {
        branchId: branch.id,
        status: { in: ["Paid", "PartiallyPaid"] },
      },
    },
    include: { product: { include: { productModel: true } } },
  })

  const currStart = start30.getTime()
  const prevStart = start60.getTime()

  const curr = new Map<string, { name: string; sales: number; revenue: number }>()
  const prev = new Map<string, { sales: number }>()

  for (const it of items60) {
    const modelId = it.product.productModelId
    const name = it.product.productModel.name
    const created = it.createdAt.getTime()

    if (created >= currStart) {
      const existing = curr.get(modelId) ?? { name, sales: 0, revenue: 0 }
      existing.sales += 1
      existing.revenue += it.netAmount
      curr.set(modelId, existing)
    } else if (created >= prevStart && created < currStart) {
      const existing = prev.get(modelId) ?? { sales: 0 }
      existing.sales += 1
      prev.set(modelId, existing)
    }
  }

  const topProducts = Array.from(curr.entries())
    .map(([modelId, v]) => {
      const prevSales = prev.get(modelId)?.sales ?? 0
      const growth =
        prevSales === 0 ? (v.sales > 0 ? 100 : 0) : Math.round(((v.sales - prevSales) / prevSales) * 100)
      return { name: v.name, sales: v.sales, revenue: v.revenue, growth }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    section: {
      totalRevenue: revenueAgg._sum.salePrice ?? 0,
      totalInventory,
      lowStockAlerts,
      pendingDeliveries: pendingTransfers,
      revenueScopeLabel: "This branch",
      revenueScopeDetail: branch.name,
      inventoryScopeDetail: `${totalInventory.toLocaleString()} units available`,
    },
    chart: {
      title: "Sales Revenue",
      descriptionDesktop: `Daily revenue for ${branch.name}`,
      descriptionMobile: "Revenue",
      series: [{ key: "revenue", label: branch.name, color: "hsl(var(--chart-1))" }],
      data: chartData,
    },
    activity: activity.map(({ createdAt: _createdAt, ...rest }) => rest),
    topProducts,
  }
}
