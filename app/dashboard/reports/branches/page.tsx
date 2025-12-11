"use client"

import { useState } from "react"
import {
  IconTrendingUp,
  IconTrendingDown,
  IconChartBar,
  IconCurrencyPeso,
  IconShoppingCart,
  IconUsers,
  IconDeviceMobile,
  IconPercentage,
} from "@tabler/icons-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

export default function BranchPerformancePage() {
  const [periodFilter, setPeriodFilter] = useState("monthly")

  // Branch performance data
  const branchPerformance = [
    {
      branch: "Tacloban",
      revenue: 2450000,
      sales: 156,
      customers: 142,
      inventory: 245,
      avgSaleValue: 15705,
      growth: 12.5,
      target: 2800000,
      topProduct: "iPhone 15 Pro Max",
      topProductSales: 45,
      employeeCount: 8,
      customerSatisfaction: 94,
      returnRate: 2.1,
    },
    {
      branch: "Catbalogan",
      revenue: 1850000,
      sales: 124,
      customers: 115,
      inventory: 198,
      avgSaleValue: 14919,
      growth: 8.3,
      target: 2100000,
      topProduct: "Samsung Galaxy S24 Ultra",
      topProductSales: 38,
      employeeCount: 6,
      customerSatisfaction: 91,
      returnRate: 3.2,
    },
    {
      branch: "Guiuan E.Samar",
      revenue: 1320000,
      sales: 98,
      customers: 89,
      inventory: 156,
      avgSaleValue: 13469,
      growth: -2.4,
      target: 1500000,
      topProduct: "Xiaomi Redmi Note 13 Pro",
      topProductSales: 32,
      employeeCount: 5,
      customerSatisfaction: 88,
      returnRate: 4.5,
    },
    {
      branch: "Borongan E.Samar",
      revenue: 1680000,
      sales: 112,
      customers: 103,
      inventory: 174,
      avgSaleValue: 15000,
      growth: 15.7,
      target: 1800000,
      topProduct: "MacBook Air M3",
      topProductSales: 28,
      employeeCount: 6,
      customerSatisfaction: 92,
      returnRate: 2.8,
    },
  ]

  const totalRevenue = branchPerformance.reduce((sum, b) => sum + b.revenue, 0)
  const totalSales = branchPerformance.reduce((sum, b) => sum + b.sales, 0)
  const avgGrowth = branchPerformance.reduce((sum, b) => sum + b.growth, 0) / branchPerformance.length
  const bestPerformer = branchPerformance.reduce((best, branch) => 
    branch.growth > best.growth ? branch : best
  )

  const getTargetProgress = (revenue: number, target: number) => {
    return (revenue / target) * 100
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branch Performance</h1>
          <p className="text-muted-foreground">
            Comprehensive performance metrics across all branches
          </p>
        </div>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IconCurrencyPeso className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All branches combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Transactions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Growth</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {avgGrowth >= 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all branches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestPerformer.branch}</div>
            <p className="text-xs text-green-600">+{bestPerformer.growth}% growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Branch Comparison</CardTitle>
          <CardDescription>
            Detailed performance metrics for each branch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Customers</TableHead>
                  <TableHead className="text-right">Avg Sale</TableHead>
                  <TableHead className="text-right">Growth</TableHead>
                  <TableHead>Target Progress</TableHead>
                  <TableHead className="text-right">Satisfaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchPerformance.map((branch) => (
                  <TableRow key={branch.branch}>
                    <TableCell className="font-medium">{branch.branch}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₱{branch.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{branch.sales}</TableCell>
                    <TableCell className="text-right">{branch.customers}</TableCell>
                    <TableCell className="text-right">
                      ₱{branch.avgSaleValue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {branch.growth >= 0 ? (
                          <IconTrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <IconTrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={branch.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {branch.growth >= 0 ? '+' : ''}{branch.growth}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{getTargetProgress(branch.revenue, branch.target).toFixed(0)}%</span>
                          <span className="text-muted-foreground">
                            ₱{branch.target.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={getTargetProgress(branch.revenue, branch.target)} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          branch.customerSatisfaction >= 90
                            ? "border-green-600 text-green-600"
                            : "border-yellow-600 text-yellow-600"
                        }
                      >
                        {branch.customerSatisfaction}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Branch Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {branchPerformance.map((branch) => (
          <Card key={branch.branch}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{branch.branch}</CardTitle>
                <Badge
                  variant={branch.growth >= 0 ? "default" : "destructive"}
                  className={
                    branch.growth >= 0
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }
                >
                  {branch.growth >= 0 ? '+' : ''}{branch.growth}%
                </Badge>
              </div>
              <CardDescription>
                Target: ₱{branch.target.toLocaleString()} ({getTargetProgress(branch.revenue, branch.target).toFixed(0)}% achieved)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconCurrencyPeso className="h-4 w-4" />
                    <span>Revenue</span>
                  </div>
                  <div className="text-2xl font-bold">₱{branch.revenue.toLocaleString()}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconShoppingCart className="h-4 w-4" />
                    <span>Sales Count</span>
                  </div>
                  <div className="text-2xl font-bold">{branch.sales}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconUsers className="h-4 w-4" />
                    <span>Customers</span>
                  </div>
                  <div className="text-2xl font-bold">{branch.customers}</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconDeviceMobile className="h-4 w-4" />
                    <span>Inventory</span>
                  </div>
                  <div className="text-2xl font-bold">{branch.inventory}</div>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Top Product</span>
                  <span className="font-medium">{branch.topProduct}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Top Product Sales</span>
                  <span className="font-medium">{branch.topProductSales} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Employee Count</span>
                  <span className="font-medium">{branch.employeeCount} staff</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Return Rate</span>
                  <span className={`font-medium ${branch.returnRate > 3 ? 'text-orange-600' : 'text-green-600'}`}>
                    {branch.returnRate}%
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                  <span className="text-sm font-medium">{branch.customerSatisfaction}%</span>
                </div>
                <Progress value={branch.customerSatisfaction} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
