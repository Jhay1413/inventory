"use client"

import { useState } from "react"
import { IconPackageImport, IconTruck, IconAlertCircle } from "@tabler/icons-react"
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

export default function IncomingDeliveriesPage() {
  const [branchFilter, setBranchFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Sample incoming deliveries data
  const incomingDeliveries = [
    {
      id: "INC-001",
      trackingNumber: "PH-TRK-20251122-001",
      supplier: "TechWorld Manila",
      destination: "Tacloban",
      products: "iPhone 15 Pro Max (5 units)",
      courier: "LBC Express",
      status: "In Transit",
      estimatedArrival: "Nov 24, 2025",
      orderDate: "Nov 20, 2025",
      value: 375000,
      priority: "High",
    },
    {
      id: "INC-002",
      trackingNumber: "PH-TRK-20251121-003",
      supplier: "Apple Reseller Cebu",
      destination: "Catbalogan",
      products: "iPad Air M2 (3 units)",
      courier: "Ninja Van",
      status: "Delivered",
      estimatedArrival: "Nov 22, 2025",
      orderDate: "Nov 18, 2025",
      value: 119997,
      priority: "Medium",
    },
    {
      id: "INC-003",
      trackingNumber: "PH-TRK-20251120-005",
      supplier: "iStore Davao",
      destination: "Guiuan E.Samar",
      products: "AirPods Pro 2 (10 units)",
      courier: "J&T Express",
      status: "Pending",
      estimatedArrival: "Nov 25, 2025",
      orderDate: "Nov 19, 2025",
      value: 149900,
      priority: "Low",
    },
    {
      id: "INC-004",
      trackingNumber: "PH-TRK-20251122-007",
      supplier: "Samsung Philippines",
      destination: "Borongan E.Samar",
      products: "Galaxy Z Fold 5 (2 units)",
      courier: "LBC Express",
      status: "In Transit",
      estimatedArrival: "Nov 23, 2025",
      orderDate: "Nov 21, 2025",
      value: 179998,
      priority: "High",
    },
    {
      id: "INC-005",
      trackingNumber: "PH-TRK-20251119-008",
      supplier: "Xiaomi Store Manila",
      destination: "Tacloban",
      products: "Redmi Note 13 Pro (8 units)",
      courier: "Ninja Van",
      status: "Delivered",
      estimatedArrival: "Nov 21, 2025",
      orderDate: "Nov 17, 2025",
      value: 143920,
      priority: "Medium",
    },
    {
      id: "INC-006",
      trackingNumber: "PH-TRK-20251122-009",
      supplier: "Dell Philippines",
      destination: "Catbalogan",
      products: "Dell XPS 13 (2 units)",
      courier: "J&T Express",
      status: "Pending",
      estimatedArrival: "Nov 26, 2025",
      orderDate: "Nov 22, 2025",
      value: 139998,
      priority: "Medium",
    },
  ]

  const filteredDeliveries = incomingDeliveries.filter((delivery) => {
    const matchesBranch = branchFilter === "all" || delivery.destination === branchFilter
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter
    return matchesBranch && matchesStatus
  })

  const stats = {
    totalIncoming: incomingDeliveries.length,
    inTransit: incomingDeliveries.filter((d) => d.status === "In Transit").length,
    pending: incomingDeliveries.filter((d) => d.status === "Pending").length,
    totalValue: incomingDeliveries.reduce((sum, d) => sum + d.value, 0),
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incoming Deliveries</h1>
        <p className="text-muted-foreground">
          Track stock deliveries from suppliers to your branches
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incoming</CardTitle>
            <IconPackageImport className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIncoming}</div>
            <p className="text-xs text-muted-foreground">Active incoming deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <IconTruck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Pickup</CardTitle>
            <IconAlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting courier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <IconPackageImport className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Inventory in transit</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Incoming Shipments</CardTitle>
          <CardDescription>
            Monitor stock deliveries from suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Branch</label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="Tacloban">Tacloban</SelectItem>
                  <SelectItem value="Catbalogan">Catbalogan</SelectItem>
                  <SelectItem value="Guiuan E.Samar">Guiuan E.Samar</SelectItem>
                  <SelectItem value="Borongan E.Samar">Borongan E.Samar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground">
                      No incoming deliveries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.id}</TableCell>
                      <TableCell className="font-mono text-xs">{delivery.trackingNumber}</TableCell>
                      <TableCell>{delivery.supplier}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{delivery.destination}</Badge>
                      </TableCell>
                      <TableCell>{delivery.products}</TableCell>
                      <TableCell>{delivery.courier}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            delivery.priority === "High"
                              ? "border-red-600 text-red-600"
                              : delivery.priority === "Medium"
                              ? "border-yellow-600 text-yellow-600"
                              : "border-gray-600 text-gray-600"
                          }
                        >
                          {delivery.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            delivery.status === "Delivered"
                              ? "default"
                              : delivery.status === "In Transit"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            delivery.status === "Delivered"
                              ? "bg-green-600 hover:bg-green-700"
                              : delivery.status === "In Transit"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "border-orange-600 text-orange-600"
                          }
                        >
                          {delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{delivery.orderDate}</TableCell>
                      <TableCell>{delivery.estimatedArrival}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₱{delivery.value.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
