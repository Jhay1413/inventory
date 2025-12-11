"use client"

import * as React from "react"
import { IconAlertCircle, IconBox, IconBuildingStore, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
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

// Mock data for demonstration
const branches = [
  { id: "all", name: "All Branches" },
  { id: "tacloban", name: "Tacloban" },
  { id: "catbalogan", name: "Catbalogan" },
  { id: "guiuan", name: "Guiuan E.Samar" },
  { id: "borongan", name: "Borongan E.Samar" },
]

const inventoryData = [
  {
    id: "1",
    product: "iPhone 15 Pro Max",
    type: "Apple",
    tacloban: 12,
    catbalogan: 8,
    guiuan: 5,
    borongan: 10,
    total: 35,
    status: "healthy",
    minStock: 10,
  },
  {
    id: "2",
    product: "Samsung Galaxy S24 Ultra",
    type: "Android",
    tacloban: 15,
    catbalogan: 12,
    guiuan: 9,
    borongan: 7,
    total: 43,
    status: "healthy",
    minStock: 10,
  },
  {
    id: "3",
    product: "iPhone 14 Pro",
    type: "Apple",
    tacloban: 5,
    catbalogan: 3,
    guiuan: 2,
    borongan: 4,
    total: 14,
    status: "healthy",
    minStock: 10,
  },
  {
    id: "4",
    product: "Google Pixel 8 Pro",
    type: "Android",
    tacloban: 3,
    catbalogan: 2,
    guiuan: 1,
    borongan: 2,
    total: 8,
    status: "low",
    minStock: 10,
  },
  {
    id: "5",
    product: "iPhone 13",
    type: "Apple",
    tacloban: 1,
    catbalogan: 1,
    guiuan: 0,
    borongan: 1,
    total: 3,
    status: "critical",
    minStock: 10,
  },
]

export default function InventoryPage() {
  const [selectedBranch, setSelectedBranch] = React.useState("all")

  const totalStock = inventoryData.reduce((sum, item) => sum + item.total, 0)
  const lowStockItems = inventoryData.filter((item) => item.status === "low").length
  const criticalStockItems = inventoryData.filter((item) => item.status === "critical").length
  const healthyStockItems = inventoryData.filter((item) => item.status === "healthy").length

  const getBranchStock = (item: typeof inventoryData[0]) => {
    switch (selectedBranch) {
      case "tacloban":
        return item.tacloban
      case "catbalogan":
        return item.catbalogan
      case "guiuan":
        return item.guiuan
      case "borongan":
        return item.borongan
      default:
        return item.total
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Monitor stock levels across all branches
          </p>
        </div>
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <IconBox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">
              {selectedBranch === "all" ? "All branches" : branches.find(b => b.id === selectedBranch)?.name}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Stock</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyStockItems}</div>
            <p className="text-xs text-muted-foreground">Products above minimum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <IconTrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Need restocking soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
            <IconAlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalStockItems}</div>
            <p className="text-xs text-muted-foreground">Immediate attention needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
          <CardDescription>
            {selectedBranch === "all" 
              ? "Overview of all branches" 
              : `Stock levels at ${branches.find(b => b.id === selectedBranch)?.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                {selectedBranch === "all" ? (
                  <>
                    <TableHead className="text-center">Tacloban</TableHead>
                    <TableHead className="text-center">Catbalogan</TableHead>
                    <TableHead className="text-center">Guiuan E.Samar</TableHead>
                    <TableHead className="text-center">Borongan E.Samar</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </>
                ) : (
                  <TableHead className="text-center">Stock</TableHead>
                )}
                <TableHead>Status</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map((item) => {
                const stockPercentage = (item.total / item.minStock) * 100
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product}</TableCell>
                    <TableCell>
                      <Badge variant={item.type === "Apple" ? "default" : "secondary"}>
                        {item.type}
                      </Badge>
                    </TableCell>
                    {selectedBranch === "all" ? (
                      <>
                        <TableCell className="text-center">{item.tacloban}</TableCell>
                        <TableCell className="text-center">{item.catbalogan}</TableCell>
                        <TableCell className="text-center">{item.guiuan}</TableCell>
                        <TableCell className="text-center">{item.borongan}</TableCell>
                        <TableCell className="text-center font-bold">{item.total}</TableCell>
                      </>
                    ) : (
                      <TableCell className="text-center font-bold">
                        {getBranchStock(item)}
                      </TableCell>
                    )}
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
                        {item.status === "low" && "Low Stock"}
                        {item.status === "critical" && "Critical"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={Math.min(stockPercentage, 100)}
                          className="w-[100px]"
                        />
                        <span className="text-sm text-muted-foreground">
                          {Math.round(stockPercentage)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Restock
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
