"use client"

import { useState } from "react"
import { IconPackageExport, IconUser, IconMapPin } from "@tabler/icons-react"
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

export default function OutgoingDeliveriesPage() {
  const [branchFilter, setBranchFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Sample outgoing deliveries data
  const outgoingDeliveries = [
    {
      id: "OUT-001",
      trackingNumber: "PH-TRK-20251122-002",
      branch: "Tacloban",
      customer: "Juan Dela Cruz",
      address: "123 Real St, Palo, Leyte",
      products: "Samsung Galaxy S24 Ultra",
      courier: "J&T Express",
      status: "Delivered",
      shippedDate: "Nov 21, 2025",
      deliveryDate: "Nov 22, 2025",
      value: 74999,
      paymentType: "COD",
    },
    {
      id: "OUT-002",
      trackingNumber: "PH-TRK-20251122-004",
      branch: "Borongan E.Samar",
      customer: "Maria Santos",
      address: "456 Main Ave, Oras, E.Samar",
      products: "MacBook Air M3",
      courier: "LBC Express",
      status: "In Transit",
      shippedDate: "Nov 22, 2025",
      deliveryDate: "Nov 23, 2025",
      value: 69999,
      paymentType: "Paid",
    },
    {
      id: "OUT-003",
      trackingNumber: "PH-TRK-20251122-006",
      branch: "Catbalogan",
      customer: "Pedro Reyes",
      address: "789 Center Rd, Calbayog City",
      products: "Apple Watch Series 9",
      courier: "Ninja Van",
      status: "In Transit",
      shippedDate: "Nov 22, 2025",
      deliveryDate: "Nov 23, 2025",
      value: 24999,
      paymentType: "Paid",
    },
    {
      id: "OUT-004",
      trackingNumber: "PH-TRK-20251122-010",
      branch: "Tacloban",
      customer: "Ana Garcia",
      address: "321 Plaza St, Tacloban City",
      products: "iPhone 14 Pro",
      courier: "J&T Express",
      status: "Pending",
      shippedDate: "-",
      deliveryDate: "Nov 24, 2025",
      value: 59999,
      paymentType: "COD",
    },
    {
      id: "OUT-005",
      trackingNumber: "PH-TRK-20251121-011",
      branch: "Guiuan E.Samar",
      customer: "Roberto Tan",
      address: "654 Beach Rd, Guiuan, E.Samar",
      products: "iPad Pro 11-inch M4",
      courier: "LBC Express",
      status: "Delivered",
      shippedDate: "Nov 20, 2025",
      deliveryDate: "Nov 21, 2025",
      value: 54999,
      paymentType: "Paid",
    },
    {
      id: "OUT-006",
      trackingNumber: "PH-TRK-20251122-012",
      branch: "Catbalogan",
      customer: "Lisa Mendoza",
      address: "987 Highway St, Catbalogan City",
      products: "Samsung Galaxy Buds 2 Pro",
      courier: "Ninja Van",
      status: "In Transit",
      shippedDate: "Nov 22, 2025",
      deliveryDate: "Nov 23, 2025",
      value: 9999,
      paymentType: "COD",
    },
  ]

  const filteredDeliveries = outgoingDeliveries.filter((delivery) => {
    const matchesBranch = branchFilter === "all" || delivery.branch === branchFilter
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter
    return matchesBranch && matchesStatus
  })

  const stats = {
    totalOutgoing: outgoingDeliveries.length,
    inTransit: outgoingDeliveries.filter((d) => d.status === "In Transit").length,
    pending: outgoingDeliveries.filter((d) => d.status === "Pending").length,
    delivered: outgoingDeliveries.filter((d) => d.status === "Delivered").length,
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outgoing Deliveries</h1>
        <p className="text-muted-foreground">
          Track customer orders being delivered from your branches
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outgoing</CardTitle>
            <IconPackageExport className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOutgoing}</div>
            <p className="text-xs text-muted-foreground">Customer deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <IconMapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">En route to customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <IconPackageExport className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Ready to ship</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <IconUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Completed deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Outgoing Shipments</CardTitle>
          <CardDescription>
            Monitor customer orders being delivered
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
                  <TableHead>Branch</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shipped</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center text-muted-foreground">
                      No outgoing deliveries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.id}</TableCell>
                      <TableCell className="font-mono text-xs">{delivery.trackingNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{delivery.branch}</Badge>
                      </TableCell>
                      <TableCell>{delivery.customer}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{delivery.address}</TableCell>
                      <TableCell>{delivery.products}</TableCell>
                      <TableCell>{delivery.courier}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            delivery.paymentType === "COD"
                              ? "border-orange-600 text-orange-600"
                              : "border-green-600 text-green-600"
                          }
                        >
                          {delivery.paymentType}
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
                      <TableCell>{delivery.shippedDate}</TableCell>
                      <TableCell>{delivery.deliveryDate}</TableCell>
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
