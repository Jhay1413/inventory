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
import { useAccessoryTransfers } from "@/app/queries/accessory-transfers.queries"
import { TransferStatus } from "@/types/api/transfers"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default function PendingTransfersPage() {
  const { data, isLoading, error } = useTransfers({
    direction: "outgoing",
    status: TransferStatus.PENDING,
    limit: 50,
    offset: 0,
  })

  const {
    data: accessoryData,
    isLoading: accessoryLoading,
    error: accessoryError,
  } = useAccessoryTransfers(
    {
      direction: "outgoing",
      status: TransferStatus.PENDING,
      limit: 50,
      offset: 0,
    },
    { enabled: true }
  )

  const transfers = data?.transfers ?? []
  const accessoryTransfers = accessoryData?.transfers ?? []

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
            Pending outgoing gadget and accessory transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gadgets" className="w-full">
            <TabsList>
              <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
              <TabsTrigger value="accessories">Accessories</TabsTrigger>
            </TabsList>

            <TabsContent value="gadgets" className="mt-4">
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
                  {!isLoading && !error && transfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No pending gadget transfers.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-destructive">
                        Failed to load pending gadget transfers.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="accessories" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Accessory</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Requested By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessoryTransfers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{t.accessory.name}</TableCell>
                      <TableCell className="text-center">{t.quantity.toLocaleString()}</TableCell>
                      <TableCell>{t.fromBranch.name}</TableCell>
                      <TableCell>{t.toBranch.name}</TableCell>
                      <TableCell>{t.requestedBy.name}</TableCell>
                    </TableRow>
                  ))}
                  {!accessoryLoading && !accessoryError && accessoryTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No pending accessory transfers.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {accessoryError ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-destructive">
                        Failed to load pending accessory transfers.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
