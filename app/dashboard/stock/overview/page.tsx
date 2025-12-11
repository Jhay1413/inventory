"use client"

import * as React from "react"
import { IconAlertCircle, IconBox, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

const stockOverview = [
  {
    id: "1",
    product: "iPhone 15 Pro Max",
    type: "Apple",
    totalStock: 35,
    minStock: 10,
    maxStock: 50,
    inTransit: 5,
    reserved: 3,
    available: 27,
    status: "healthy",
  },
  {
    id: "2",
    product: "Samsung Galaxy S24 Ultra",
    type: "Android",
    totalStock: 43,
    minStock: 10,
    maxStock: 50,
    inTransit: 2,
    reserved: 5,
    available: 36,
    status: "healthy",
  },
  {
    id: "3",
    product: "Google Pixel 8 Pro",
    type: "Android",
    totalStock: 8,
    minStock: 10,
    maxStock: 30,
    inTransit: 10,
    reserved: 1,
    available: 7,
    status: "low",
  },
  {
    id: "4",
    product: "iPhone 14 Pro",
    type: "Apple",
    totalStock: 14,
    minStock: 10,
    maxStock: 40,
    inTransit: 0,
    reserved: 2,
    available: 12,
    status: "healthy",
  },
  {
    id: "5",
    product: "iPhone 13",
    type: "Apple",
    totalStock: 3,
    minStock: 10,
    maxStock: 30,
    inTransit: 0,
    reserved: 0,
    available: 3,
    status: "critical",
  },
]

export default function StockOverviewPage() {
  const [typeFilter, setTypeFilter] = React.useState("all")

  const filteredStock = stockOverview.filter((item) => {
    return typeFilter === "all" || item.type === typeFilter
  })

  const healthyItems = stockOverview.filter(i => i.status === "healthy").length
  const lowStockItems = stockOverview.filter(i => i.status === "low").length
  const criticalItems = stockOverview.filter(i => i.status === "critical").length
  const totalAvailable = stockOverview.reduce((sum, i) => sum + i.available, 0)

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Overview</h1>
          <p className="text-muted-foreground">
            Complete inventory status across all branches
          </p>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Apple">Apple</SelectItem>
            <SelectItem value="Android">Android</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Stock</CardTitle>
            <IconBox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAvailable}</div>
            <p className="text-xs text-muted-foreground">Units ready to sell</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Stock</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyItems}</div>
            <p className="text-xs text-muted-foreground">Above minimum level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <IconTrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Below minimum level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <IconAlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
            <p className="text-xs text-muted-foreground">Urgent restock needed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Details</CardTitle>
          <CardDescription>Detailed breakdown of inventory levels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Total Stock</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead className="text-center">Reserved</TableHead>
                <TableHead className="text-center">In Transit</TableHead>
                <TableHead>Min/Max</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.map((item) => {
                const stockPercentage = (item.totalStock / item.maxStock) * 100
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product}</TableCell>
                    <TableCell>
                      <Badge variant={item.type === "Apple" ? "default" : "secondary"}>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">{item.totalStock}</TableCell>
                    <TableCell className="text-center">{item.available}</TableCell>
                    <TableCell className="text-center">{item.reserved}</TableCell>
                    <TableCell className="text-center">{item.inTransit}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {item.minStock} / {item.maxStock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(stockPercentage, 100)} className="w-[100px]" />
                        <span className="text-sm text-muted-foreground w-12">
                          {Math.round(stockPercentage)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.status === "healthy"
                            ? "border-green-600 text-green-600"
                            : item.status === "low"
                            ? "border-yellow-600 text-yellow-600"
                            : "border-red-600 text-red-600"
                        }
                      >
                        {item.status === "healthy" && "Healthy"}
                        {item.status === "low" && "Low"}
                        {item.status === "critical" && "Critical"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
