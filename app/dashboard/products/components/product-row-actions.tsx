"use client"

import * as React from "react"
import Barcode from "react-barcode"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"
import { Barcode as BarcodeIcon, Check, Copy, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProductTypes } from "@/app/queries/product-types.queries"
import { useProductModelsByProductType } from "@/app/queries/product-models.queries"
import { useDeleteProduct, useProduct, useProductAuditLogs, useUpdateProduct } from "@/app/queries/products.queries"
import {
  gadgetFormSchema,
  GadgetAvailability,
  GadgetCondition,
  type GadgetFormValues,
} from "@/types/gadget"
import type { ProductWithRelations } from "@/types/api/products"

function formatAuditAction(action: string) {
  switch (action) {
    case "ProductCreated":
      return "Added"
    case "TransferRequested":
      return "Forwarded"
    case "TransferReceived":
      return "Received"
    case "Sold":
      return "Sold"
    default:
      return action
  }
}

export function ProductRowActions({ product }: { product: ProductWithRelations }) {
  const [viewOpen, setViewOpen] = React.useState(false)
  const [barcodeOpen, setBarcodeOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [copiedInvoiceId, setCopiedInvoiceId] = React.useState<string | null>(null)
  const copiedInvoiceTimeoutRef = React.useRef<number | null>(null)

  const barcodeContainerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    return () => {
      if (copiedInvoiceTimeoutRef.current) {
        window.clearTimeout(copiedInvoiceTimeoutRef.current)
      }
    }
  }, [])

  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()
  const auditLogs = useProductAuditLogs(product.id, { enabled: viewOpen })
  const productDetails = useProduct(product.id, { enabled: viewOpen })

  const productForView = productDetails.data?.product ?? product

  const { data: productTypesData, isLoading: productTypesLoading } = useProductTypes()

  const form = useForm<GadgetFormValues>({
    resolver: zodResolver(gadgetFormSchema) as unknown as Resolver<GadgetFormValues>,
    defaultValues: {
      productTypeId: product.productModel.productTypeId,
      productModelId: product.productModelId,
      color: product.color,
      ram: product.ram,
      storage: product.storage,
      imei: product.imei,
      condition: product.condition as GadgetFormValues["condition"],
      availability: product.availability as GadgetFormValues["availability"],
      isDefective: product.isDefective,
      defectNotes: product.defectNotes ?? "",
      status: product.status,
    },
  })

  const productTypeId = form.watch("productTypeId")
  const isDefective = form.watch("isDefective")
  const { data: productModelsData, isLoading: productModelsLoading } =
    useProductModelsByProductType(productTypeId)

  async function copyImei() {
    try {
      await navigator.clipboard.writeText(product.imei)
      toast.success("Copied")
    } catch {
      toast.error("Failed to copy")
    }
  }

  async function copyInvoiceId(invoiceId: string) {
    try {
      await navigator.clipboard.writeText(invoiceId)
      toast.success("Invoice ID copied")
      setCopiedInvoiceId(invoiceId)

      if (copiedInvoiceTimeoutRef.current) {
        window.clearTimeout(copiedInvoiceTimeoutRef.current)
      }

      copiedInvoiceTimeoutRef.current = window.setTimeout(() => {
        setCopiedInvoiceId(null)
      }, 1500)
    } catch {
      toast.error("Failed to copy")
    }
  }

  function printBarcode() {
    const svg = barcodeContainerRef.current?.querySelector("svg")?.outerHTML
    if (!svg) {
      toast.error("Barcode not ready")
      return
    }

    const title = "Barcode"
    const safeText = product.imei
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 24px; }
      .wrap { display: grid; gap: 12px; justify-items: center; }
      .imei { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; }
      svg { width: 320px; height: auto; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <div class="wrap">
      ${svg}
      <div class="imei">${safeText}</div>
    </div>
  </body>
</html>`

    // Print via an iframe to avoid blank popups / cross-origin issues.
    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    iframe.srcdoc = html
    document.body.appendChild(iframe)

    const cleanup = () => {
      try {
        document.body.removeChild(iframe)
      } catch {
        // ignore
      }
    }

    iframe.onload = () => {
      const win = iframe.contentWindow
      if (!win) {
        toast.error("Print failed")
        cleanup()
        return
      }

      win.focus()
      win.print()
      // Give the print dialog time to open before cleanup.
      window.setTimeout(cleanup, 1000)
    }
  }

  function handleEditOpenChange(nextOpen: boolean) {
    setEditOpen(nextOpen)

    // Reset to the row's current values when opening.
    if (nextOpen) {
      form.reset({
        productTypeId: product.productModel.productTypeId,
        productModelId: product.productModelId,
        color: product.color,
        ram: product.ram,
        storage: product.storage,
        imei: product.imei,
        condition: product.condition as GadgetFormValues["condition"],
        availability: product.availability as GadgetFormValues["availability"],
        isDefective: product.isDefective,
        defectNotes: product.defectNotes ?? "",
        status: product.status,
      })
    }
  }

  async function onSubmit(values: GadgetFormValues) {
    await updateProduct.mutateAsync({
      id: product.id,
      payload: {
        productModelId: values.productModelId,
        color: values.color,
        ram: values.ram,
        storage: values.storage,
        imei: values.imei,
        condition: values.condition,
        availability: values.availability,
        isDefective: values.isDefective,
        defectNotes: values.isDefective ? values.defectNotes : "",
        status: values.status,
      },
    })

    setEditOpen(false)
  }

  async function onConfirmDelete() {
    await deleteProduct.mutateAsync(product.id)
    setDeleteOpen(false)
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Open actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setViewOpen(true)}>
            <Eye />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setBarcodeOpen(true)}>
            <BarcodeIcon />
            Generate Barcode
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>View the details for this product.</DialogDescription>
          </DialogHeader>

          <div className="rounded-md border p-4">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{productForView.productModel.productType.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Model:</span>
                <span className="font-medium">{productForView.productModel.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Color:</span>
                <span className="font-medium">{productForView.color}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">RAM:</span>
                <span className="font-medium">{productForView.ram}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Storage:</span>
                <span className="font-medium">{productForView.storage}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">IMEI:</span>
                <span className="font-mono text-xs">{productForView.imei}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-medium">{productForView.branch?.name ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Condition:</span>
                <span className="font-medium">
                  {productForView.isDefective ? "Defective" : productForView.condition}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Availability:</span>
                <span className="font-medium">{productForView.availability}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Defective:</span>
                <span className="font-medium">{productForView.isDefective ? "Yes" : "No"}</span>
              </div>
              {productForView.isDefective ? (
                <div className="flex items-center gap-2 md:col-span-2">
                  <span className="text-muted-foreground">Defect notes:</span>
                  <span className="font-medium">{productForView.defectNotes || "—"}</span>
                </div>
              ) : null}
              {productForView.availability === "Sold" ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Invoice ID:</span>
                  {productDetails.isLoading ? (
                    <span className="font-mono text-xs">Loading…</span>
                  ) : productForView.soldInvoiceId ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="font-mono text-xs">{productForView.soldInvoiceId}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyInvoiceId(productForView.soldInvoiceId!)}
                        aria-label={
                          copiedInvoiceId === productForView.soldInvoiceId
                            ? "Invoice id copied"
                            : "Copy invoice id"
                        }
                      >
                        {copiedInvoiceId === productForView.soldInvoiceId ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </span>
                  ) : (
                    <span className="font-mono text-xs">—</span>
                  )}
                </div>
              ) : null}
              {productForView.soldAsFreebie ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Sold as freebies:</span>
                  <span className="font-medium">Yes</span>
                </div>
              ) : null}
              <div className="flex items-center gap-2 md:col-span-2">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">{productForView.status}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-medium">Audit Logs</h3>
              {auditLogs.isLoading ? (
                <span className="text-xs text-muted-foreground">Loading…</span>
              ) : null}
            </div>

            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Date</TableHead>
                    <TableHead className="w-[140px]">Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.isError ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-sm text-destructive">
                        Failed to load logs.
                      </TableCell>
                    </TableRow>
                  ) : (auditLogs.data?.logs ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-sm text-muted-foreground">
                        No logs yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (auditLogs.data?.logs ?? []).map((log) => {
                      const date = new Date(log.createdAt)

                      const transferDetails = log.transfer
                        ? `From ${log.transfer.fromBranch.name} → ${log.transfer.toBranch.name}${log.transfer.reason ? ` • ${log.transfer.reason}` : ""}`
                        : null

                      const invoiceDetails = log.invoice
                        ? `₦${log.invoice.salePrice.toLocaleString()} • ${log.invoice.paymentType}${log.invoice.customerName ? ` • ${log.invoice.customerName}` : ""}`
                        : null

                      const detailsText = invoiceDetails ?? transferDetails ?? "—"

                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {Number.isNaN(date.getTime()) ? log.createdAt : date.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{formatAuditAction(log.action)}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="leading-tight">
                              <div className="font-medium">{log.actorUser.name}</div>
                              <div className="text-xs text-muted-foreground">{log.actorUser.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{detailsText}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Barcode */}
      <Dialog open={barcodeOpen} onOpenChange={setBarcodeOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Barcode</DialogTitle>
            <DialogDescription>
              Scan will return the IMEI/Serial.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="rounded-md border p-4 grid gap-3 justify-items-center">
              <div ref={barcodeContainerRef}>
                <Barcode
                  value={product.imei}
                  format="CODE128"
                  displayValue={false}
                  margin={0}
                  height={64}
                  renderer="svg"
                />
              </div>
              <div className="font-mono text-xs">{product.imei}</div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={copyImei}>
                Copy
              </Button>
              <Button onClick={printBarcode}>Print</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update this product in your inventory.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Product Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="productTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            form.setValue("productModelId", "", {
                              shouldDirty: true,
                              shouldValidate: false,
                            })
                            form.clearErrors("productModelId")
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={productTypesLoading ? "Loading..." : "Select product type"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(productTypesData?.productTypes ?? []).map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productModelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Model</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange} disabled={!productTypeId}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  !productTypeId
                                    ? "Select product type first"
                                    : productModelsLoading
                                      ? "Loading..."
                                      : "Select product model"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(productModelsData ?? []).map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Natural Titanium" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RAM</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 8" type="number" inputMode="numeric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="storage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 128" type="number" inputMode="numeric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="imei"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMEI / Serial</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter IMEI / Serial" maxLength={15} inputMode="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Condition & Status</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={GadgetCondition.BRAND_NEW}>Brand New</SelectItem>
                            <SelectItem value={GadgetCondition.SECOND_HAND}>Second Hand</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={GadgetAvailability.AVAILABLE}>Available</SelectItem>
                            <SelectItem value={GadgetAvailability.SOLD}>Sold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isDefective"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-2 rounded-md border p-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            const next = checked === true
                            field.onChange(next)
                            if (!next) {
                              form.setValue("defectNotes", "", {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                              form.clearErrors("defectNotes")
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Defective</FormLabel>
                        <FormDescription>
                          Mark this unit as defective (not in sellable condition).
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {isDefective ? (
                  <FormField
                    control={form.control}
                    name="defectNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Defect Notes</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. No network, cracked screen, battery drains fast"
                            maxLength={200}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Perfect condition, Minor scratches on back" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProduct.isPending}>
                  {updateProduct.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently remove the product with IMEI {product.imei}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
