"use client"

import * as React from "react"
import { IconCalendar, IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
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
import { Button } from "@/components/ui/button"

const transferHistory = [
  {
    id: "TRF-003",
    date: "2025-11-21",
    product: "Google Pixel 8 Pro",
    quantity: 1,
    from: "Guiuan E.Samar",
    to: "Borongan E.Samar",
    status: "Completed",
    completedDate: "2025-11-22",
  },
  {
    id: "TRF-005",
    date: "2025-11-20",
    product: "OnePlus 12",
    quantity: 2,
    from: "Borongan E.Samar",
    to: "Tacloban",
    status: "Completed",
    completedDate: "2025-11-21",
  },
  {
    id: "TRF-006",
    date: "2025-11-20",
    product: "iPhone 13",
    quantity: 5,
    from: "Catbalogan",
    to: "Guiuan E.Samar",
    status: "Cancelled",
    completedDate: "2025-11-20",
  },
]

export default function TransferHistoryPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transfer History</h1>
          <p className="text-muted-foreground">
            View all completed and cancelled transfers
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Transfers</CardTitle>
          <CardDescription>{transferHistory.length} historical transfer(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by Transfer ID or Product..." className="pl-8" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer ID</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Completed Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transferHistory.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-mono font-semibold">{transfer.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(transfer.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{transfer.product}</TableCell>
                  <TableCell>{transfer.quantity}</TableCell>
                  <TableCell>{transfer.from}</TableCell>
                  <TableCell>{transfer.to}</TableCell>
                  <TableCell>{new Date(transfer.completedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className={
                        transfer.status === "Completed"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }
                    >
                      {transfer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View Details</Button>
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
