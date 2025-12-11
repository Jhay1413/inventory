"use client"

import { useState } from "react"
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCurrencyPeso,
  IconShoppingCart,
  IconUsers,
  IconCalendar,
  IconChartLine,
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
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function SalesReportsPage() {
  const [periodFilter, setPeriodFilter] = useState("monthly")
  const [branchFilter, setBranchFilter] = useState("all")

  // Monthly sales trend data
  const monthlySalesData = [
    { month: "Jun", revenue: 5200000, transactions: 342, avgSale: 15205 },
    { month: "Jul", revenue: 5850000, transactions: 389, avgSale: 15038 },
    { month: "Aug", revenue: 6100000, transactions: 412, avgSale: 14806 },
    { month: "Sep", revenue: 6450000, transactions: 438, avgSale: 14726 },
    { month: "Oct", revenue: 6890000, transactions: 465, avgSale: 14817 },
    { month: "Nov", revenue: 7300000, transactions: 490, avgSale: 14898 },
  ]

  // Branch comparison data
  const branchSalesData = [
    {
      branch: "Tacloban",
      revenue: 2450000,
      transactions: 156,
      avgSale: 15705,
      growth: 12.5,
      contribution: 33.6,
    },
    {
      branch: "Catbalogan",
      revenue: 1850000,
      transactions: 124,
      avgSale: 14919,
      growth: 8.3,
      contribution: 25.3,
    },
    {
      branch: "Guiuan E.Samar",
      revenue: 1320000,
      transactions: 98,
      avgSale: 13469,
      growth: -2.4,
      contribution: 18.1,
    },
    {
      branch: "Borongan E.Samar",
      revenue: 1680000,
      transactions: 112,
      avgSale: 15000,
      growth: 15.7,
      contribution: 23.0,
    },
  ]

  // Payment type distribution
  const paymentTypeData = [
    { type: "Cash", count: 245, revenue: 3675000, percentage: 50.3 },
    { type: "Credit Card", count: 156, revenue: 2340000, percentage: 32.1 },
    { type: "Installment", count: 89, revenue: 1285000, percentage: 17.6 },
  ]

  // Product category performance
  const categoryData = [
    { category: "Smartphones", revenue: 4380000, count: 287, avgPrice: 15261 },
    { category: "Laptops", revenue: 1890000, count: 42, avgPrice: 45000 },
    { category: "Tablets", revenue: 680000, count: 58, avgPrice: 11724 },
    { category: "Accessories", revenue: 350000, count: 103, avgPrice: 3398 },
  ]

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    transactions: {
      label: "Transactions",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

  const totalRevenue = branchSalesData.reduce((sum, b) => sum + b.revenue, 0)
  const totalTransactions = branchSalesData.reduce((sum, b) => sum + b.transactions, 0)
  const avgGrowth = branchSalesData.reduce((sum, b) => sum + b.growth, 0) / branchSalesData.length
  const avgSaleValue = totalRevenue / totalTransactions

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive sales reports and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="tacloban">Tacloban</SelectItem>
              <SelectItem value="catbalogan">Catbalogan</SelectItem>
              <SelectItem value="guiuan">Guiuan E.Samar</SelectItem>
              <SelectItem value="borongan">Borongan E.Samar</SelectItem>
            </SelectContent>
          </Select>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IconCurrencyPeso className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <IconTrendingUp className="h-3 w-3" />
              +{avgGrowth.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total sales this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sale Value</CardTitle>
            <IconChartLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{avgSaleValue.toFixed(0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per transaction average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">449</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active customers served
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>Monthly revenue and transaction volume</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.6}
                name="Revenue (₱)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Branch Performance & Payment Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Branch Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Branch Performance</CardTitle>
            <CardDescription>Revenue contribution by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {branchSalesData.map((branch) => (
                <div key={branch.branch} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{branch.branch}</span>
                      <Badge
                        variant="outline"
                        className={
                          branch.growth >= 0
                            ? "border-green-600 text-green-600"
                            : "border-red-600 text-red-600"
                        }
                      >
                        {branch.growth >= 0 ? "+" : ""}{branch.growth}%
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₱{branch.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{branch.contribution}%</p>
                    </div>
                  </div>
                  <Progress value={branch.contribution * 3} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentTypeData.map((payment) => (
                <div key={payment.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          payment.type === "Cash"
                            ? "border-green-600 text-green-600"
                            : payment.type === "Credit Card"
                            ? "border-blue-600 text-blue-600"
                            : "border-orange-600 text-orange-600"
                        }
                      >
                        {payment.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{payment.count} transactions</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₱{payment.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{payment.percentage}%</p>
                    </div>
                  </div>
                  <Progress value={payment.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Product Category Performance</CardTitle>
          <CardDescription>Sales breakdown by product category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg Price</TableHead>
                  <TableHead className="text-right">Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryData.map((category) => {
                  const contribution = (category.revenue / totalRevenue) * 100
                  return (
                    <TableRow key={category.category}>
                      <TableCell className="font-medium">{category.category}</TableCell>
                      <TableCell className="text-right">{category.count}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₱{category.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        ₱{category.avgPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{contribution.toFixed(1)}%</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Branch Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Branch Comparison</CardTitle>
          <CardDescription>Complete performance metrics by branch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Avg Sale</TableHead>
                  <TableHead className="text-right">Growth</TableHead>
                  <TableHead className="text-right">Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branchSalesData.map((branch) => (
                  <TableRow key={branch.branch}>
                    <TableCell className="font-medium">{branch.branch}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₱{branch.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{branch.transactions}</TableCell>
                    <TableCell className="text-right">
                      ₱{branch.avgSale.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {branch.growth >= 0 ? (
                          <IconTrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <IconTrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={branch.growth >= 0 ? "text-green-600" : "text-red-600"}>
                          {branch.growth >= 0 ? "+" : ""}{branch.growth}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{branch.contribution}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
