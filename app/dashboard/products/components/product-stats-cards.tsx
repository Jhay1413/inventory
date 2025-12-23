"use client"

import { IconDeviceMobile } from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ProductStats } from "@/types/api/product-stats"

export function ProductStatsCards({
  stats,
  isLoading,
}: {
  stats?: ProductStats
  isLoading?: boolean
}) {
  const total = stats?.total ?? 0
  const available = stats?.available ?? 0
  const sold = stats?.sold ?? 0
  const brandNew = stats?.brandNew ?? 0

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gadgets</CardTitle>
          <IconDeviceMobile className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : total}</div>
          <p className="text-xs text-muted-foreground">All products</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available</CardTitle>
          <IconDeviceMobile className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : available}</div>
          <p className="text-xs text-muted-foreground">In stock</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sold</CardTitle>
          <IconDeviceMobile className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : sold}</div>
          <p className="text-xs text-muted-foreground">Completed sales</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Brand New</CardTitle>
          <IconDeviceMobile className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : brandNew}</div>
          <p className="text-xs text-muted-foreground">New items</p>
        </CardContent>
      </Card>
    </div>
  )
}
