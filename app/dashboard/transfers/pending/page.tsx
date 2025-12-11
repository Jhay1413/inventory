"use client"

import * as React from "react"
import { IconClock, IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
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

const pendingTransfers = [
  {
    id: "TRF-002",
    date: "2025-11-22",
    product: "Samsung Galaxy S24 Ultra",
    quantity: 2,
    from: "Catbalogan",
    to: "Guiuan E.Samar",
    requestedBy: "Mike Davis",
  },
  {
    id: "TRF-007",
    date: "2025-11-22",
    product: "iPhone 15",
    quantity: 3,
    from: "Tacloban",
    to: "Catbalogan",
    requestedBy: "Sarah Johnson",
  },
]

export default function PendingTransfersPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Transfers</h1>
          <p className="text-muted-foreground">
            Transfers awaiting approval
          </p>
        </div>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          New Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>{pendingTransfers.length} pending transfer(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-mono font-semibold">{transfer.id}</TableCell>
                  <TableCell>{new Date(transfer.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{transfer.product}</TableCell>
                  <TableCell>{transfer.quantity}</TableCell>
                  <TableCell>{transfer.from}</TableCell>
                  <TableCell>{transfer.to}</TableCell>
                  <TableCell>{transfer.requestedBy}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="default">Approve</Button>
                    <Button size="sm" variant="destructive">Reject</Button>
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
