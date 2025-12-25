"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { SectionCards } from "@/app/dashboard/components/section-cards"
import { ChartAreaInteractive } from "@/app/dashboard/components/chart-area-interactive"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useOrgContext } from "@/app/queries/org-context.queries"
import { useBranchDashboardSummary } from "@/app/queries/dashboard.queries"
import { auth } from "@/app/lib/auth"
import { authClient } from "@/app/lib/auth-client"

export default function BranchDashboardPage() {
  const router = useRouter()
  const org = useOrgContext(true)
  const summary = useBranchDashboardSummary(Boolean(org.data && !org.data.isAdminOrganization))

  useEffect(() => {
    if (org.isSuccess && org.data.isAdminOrganization) {
      router.replace("/dashboard")
    }
  }, [org.isSuccess, org.data?.isAdminOrganization, router])

  useEffect(() => {
    if (org.isError) {
      router.replace("/auth")
    }
  }, [org.isError, router])

  if (org.isLoading || summary.isLoading || !org.data) {
    return <div className="flex flex-1 flex-col gap-4 p-4 pt-0" />
  }

  if (org.isError) return null

  if (org.data.isAdminOrganization) {
    return null
  }

  if (summary.isError || !summary.data) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">Failed to load dashboard</div>
    )
  }

  const activity = summary.data.activity
  const topProducts = summary.data.topProducts
  const maxSales = Math.max(1, topProducts[0]?.sales ?? 1)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SectionCards {...summary.data.section} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ChartAreaInteractive
            title={summary.data.chart.title}
            descriptionDesktop={summary.data.chart.descriptionDesktop}
            descriptionMobile={summary.data.chart.descriptionMobile}
            series={summary.data.chart.series}
            data={summary.data.chart.data}
          />
        </div>
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest sales and transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.map((a) => (
                  <div key={a.id} className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{a.product}</p>
                        <Badge variant="outline" className="text-xs">
                          {a.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{a.branch}</p>
                      <p className="text-xs text-muted-foreground">{a.time}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {a.amount > 0 ? (
                        <p className="text-sm font-semibold">₱{a.amount.toLocaleString()}</p>
                      ) : null}
                      <Badge variant="secondary" className="text-xs">
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topProducts.map((p, index) => (
                  <div key={p.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.sales} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">₱{p.revenue.toLocaleString()}</p>
                        <p className={`text-xs ${p.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {p.growth >= 0 ? "+" : ""}
                          {p.growth}%
                        </p>
                      </div>
                    </div>
                    <Progress value={(p.sales / maxSales) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
