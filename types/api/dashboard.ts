import { z } from "zod"

export const DashboardChartSeriesSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  color: z.string().min(1),
})

export type DashboardChartSeries = z.infer<typeof DashboardChartSeriesSchema>

export const DashboardSectionSchema = z.object({
  totalRevenue: z.number(),
  totalInventory: z.number(),
  lowStockAlerts: z.number(),
  pendingDeliveries: z.number(),
  revenueScopeLabel: z.string(),
  revenueScopeDetail: z.string(),
  inventoryScopeDetail: z.string(),
})

export const DashboardChartSchema = z.object({
  title: z.string(),
  descriptionDesktop: z.string(),
  descriptionMobile: z.string(),
  series: z.array(DashboardChartSeriesSchema),
  data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
})

export const DashboardActivityItemSchema = z.object({
  id: z.string(),
  type: z.enum(["Sale", "Transfer"]),
  branch: z.string(),
  product: z.string(),
  amount: z.number(),
  status: z.string(),
  time: z.string(),
})

export const DashboardTopProductSchema = z.object({
  name: z.string(),
  sales: z.number(),
  revenue: z.number(),
  growth: z.number(),
})

export const DashboardSummaryResponseSchema = z.object({
  section: DashboardSectionSchema,
  chart: DashboardChartSchema,
  activity: z.array(DashboardActivityItemSchema),
  topProducts: z.array(DashboardTopProductSchema),
})

export type DashboardSummaryResponse = z.infer<typeof DashboardSummaryResponseSchema>
