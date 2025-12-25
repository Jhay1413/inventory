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
import { useTransfers } from "@/app/queries/transfers.queries"
import { TransferStatus } from "@/types/api/transfers"

function statusClass(status: string) {
  switch (status) {
    case TransferStatus.PENDING:
      return "bg-yellow-600 hover:bg-yellow-700"
    case TransferStatus.APPROVED:
      return "bg-blue-600 hover:bg-blue-700"
    case TransferStatus.COMPLETED:
      return "bg-green-600 hover:bg-green-700"
    case TransferStatus.CANCELLED:
      return "bg-red-600 hover:bg-red-700"
    case TransferStatus.REJECTED:
      return "bg-red-600 hover:bg-red-700"
    default:
      return ""
  }
}

export default function TransferHistoryPage() {
  const [search, setSearch] = React.useState("")

  const { data, isLoading, error } = useTransfers({
    direction: "all",
    limit: 100,
    offset: 0,
  })

  const allTransfers = data?.transfers ?? []

  const visibleTransfers = React.useMemo(() => {
    const normalized = search.trim().toLowerCase()

    if (!normalized) return allTransfers

    return allTransfers.filter((t) => {
      const productName = `${t.product.productModel.productType.name} ${t.product.productModel.name}`
      return (
        t.id.toLowerCase().includes(normalized) ||
        t.product.imei.toLowerCase().includes(normalized) ||
        productName.toLowerCase().includes(normalized)
      )
    })
  }, [allTransfers, search])

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transfer History</h1>
          <p className="text-muted-foreground">
            View all transfers (incoming and outgoing)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Transfers</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading…"
              : error
                ? "Failed to load transfer history"
                : `${visibleTransfers.length} transfer(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Transfer ID, IMEI, or Product..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer ID</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTransfers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono font-semibold">{t.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {t.product.productModel.productType.name} {t.product.productModel.name}
                  </TableCell>
                  <TableCell>{t.fromBranch.name}</TableCell>
                  <TableCell>{t.toBranch.name}</TableCell>
                  <TableCell>{new Date(t.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="default" className={statusClass(t.status)}>
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && visibleTransfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No transfers found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
