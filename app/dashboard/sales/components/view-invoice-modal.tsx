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

  const freebies = useMemo(() => items.filter((i) => i.isFreebie), [items])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        View
      </Button>

      <DialogContent className="min-w-5xl max-w-6xl max-h-[85vh] ">
        <DialogHeader>
          <DialogTitle>Sale details</DialogTitle>
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
                    {new Date(invoice.createdAt).toLocaleString()}
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
                  <p className="text-sm font-semibold">Main product</p>
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
            </div>

            {/* Items (main + freebies) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Invoice items</p>
                <p className="text-xs text-muted-foreground">
                  {freebies.length ? `${freebies.length} freebie(s)` : "No freebies"}
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
                              <Badge variant="outline">Freebie</Badge>
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
