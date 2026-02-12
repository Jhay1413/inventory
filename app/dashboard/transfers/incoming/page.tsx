"use client"

import * as React from "react"
import Link from "next/link"
import { IconPlus, IconSearch, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useReceiveTransfer, useTransfers } from "@/app/queries/transfers.queries"
import { useAccessoryTransfers, useReceiveAccessoryTransfer } from "@/app/queries/accessory-transfers.queries"
import { TransferStatus } from "@/types/api/transfers"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { formatLocalDate, formatLocalDateTime } from "@/lib/utils"

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
  const PER_PAGE = 25

  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [gadgetsPage, setGadgetsPage] = React.useState(1)
  const [accessoriesPage, setAccessoriesPage] = React.useState(1)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setGadgetsPage(1)
      setAccessoriesPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, error } = useTransfers({
    direction: "incoming",
    statusNot: TransferStatus.COMPLETED,
    search: debouncedSearch || undefined,
    limit: PER_PAGE,
    offset: (gadgetsPage - 1) * PER_PAGE,
  })

  const {
    data: accessoryData,
    isLoading: accessoryLoading,
    error: accessoryError,
  } = useAccessoryTransfers(
    {
      direction: "incoming",
      statusNot: TransferStatus.COMPLETED,
      search: debouncedSearch || undefined,
      limit: PER_PAGE,
      offset: (accessoriesPage - 1) * PER_PAGE,
    },
    { enabled: true }
  )

  const receiveTransfer = useReceiveTransfer()
  const [receivingId, setReceivingId] = React.useState<string | null>(null)

  const receiveAccessoryTransfer = useReceiveAccessoryTransfer()
  const [receivingAccessoryId, setReceivingAccessoryId] = React.useState<string | null>(null)

  const transfers = data?.transfers ?? []
  const accessoryTransfers = accessoryData?.transfers ?? []

  const [selectedTransfer, setSelectedTransfer] = React.useState<typeof transfers[0] | null>(null)
  const [selectedAccessoryTransfer, setSelectedAccessoryTransfer] = React.useState<typeof accessoryTransfers[0] | null>(null)

  const gadgetsTotal = data?.pagination.total ?? 0
  const gadgetsPageCount = Math.max(1, Math.ceil(gadgetsTotal / PER_PAGE))

  const accessoriesTotal = accessoryData?.pagination.total ?? 0
  const accessoriesPageCount = Math.max(1, Math.ceil(accessoriesTotal / PER_PAGE))

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
            Manage incoming gadget and accessory transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by IMEI, Product, or Accessory..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Tabs defaultValue="gadgets" className="w-full">
            <TabsList>
              <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
              <TabsTrigger value="accessories">Accessories</TabsTrigger>
            </TabsList>

            <TabsContent value="gadgets" className="mt-4">
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
                      <TableCell>{formatLocalDate(t.createdAt)}</TableCell>
                      <TableCell className="font-medium">
                        {t.product.productModel.productType.name} {t.product.productModel.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{t.product.imei}</TableCell>
                      <TableCell>{t.fromBranch.name}</TableCell>
                      <TableCell>
                        <Badge variant="default" className={statusBadgeClass(t.status)}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{t.requestedBy.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTransfer(t)}
                          >
                            View Details
                          </Button>
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
                            {receiveTransfer.isPending && receivingId === t.id
                              ? "Receiving…"
                              : "Received"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && !error && transfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No incoming gadget transfers.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-destructive">
                        Failed to load incoming gadget transfers.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {gadgetsPage} of {gadgetsPageCount}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGadgetsPage((p) => Math.max(1, p - 1))}
                    disabled={gadgetsPage <= 1 || isLoading}
                  >
                    <span className="sr-only">Previous page</span>
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGadgetsPage((p) => Math.min(gadgetsPageCount, p + 1))}
                    disabled={gadgetsPage >= gadgetsPageCount || isLoading}
                  >
                    <span className="sr-only">Next page</span>
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="accessories" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Accessory</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Requested By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessoryTransfers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{t.accessory.name}</TableCell>
                      <TableCell className="text-center">{t.quantity.toLocaleString()}</TableCell>
                      <TableCell>{t.fromBranch.name}</TableCell>
                      <TableCell>
                        <Badge variant="default" className={statusBadgeClass(t.status)}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{t.requestedBy.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAccessoryTransfer(t)}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setReceivingAccessoryId(t.id)
                              receiveAccessoryTransfer.mutate(t.id, {
                                onSettled: () => setReceivingAccessoryId(null),
                              })
                            }}
                            disabled={
                              receiveAccessoryTransfer.isPending ||
                              t.status === TransferStatus.COMPLETED ||
                              t.status === TransferStatus.CANCELLED ||
                              t.status === TransferStatus.REJECTED
                            }
                          >
                            {receiveAccessoryTransfer.isPending && receivingAccessoryId === t.id
                              ? "Receiving…"
                              : "Received"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!accessoryLoading && !accessoryError && accessoryTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No incoming accessory transfers.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {accessoryError ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-destructive">
                        Failed to load incoming accessory transfers.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {accessoriesPage} of {accessoriesPageCount}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAccessoriesPage((p) => Math.max(1, p - 1))}
                    disabled={accessoriesPage <= 1 || accessoryLoading}
                  >
                    <span className="sr-only">Previous page</span>
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAccessoriesPage((p) => Math.min(accessoriesPageCount, p + 1))}
                    disabled={accessoriesPage >= accessoriesPageCount || accessoryLoading}
                  >
                    <span className="sr-only">Next page</span>
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Gadget Transfer Details Modal */}
      <Dialog open={!!selectedTransfer} onOpenChange={(open) => !open && setSelectedTransfer(null)}>
        <DialogContent className="lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
            <DialogDescription>
              Transfer ID: {selectedTransfer?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{selectedTransfer.product.productModel.productType.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-medium">{selectedTransfer.product.productModel.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IMEI:</span>
                      <span className="font-medium font-mono">{selectedTransfer.product.imei}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condition:</span>
                      <span className="font-medium">{selectedTransfer.product.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color:</span>
                      <span className="font-medium">{selectedTransfer.product.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RAM:</span>
                      <span className="font-medium">{selectedTransfer.product.ram} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage:</span>
                      <span className="font-medium">{selectedTransfer.product.storage} GB</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Transfer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From Branch:</span>
                      <span className="font-medium">{selectedTransfer.fromBranch.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To Branch:</span>
                      <span className="font-medium">{selectedTransfer.toBranch.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="default" className={statusBadgeClass(selectedTransfer.status)}>
                        {selectedTransfer.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requested:</span>
                      <span className="font-medium">{new Date(selectedTransfer.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">{new Date(selectedTransfer.updatedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requested By:</span>
                      <span className="font-medium">{selectedTransfer.requestedBy.name || selectedTransfer.requestedBy.email}</span>
                    </div>
                    {selectedTransfer.receivedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received:</span>
                        <span className="font-medium">{new Date(selectedTransfer.receivedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedTransfer.receivedBy && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received By:</span>
                        <span className="font-medium">{selectedTransfer.receivedBy.name || selectedTransfer.receivedBy.email}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {(selectedTransfer.reason || selectedTransfer.notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedTransfer.reason && (
                      <div>
                        <span className="text-muted-foreground">Reason:</span>
                        <p className="mt-1">{selectedTransfer.reason}</p>
                      </div>
                    )}
                    {selectedTransfer.notes && (
                      <div>
                        <span className="text-muted-foreground">Notes:</span>
                        <p className="mt-1">{selectedTransfer.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Accessory Transfer Details Modal */}
      <Dialog open={!!selectedAccessoryTransfer} onOpenChange={(open) => !open && setSelectedAccessoryTransfer(null)}>
        <DialogContent className="lg:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Accessory Transfer Details</DialogTitle>
            <DialogDescription>
              Transfer ID: {selectedAccessoryTransfer?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedAccessoryTransfer && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Accessory Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedAccessoryTransfer.accessory.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">{selectedAccessoryTransfer.quantity.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Transfer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From Branch:</span>
                      <span className="font-medium">{selectedAccessoryTransfer.fromBranch.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To Branch:</span>
                      <span className="font-medium">{selectedAccessoryTransfer.toBranch.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="default" className={statusBadgeClass(selectedAccessoryTransfer.status)}>
                        {selectedAccessoryTransfer.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requested:</span>
                      <span className="font-medium">{new Date(selectedAccessoryTransfer.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">{new Date(selectedAccessoryTransfer.updatedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requested By:</span>
                      <span className="font-medium">{selectedAccessoryTransfer.requestedBy.name || selectedAccessoryTransfer.requestedBy.email}</span>
                    </div>
                    {selectedAccessoryTransfer.receivedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received:</span>
                        <span className="font-medium">{new Date(selectedAccessoryTransfer.receivedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {selectedAccessoryTransfer.receivedBy && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received By:</span>
                        <span className="font-medium">{selectedAccessoryTransfer.receivedBy.name || selectedAccessoryTransfer.receivedBy.email}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {(selectedAccessoryTransfer.reason || selectedAccessoryTransfer.notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedAccessoryTransfer.reason && (
                      <div>
                        <span className="text-muted-foreground">Reason:</span>
                        <p className="mt-1">{selectedAccessoryTransfer.reason}</p>
                      </div>
                    )}
                    {selectedAccessoryTransfer.notes && (
                      <div>
                        <span className="text-muted-foreground">Notes:</span>
                        <p className="mt-1">{selectedAccessoryTransfer.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
