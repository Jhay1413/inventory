"use client"

import * as React from "react"
import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTransfers } from "@/app/queries/transfers.queries"
import { TransferStatus } from "@/types/api/transfers"

export default function PendingTransfersPage() {
  const { data, isLoading, error } = useTransfers({
    direction: "outgoing",
    status: TransferStatus.PENDING,
    limit: 50,
    offset: 0,
  })

  const transfers = data?.transfers ?? []

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Transfers</h1>
          <p className="text-muted-foreground">
            Transfers you requested awaiting approval
          </p>
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
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading…"
              : error
                ? "Failed to load pending transfers"
                : `${transfers.length} pending transfer(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Requested By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">
                    {t.product.productModel.productType.name} {t.product.productModel.name}
                  </TableCell>
                  <TableCell>{t.fromBranch.name}</TableCell>
                  <TableCell>{t.toBranch.name}</TableCell>
                  <TableCell>{t.requestedBy.name}</TableCell>
                </TableRow>
              ))}
              {!isLoading && transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No pending transfers.
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
