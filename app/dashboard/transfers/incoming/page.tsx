"use client"

import * as React from "react"
import Link from "next/link"
import { IconArrowRight, IconPlus } from "@tabler/icons-react"
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
import { useReceiveTransfer, useTransfers } from "@/app/queries/transfers.queries"
import { TransferStatus } from "@/types/api/transfers"

function statusBadgeClass(status: string) {
  switch (status) {
    case TransferStatus.PENDING:
      return "bg-yellow-600 hover:bg-yellow-700"
    case TransferStatus.APPROVED:
      return "bg-blue-600 hover:bg-blue-700"
    case TransferStatus.COMPLETED:
      return "bg-green-600 hover:bg-green-700"
    case TransferStatus.REJECTED:
      return "bg-red-600 hover:bg-red-700"
    case TransferStatus.CANCELLED:
      return "bg-red-600 hover:bg-red-700"
    default:
      return ""
  }
}

export default function IncomingTransfersPage() {
  const { data, isLoading, error } = useTransfers({
    direction: "incoming",
    limit: 50,
    offset: 0,
  })

  const receiveTransfer = useReceiveTransfer()
  const [receivingId, setReceivingId] = React.useState<string | null>(null)

  const transfers = data?.transfers ?? []

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incoming Transfers</h1>
          <p className="text-muted-foreground">Items transferred to your current branch</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/transfers/new">
            <IconPlus className="mr-2 h-4 w-4" />
            New Transfer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incoming</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading…"
              : error
                ? "Failed to load incoming transfers"
                : `${transfers.length} transfer(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Requested By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">
                    {t.product.productModel.productType.name} {t.product.productModel.name}
                  </TableCell>
                  <TableCell className="font-mono">{t.product.imei}</TableCell>
                  <TableCell>{t.fromBranch.name}</TableCell>
                  <TableCell>
                    <Badge variant="default" className={statusBadgeClass(t.status)}>
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{t.requestedBy.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => {
                        setReceivingId(t.id)
                        receiveTransfer.mutate(t.id, {
                          onSettled: () => setReceivingId(null),
                        })
                      }}
                      disabled={
                        receiveTransfer.isPending ||
                        t.status === TransferStatus.COMPLETED ||
                        t.status === TransferStatus.CANCELLED ||
                        t.status === TransferStatus.REJECTED
                      }
                    >
                      {receiveTransfer.isPending && receivingId === t.id ? "Receiving…" : "Received"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No incoming transfers.
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
