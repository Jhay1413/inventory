"use client"

import * as React from "react"
import { IconPackage, IconPlus, IconTruck } from "@tabler/icons-react"
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

const restockOrders = [
  {
    id: "RO-001",
    orderDate: "2025-11-22",
    product: "iPhone 15 Pro Max",
    type: "Apple",
    quantity: 20,
    supplier: "Apple Inc.",
    destinationBranch: "Main Branch",
    status: "Pending",
    estimatedDelivery: "2025-11-28",
    totalCost: 23980,
  },
  {
    id: "RO-002",
    orderDate: "2025-11-21",
    product: "Samsung Galaxy S24 Ultra",
    type: "Android",
    quantity: 15,
    supplier: "Samsung Electronics",
    destinationBranch: "Downtown",
    status: "In Transit",
    estimatedDelivery: "2025-11-25",
    totalCost: 16485,
  },
  {
    id: "RO-003",
    orderDate: "2025-11-20",
    product: "Google Pixel 8 Pro",
    type: "Android",
    quantity: 10,
    supplier: "Google LLC",
    destinationBranch: "All Branches",
    status: "Delivered",
    estimatedDelivery: "2025-11-22",
    totalCost: 8990,
  },
  {
    id: "RO-004",
    orderDate: "2025-11-19",
    product: "iPhone 13",
    type: "Apple",
    quantity: 25,
    supplier: "Apple Inc.",
    destinationBranch: "Westside",
    status: "In Transit",
    estimatedDelivery: "2025-11-24",
    totalCost: 12475,
  },
]

export default function RestockOrdersPage() {
  const [statusFilter, setStatusFilter] = React.useState("all")

  const filteredOrders = restockOrders.filter((order) => {
    return statusFilter === "all" || order.status === statusFilter
  })

  const pendingOrders = restockOrders.filter(o => o.status === "Pending").length
  const inTransitOrders = restockOrders.filter(o => o.status === "In Transit").length
  const deliveredOrders = restockOrders.filter(o => o.status === "Delivered").length
  const totalCost = restockOrders.reduce((sum, o) => sum + o.totalCost, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-600 hover:bg-green-700"
      case "In Transit":
        return "bg-blue-600 hover:bg-blue-700"
      case "Pending":
        return "bg-yellow-600 hover:bg-yellow-700"
      default:
        return ""
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restock Orders</h1>
          <p className="text-muted-foreground">
            Manage purchase orders from suppliers
          </p>
        </div>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <IconPackage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restockOrders.length}</div>
            <p className="text-xs text-muted-foreground">All orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <IconPackage className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <IconTruck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inTransitOrders}</div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <IconPackage className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All orders value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>Track restock orders from suppliers</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Est. Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-semibold">{order.id}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{order.product}</TableCell>
                  <TableCell>
                    <Badge variant={order.type === "Apple" ? "default" : "secondary"}>
                      {order.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-semibold">{order.quantity}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{order.destinationBranch}</TableCell>
                  <TableCell>{new Date(order.estimatedDelivery).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="default" className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₱{order.totalCost.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
