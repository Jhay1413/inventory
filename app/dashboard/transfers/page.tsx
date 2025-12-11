"use client"

import * as React from "react"
import { IconArrowRight, IconBuildingStore, IconCalendar, IconClock, IconPlus, IconTruck } from "@tabler/icons-react"
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

// Mock transfer data
const transfersData = [
  {
    id: "TRF-001",
    date: "2025-11-22",
    product: "iPhone 15 Pro Max",
    imei: "352468091234567",
    quantity: 3,
    fromBranch: "Tacloban",
    toBranch: "Catbalogan",
    status: "In Transit",
    requestedBy: "Maria Santos",
    estimatedArrival: "2025-11-23",
  },
  {
    id: "TRF-002",
    date: "2025-11-22",
    product: "Samsung Galaxy S24 Ultra",
    imei: "359876543210987",
    quantity: 2,
    fromBranch: "Catbalogan",
    toBranch: "Guiuan E.Samar",
    status: "Pending",
    requestedBy: "Pedro Reyes",
    estimatedArrival: "2025-11-24",
  },
  {
    id: "TRF-003",
    date: "2025-11-21",
    product: "Google Pixel 8 Pro",
    imei: "356789012345678",
    quantity: 1,
    fromBranch: "Guiuan E.Samar",
    toBranch: "Borongan E.Samar",
    status: "Completed",
    requestedBy: "Ana Garcia",
    estimatedArrival: "2025-11-22",
  },
  {
    id: "TRF-004",
    date: "2025-11-21",
    product: "iPhone 14 Pro",
    imei: "351234567890123",
    quantity: 4,
    fromBranch: "Tacloban",
    toBranch: "Borongan E.Samar",
    status: "In Transit",
    requestedBy: "Ana Garcia",
    estimatedArrival: "2025-11-22",
  },
  {
    id: "TRF-005",
    date: "2025-11-20",
    product: "OnePlus 12",
    imei: "357890123456789",
    quantity: 2,
    fromBranch: "Borongan E.Samar",
    toBranch: "Tacloban",
    status: "Completed",
    requestedBy: "Juan Dela Cruz",
    estimatedArrival: "2025-11-21",
  },
  {
    id: "TRF-006",
    date: "2025-11-20",
    product: "iPhone 13",
    imei: "358901234567890",
    quantity: 5,
    fromBranch: "Catbalogan",
    toBranch: "Guiuan E.Samar",
    status: "Cancelled",
    requestedBy: "Pedro Reyes",
    estimatedArrival: "-",
  },
]

export default function TransfersPage() {
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [branchFilter, setBranchFilter] = React.useState("all")

  const filteredTransfers = transfersData.filter((transfer) => {
    const matchesStatus = statusFilter === "all" || transfer.status === statusFilter
    const matchesBranch = 
      branchFilter === "all" || 
      transfer.fromBranch === branchFilter || 
      transfer.toBranch === branchFilter
    
    return matchesStatus && matchesBranch
  })

  const totalTransfers = transfersData.length
  const pendingTransfers = transfersData.filter(t => t.status === "Pending").length
  const inTransitTransfers = transfersData.filter(t => t.status === "In Transit").length
  const completedTransfers = transfersData.filter(t => t.status === "Completed").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-600 hover:bg-green-700"
      case "In Transit":
        return "bg-blue-600 hover:bg-blue-700"
      case "Pending":
        return "bg-yellow-600 hover:bg-yellow-700"
      case "Cancelled":
        return "bg-red-600 hover:bg-red-700"
      default:
        return ""
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>
          <p className="text-muted-foreground">
            Manage gadget transfers between branches
          </p>
        </div>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          New Transfer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
            <IconTruck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransfers}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <IconClock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingTransfers}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <IconTruck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inTransitTransfers}</div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <IconTruck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTransfers}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter transfers by status and branch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Branch" />
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
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Requests</CardTitle>
          <CardDescription>
            {filteredTransfers.length} transfer(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Est. Arrival</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-mono font-semibold">{transfer.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(transfer.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transfer.product}</p>
                      <p className="text-xs text-muted-foreground font-mono">{transfer.imei}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">{transfer.quantity}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <IconBuildingStore className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{transfer.fromBranch}</span>
                      </div>
                      <IconArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-1">
                        <IconBuildingStore className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{transfer.toBranch}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{transfer.requestedBy}</TableCell>
                  <TableCell>
                    {transfer.estimatedArrival !== "-" ? (
                      <div className="flex items-center gap-2">
                        <IconClock className="h-4 w-4 text-muted-foreground" />
                        {new Date(transfer.estimatedArrival).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={getStatusColor(transfer.status)}
                    >
                      {transfer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
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
