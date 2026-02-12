"use client"

import { useMemo, useState } from "react"
import { IconCalendar } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useInvoice } from "@/app/queries/invoices.queries"
import { CreateReturnModal } from "@/app/dashboard/sales/components/create-return-modal"
import { formatLocalDateTime } from "@/lib/utils"

function formatMoney(value: number) {
  return value.toLocaleString()
}

export function ViewInvoiceModal({ invoiceId }: { invoiceId: string }) {
  const [open, setOpen] = useState(false)
  const { data, isLoading, error } = useInvoice(invoiceId, { enabled: open })

  const invoice = data?.invoice

  const items = useMemo(() => {
    if (!invoice) return []
    return (invoice.items ?? []).slice().sort((a, b) => {
      if (a.isFreebie === b.isFreebie) return 0
      return a.isFreebie ? 1 : -1
    })
  }, [invoice])

  const exchangedItems = useMemo(
    () => items.filter((i) => i.isFreebie && i.product?.status === "Exchanged"),
    [items]
  )

  const normalFreebies = useMemo(
    () => items.filter((i) => i.isFreebie && i.product?.status !== "Exchanged"),
    [items]
  )

  const freebies = useMemo(() => items.filter((i) => i.isFreebie), [items])
  const accessoryItems = invoice?.accessoryItems ?? []
  const accessoryFreebiesCount = accessoryItems.reduce(
    (sum, it) => sum + (it.isFreebie ? it.quantity : 0),
    0
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        View
      </Button>

      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>Sale details</DialogTitle>
            {invoice ? <CreateReturnModal invoice={invoice} /> : null}
          </div>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load sale"}
          </p>
        ) : !invoice ? (
          <p className="text-sm text-muted-foreground">Sale not found.</p>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Sold date</p>
                <div className="mt-1 flex items-center gap-2">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {formatLocalDateTime(invoice.createdAt)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Branch</p>
                <div className="mt-1">
                  <Badge variant="outline">{invoice.branch.name}</Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-1">
                  <Badge
                    variant={
                      invoice.status === "Paid"
                        ? "default"
                        : invoice.status === "Cancelled"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {invoice.status === "PartiallyPaid" ? "Partially Paid" : invoice.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Sales price</p>
                <p className="mt-1 text-sm font-medium">{formatMoney(invoice.salePrice)}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Payment type</p>
                <div className="mt-1">
                  <Badge variant="outline">{invoice.paymentType}</Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Created by</p>
                <p className="mt-1 text-sm font-medium">{invoice.createdBy.name}</p>
                <p className="text-xs text-muted-foreground">{invoice.createdBy.email}</p>
              </div>

              <div className="md:col-span-3">
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="mt-1 text-sm">
                  {invoice.customerName?.trim() || "—"}
                  {invoice.customerPhone?.trim() ? ` • ${invoice.customerPhone}` : ""}
                </p>
              </div>

              {invoice.notes?.trim() ? (
                <div className="md:col-span-3">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm">{invoice.notes}</p>
                </div>
              ) : null}
            </div>

            {/* Main product */}
            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Sold unit</p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.product.productModel.productType.name} • {invoice.product.productModel.name}
                  </p>
                </div>
                <Badge variant={invoice.product.condition === "BrandNew" ? "default" : "outline"}>
                  {invoice.product.condition === "BrandNew" ? "Brand New" : "Second Hand"}
                </Badge>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">IMEI</p>
                  <p className="text-sm font-mono">{invoice.product.imei}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Color</p>
                  <p className="text-sm">{invoice.product.color}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RAM</p>
                  <p className="text-sm">{invoice.product.ram} GB</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Storage</p>
                  <p className="text-sm">{invoice.product.storage} GB</p>
                </div>
              </div>

              {exchangedItems.length ? (
                <div className="mt-4 rounded-md border bg-muted/30 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">Exchanged replacement</p>
                    <Badge variant="secondary">Exchange</Badge>
                  </div>
                  <div className="space-y-1">
                    {exchangedItems.map((it) => (
                      <div key={it.id} className="flex items-center justify-between gap-3">
                        <div className="text-sm">
                          {it.product.productModel.name}
                        </div>
                        <div className="font-mono text-sm">{it.product.imei}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Items (main + freebies) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Invoice items</p>
                <p className="text-xs text-muted-foreground">
                  {freebies.length || accessoryFreebiesCount
                    ? `${exchangedItems.length} exchange unit(s) • ${normalFreebies.length} freebie product(s) • ${accessoryFreebiesCount} accessory item(s)`
                    : "No freebies"}
                </p>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>IMEI</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No items
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((it) => (
                        <TableRow key={it.id}>
                          <TableCell>
                            {it.isFreebie ? (
                              it.product?.status === "Exchanged" ? (
                                <Badge variant="secondary">Exchange</Badge>
                              ) : (
                                <Badge variant="outline">Freebie</Badge>
                              )
                            ) : (
                              <Badge>Main</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{it.product.productModel.productType.name}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{it.product.productModel.name}</TableCell>
                          <TableCell className="font-mono text-sm">{it.product.imei}</TableCell>
                          <TableCell>
                            <Badge
                              variant={it.product.condition === "BrandNew" ? "default" : "outline"}
                            >
                              {it.product.condition === "BrandNew" ? "Brand New" : "Second Hand"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatMoney(it.unitPrice)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Accessory freebies */}
            {accessoryItems.length ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Accessory freebies</p>
                  <p className="text-xs text-muted-foreground">
                    {accessoryItems.length} item(s)
                  </p>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Accessory</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessoryItems.map((it) => (
                        <TableRow key={it.id}>
                          <TableCell className="font-medium">
                            {it.accessory.name}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {it.quantity.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
