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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTransfers } from "@/app/queries/transfers.queries"
import { useAccessoryTransfers } from "@/app/queries/accessory-transfers.queries"
import { TransferStatus } from "@/types/api/transfers"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

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
  const [selectedTransfer, setSelectedTransfer] = React.useState<typeof allTransfers[0] | null>(null)
  const [selectedAccessoryTransfer, setSelectedAccessoryTransfer] = React.useState<typeof allAccessoryTransfers[0] | null>(null)

  const { data, isLoading, error } = useTransfers({
    direction: "all",
    limit: 100,
    offset: 0,
  })

  const {
    data: accessoryData,
    isLoading: accessoryLoading,
    error: accessoryError,
  } = useAccessoryTransfers(
    {
      direction: "all",
      limit: 100,
      offset: 0,
    },
    { enabled: true }
  )

  const allTransfers = data?.transfers ?? []
  const allAccessoryTransfers = accessoryData?.transfers ?? []

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

  const visibleAccessoryTransfers = React.useMemo(() => {
    const normalized = search.trim().toLowerCase()

    if (!normalized) return allAccessoryTransfers

    return allAccessoryTransfers.filter((t) => {
      return (
        t.id.toLowerCase().includes(normalized) ||
        t.accessory.name.toLowerCase().includes(normalized) ||
        t.fromBranch.name.toLowerCase().includes(normalized) ||
        t.toBranch.name.toLowerCase().includes(normalized)
      )
    })
  }, [allAccessoryTransfers, search])

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
            View gadget and accessory transfer history
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
          <Tabs defaultValue="gadgets" className="w-full">
            <TabsList>
              <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
              <TabsTrigger value="accessories">Accessories</TabsTrigger>
            </TabsList>

            <TabsContent value="gadgets" className="mt-4">
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedTransfer(t)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && !error && visibleTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No gadget transfers found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {error ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-destructive">
                        Failed to load gadget transfer history.
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
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>Date Requested</TableHead>
                    <TableHead>Accessory</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleAccessoryTransfers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono font-semibold">{t.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconCalendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{t.accessory.name}</TableCell>
                      <TableCell className="text-center">{t.quantity.toLocaleString()}</TableCell>
                      <TableCell>{t.fromBranch.name}</TableCell>
                      <TableCell>{t.toBranch.name}</TableCell>
                      <TableCell>{new Date(t.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="default" className={statusClass(t.status)}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedAccessoryTransfer(t)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!accessoryLoading && !accessoryError && visibleAccessoryTransfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        No accessory transfers found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {accessoryError ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-destructive">
                        Failed to load accessory transfer history.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
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
                      <Badge variant="default" className={statusClass(selectedTransfer.status)}>
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
                    {selectedTransfer.receivedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received:</span>
                        <span className="font-medium">{new Date(selectedTransfer.receivedAt).toLocaleString()}</span>
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
        <DialogContent className="max-w-4xl">
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
                      <Badge variant="default" className={statusClass(selectedAccessoryTransfer.status)}>
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
                    {selectedAccessoryTransfer.receivedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received:</span>
                        <span className="font-medium">{new Date(selectedAccessoryTransfer.receivedAt).toLocaleString()}</span>
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
