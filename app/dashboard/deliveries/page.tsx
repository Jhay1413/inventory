"use client"

import { useState } from "react"
import { IconTruck, IconPackage, IconClock, IconCircleCheck } from "@tabler/icons-react"
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

export default function DeliveriesPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Sample delivery data
  const deliveriesData = [
    {
      id: "DEL-001",
      type: "Incoming",
      trackingNumber: "PH-TRK-20251122-001",
      from: "Supplier - Manila",
      to: "Tacloban",
      products: "iPhone 15 Pro Max (5 units)",
      courier: "LBC Express",
      status: "In Transit",
      estimatedArrival: "Nov 24, 2025",
      value: 375000,
    },
    {
      id: "DEL-002",
      type: "Outgoing",
      trackingNumber: "PH-TRK-20251122-002",
      from: "Tacloban",
      to: "Customer - Palo, Leyte",
      products: "Samsung Galaxy S24 Ultra",
      courier: "J&T Express",
      status: "Delivered",
      estimatedArrival: "Nov 22, 2025",
      value: 74999,
    },
    {
      id: "DEL-003",
      type: "Incoming",
      trackingNumber: "PH-TRK-20251121-003",
      from: "Supplier - Cebu",
      to: "Catbalogan",
      products: "iPad Air M2 (3 units)",
      courier: "Ninja Van",
      status: "Delivered",
      estimatedArrival: "Nov 22, 2025",
      value: 119997,
    },
    {
      id: "DEL-004",
      type: "Outgoing",
      trackingNumber: "PH-TRK-20251122-004",
      from: "Borongan E.Samar",
      to: "Customer - Oras, E.Samar",
      products: "MacBook Air M3",
      courier: "LBC Express",
      status: "In Transit",
      estimatedArrival: "Nov 23, 2025",
      value: 69999,
    },
    {
      id: "DEL-005",
      type: "Incoming",
      trackingNumber: "PH-TRK-20251120-005",
      from: "Supplier - Davao",
      to: "Guiuan E.Samar",
      products: "AirPods Pro 2 (10 units)",
      courier: "J&T Express",
      status: "Pending",
      estimatedArrival: "Nov 25, 2025",
      value: 149900,
    },
    {
      id: "DEL-006",
      type: "Outgoing",
      trackingNumber: "PH-TRK-20251122-006",
      from: "Catbalogan",
      to: "Customer - Calbayog City",
      products: "Apple Watch Series 9",
      courier: "Ninja Van",
      status: "In Transit",
      estimatedArrival: "Nov 23, 2025",
      value: 24999,
    },
  ]

  const filteredDeliveries = deliveriesData.filter((delivery) => {
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter
    const matchesType = typeFilter === "all" || delivery.type === typeFilter
    return matchesStatus && matchesType
  })

  const stats = {
    totalDeliveries: deliveriesData.length,
    inTransit: deliveriesData.filter((d) => d.status === "In Transit").length,
    pending: deliveriesData.filter((d) => d.status === "Pending").length,
    delivered: deliveriesData.filter((d) => d.status === "Delivered").length,
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
        <p className="text-muted-foreground">
          Track all incoming and outgoing deliveries across all branches
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <IconTruck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">Active deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <IconPackage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting pickup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Deliveries</CardTitle>
          <CardDescription>
            Monitor and track all deliveries for your gadget stores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Incoming">Incoming</SelectItem>
                  <SelectItem value="Outgoing">Outgoing</SelectItem>
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
                  <TableHead>Delivery ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                      No deliveries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.id}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            delivery.type === "Incoming"
                              ? "border-green-600 text-green-600"
                              : "border-blue-600 text-blue-600"
                          }
                        >
                          {delivery.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{delivery.trackingNumber}</TableCell>
                      <TableCell>{delivery.from}</TableCell>
                      <TableCell>{delivery.to}</TableCell>
                      <TableCell>{delivery.products}</TableCell>
                      <TableCell>{delivery.courier}</TableCell>
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
