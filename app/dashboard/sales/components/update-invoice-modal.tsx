"use client"

import * as React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { useInvoice, useUpdateInvoice, useInvoiceProductsSearch } from "@/app/queries/invoices.queries"
import { useAccessoryStockForActiveBranch } from "@/app/queries/accessory-stock.queries"
import {
  InvoicePaymentType,
  InvoiceStatus,
  type UpdateInvoiceFormInput,
} from "@/types/api/invoices"
import type { ProductWithRelations } from "@/types/api/products"
import type { AccessoryStockWithRelations } from "@/types/api/accessory-stock"
import { cn } from "@/lib/utils"

const UpdateSaleFormSchema = z.object({
  id: z.string().min(1),
  freebieProductIds: z.array(z.string().min(1)).optional(),
  freebieAccessoryItems: z
    .array(
      z.object({
        accessoryId: z.string().min(1, "Accessory is required"),
        quantity: z.coerce.number().int().positive().max(100000),
      })
    )
    .optional(),
  salePrice: z.coerce.number().int().positive("Sales price is required"),
  paymentType: z.enum([
    InvoicePaymentType.CASH,
    InvoicePaymentType.CREDIT,
    InvoicePaymentType.INSTALLMENT,
    InvoicePaymentType.BANK,
  ] as const),
  status: z.enum([
    InvoiceStatus.PENDING,
    InvoiceStatus.PARTIALLY_PAID,
    InvoiceStatus.PAID,
    InvoiceStatus.CANCELLED,
  ] as const),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
})

type UpdateSaleFormValues = z.infer<typeof UpdateSaleFormSchema>

type SelectedAccessoryFreebie = {
  stock: AccessoryStockWithRelations
  quantity: number
}

function formatProductLabel(p: ProductWithRelations) {
  const type = p.productModel?.productType?.name ?? ""
  const model = p.productModel?.name ?? ""
  return `${type} ${model}`.trim() || p.imei
}

export function UpdateInvoiceModal({ invoiceId }: { invoiceId: string }) {
  const [open, setOpen] = React.useState(false)
  const { data, isLoading, error } = useInvoice(invoiceId, { enabled: open })
  const updateInvoice = useUpdateInvoice()

  const [formError, setFormError] = React.useState<string | null>(null)
  const [freebiesPopoverOpen, setFreebiesPopoverOpen] = React.useState(false)
  const [freebiesSearch, setFreebiesSearch] = React.useState("")
  const [selectedFreebies, setSelectedFreebies] = React.useState<ProductWithRelations[]>([])
  const [selectedAccessoryFreebies, setSelectedAccessoryFreebies] = React.useState<SelectedAccessoryFreebie[]>([])

  const defaults = React.useMemo<UpdateSaleFormValues | undefined>(() => {
    const invoice = data?.invoice
    if (!invoice) return undefined

    const freebieProductIds = invoice.items?.filter(item => item.isFreebie).map(item => item.productId) ?? []
    const freebieAccessoryItems = invoice.accessoryItems?.filter(item => item.isFreebie).map(item => ({
      accessoryId: item.accessoryId,
      quantity: item.quantity
    })) ?? []

    return {
      id: invoice.id,
      freebieProductIds,
      freebieAccessoryItems,
      salePrice: invoice.salePrice,
      paymentType: invoice.paymentType,
      status: invoice.status,
      customerName: invoice.customerName ?? "",
      customerPhone: invoice.customerPhone ?? "",
      notes: invoice.notes ?? "",
    }
  }, [data])

  const form = useForm<UpdateSaleFormValues>({
    resolver: zodResolver(UpdateSaleFormSchema) as unknown as Resolver<UpdateSaleFormValues>,
    defaultValues: {
      id: invoiceId,
      freebieProductIds: [],
      freebieAccessoryItems: [],
      salePrice: 0,
      paymentType: InvoicePaymentType.CASH,
      status: InvoiceStatus.PAID,
      customerName: "",
      customerPhone: "",
      notes: "",
    },
  })

  const selectedFreebieIds = form.watch("freebieProductIds") ?? []
  const selectedFreebieAccessoryItems = form.watch("freebieAccessoryItems") ?? []
  const selectedProductId = data?.invoice?.productId

  const normalizedFreebiesSearch = freebiesSearch.trim() || undefined
  const freebiesQuery = useInvoiceProductsSearch(
    { search: normalizedFreebiesSearch, limit: 10, offset: 0 },
    { enabled: open && Boolean(normalizedFreebiesSearch) }
  )

  const accessoryStocksBranchQuery = useAccessoryStockForActiveBranch({}, { enabled: open })

  React.useEffect(() => {
    if (!defaults) return
    form.reset(defaults)
    
    // Set selected freebies from invoice data
    const invoice = data?.invoice
    if (invoice) {
      const freebieProducts = invoice.items?.filter(item => item.isFreebie).map(item => item.product) ?? []
      setSelectedFreebies(freebieProducts)
      
      const freebieAccessories = invoice.accessoryItems?.filter(item => item.isFreebie).map(item => ({
        stock: {
          id: item.id,
          accessoryId: item.accessoryId,
          branchId: invoice.branchId,
          quantity: item.quantity,
          accessory: item.accessory,
        } as AccessoryStockWithRelations,
        quantity: item.quantity
      })) ?? []
      setSelectedAccessoryFreebies(freebieAccessories)
    }
  }, [defaults, form, data])

  React.useEffect(() => {
    if (!open) {
      setFreebiesSearch("")
      setFreebiesPopoverOpen(false)
      setSelectedFreebies([])
      setSelectedAccessoryFreebies([])
    }
  }, [open])

  function handleFreebiesSearchChange(raw: string) {
    setFreebiesSearch(raw)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setFormError(null)
      }}
    >
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>

      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
          <DialogDescription>Update sale information and status.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load sale"}
          </p>
        ) : data?.invoice ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                setFormError(null)

                const payload: UpdateInvoiceFormInput = {
                  id: values.id,
                  freebieProductIds:
                    values.freebieProductIds?.filter((id) => id && id !== selectedProductId) ?? undefined,
                  freebieAccessoryItems:
                    values.freebieAccessoryItems?.filter((i) => i.accessoryId && i.quantity > 0) ?? undefined,
                  salePrice: values.salePrice,
                  paymentType: values.paymentType,
                  status: values.status,
                  customerName: values.customerName?.trim() || undefined,
                  customerPhone: values.customerPhone?.trim() || undefined,
                  notes: values.notes?.trim() || undefined,
                }

                try {
                  await updateInvoice.mutateAsync(payload)
                  setOpen(false)
                } catch (e) {
                  setFormError(e instanceof Error ? e.message : "Failed to update sale")
                }
              })}
              className="grid gap-4 md:grid-cols-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sale Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <FormLabel>Product (IMEI)</FormLabel>
                    <Button
                      variant="outline"
                      disabled
                      className="justify-between text-muted-foreground cursor-not-allowed"
                    >
                      {data.invoice.product
                        ? `${formatProductLabel(data.invoice.product)} — ${data.invoice.product.imei}`
                        : "No product"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                    <p className="text-xs text-muted-foreground">Product cannot be changed</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sales Price</FormLabel>
                        <FormControl>
                          <Input type="number" inputMode="numeric" placeholder="e.g. 25000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="freebieProductIds"
                    render={() => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Freebies / Accessories (optional)</FormLabel>
                        <FormControl>
                          <Popover open={freebiesPopoverOpen} onOpenChange={setFreebiesPopoverOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" className="justify-between">
                                {selectedFreebies.length || selectedAccessoryFreebies.length
                                  ? `Freebies (${selectedFreebies.length + selectedAccessoryFreebies.length})`
                                  : "Select freebies (optional)"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[420px] p-0" align="start">
                              <Command shouldFilter={false}>
                                <CommandInput
                                  placeholder="Search by IMEI or model"
                                  value={freebiesSearch}
                                  onValueChange={handleFreebiesSearchChange}
                                />
                                <CommandList>
                                  <CommandEmpty>
                                    {freebiesQuery.isLoading
                                      ? "Searching…"
                                      : normalizedFreebiesSearch
                                        ? "No product found"
                                        : "Type to search"}
                                  </CommandEmpty>
                                  <CommandGroup heading="Products">
                                    {(freebiesQuery.data?.products ?? []).map((p) => {
                                      const disabled = p.id === selectedProductId
                                      const checked = selectedFreebieIds.includes(p.id)

                                      return (
                                        <CommandItem
                                          key={p.id}
                                          value={p.imei}
                                          disabled={disabled}
                                          onSelect={() => {
                                            const next = checked
                                              ? selectedFreebieIds.filter((id) => id !== p.id)
                                              : [...selectedFreebieIds, p.id]

                                            form.setValue("freebieProductIds", next, {
                                              shouldDirty: true,
                                              shouldValidate: true,
                                            })

                                            setSelectedFreebies((prev) => {
                                              if (checked) return prev.filter((x) => x.id !== p.id)
                                              return [...prev, p]
                                            })
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              checked ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                              {formatProductLabel(p)}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-mono">{p.imei}</span>
                                          </div>
                                        </CommandItem>
                                      )
                                    })}
                                  </CommandGroup>

                                  <CommandSeparator />

                                  <CommandGroup heading="Accessories">
                                    {(accessoryStocksBranchQuery.data?.stocks ?? [])
                                      .filter((s) => s.quantity > 0)
                                      .filter((s) => {
                                        if (!normalizedFreebiesSearch) return true
                                        return s.accessory.name
                                          .toLowerCase()
                                          .includes(normalizedFreebiesSearch.toLowerCase())
                                      })
                                      .slice(0, 20)
                                      .map((stock) => {
                                        const checked = selectedFreebieAccessoryItems.some(
                                          (x) => x.accessoryId === stock.accessoryId
                                        )

                                        return (
                                          <CommandItem
                                            key={stock.id}
                                            value={stock.accessory.name}
                                            onSelect={() => {
                                              const next = checked
                                                ? selectedFreebieAccessoryItems.filter(
                                                    (x) => x.accessoryId !== stock.accessoryId
                                                  )
                                                : [
                                                    ...selectedFreebieAccessoryItems,
                                                    { accessoryId: stock.accessoryId, quantity: 1 },
                                                  ]

                                              form.setValue("freebieAccessoryItems", next, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              })

                                              setSelectedAccessoryFreebies((prev) => {
                                                if (checked) {
                                                  return prev.filter((x) => x.stock.accessoryId !== stock.accessoryId)
                                                }
                                                return [...prev, { stock, quantity: 1 }]
                                              })
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                checked ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            <div className="flex flex-col">
                                              <span className="text-sm font-medium">{stock.accessory.name}</span>
                                              <span className="text-xs text-muted-foreground">
                                                Available: {stock.quantity}
                                              </span>
                                            </div>
                                          </CommandItem>
                                        )
                                      })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />

                        {selectedFreebies.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedFreebies.map((p) => (
                              <Badge key={p.id} variant="outline" className="flex items-center gap-2">
                                <span className="max-w-[220px] truncate">
                                  {formatProductLabel(p)}
                                </span>
                                <span className="font-mono text-xs text-muted-foreground">{p.imei}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    const next = selectedFreebieIds.filter((id) => id !== p.id)
                                    form.setValue("freebieProductIds", next, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    })
                                    setSelectedFreebies((prev) => prev.filter((x) => x.id !== p.id))
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            No freebies selected.
                          </p>
                        )}

                        {selectedAccessoryFreebies.length ? (
                          <div className="mt-3 space-y-2">
                            {selectedAccessoryFreebies.map(({ stock, quantity }) => (
                              <div key={stock.accessoryId} className="flex items-center gap-2">
                                <Badge variant="outline" className="flex-1 justify-between gap-2">
                                  <span className="max-w-[220px] truncate">{stock.accessory?.name || 'Accessory'}</span>
                                  <span className="text-xs text-muted-foreground">In stock: {stock.quantity}</span>
                                </Badge>
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  className="w-24"
                                  min={1}
                                  max={stock.quantity}
                                  value={quantity}
                                  onChange={(e) => {
                                    const raw = Number(e.target.value)
                                    const nextQty = Math.max(1, Math.min(stock.quantity, Math.trunc(raw || 1)))

                                    setSelectedAccessoryFreebies((prev) =>
                                      prev.map((x) =>
                                        x.stock.accessoryId === stock.accessoryId
                                          ? { ...x, quantity: nextQty }
                                          : x
                                      )
                                    )

                                    const next = (form.getValues("freebieAccessoryItems") ?? []).map((x) =>
                                      x.accessoryId === stock.accessoryId
                                        ? { ...x, quantity: nextQty }
                                        : x
                                    )

                                    form.setValue("freebieAccessoryItems", next, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    })
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const next = selectedFreebieAccessoryItems.filter(
                                      (x) => x.accessoryId !== stock.accessoryId
                                    )
                                    form.setValue("freebieAccessoryItems", next, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    })
                                    setSelectedAccessoryFreebies((prev) =>
                                      prev.filter((x) => x.stock.accessoryId !== stock.accessoryId)
                                    )
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="paymentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Type</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={InvoicePaymentType.CASH}>Cash</SelectItem>
                              <SelectItem value={InvoicePaymentType.CREDIT}>Credit</SelectItem>
                              <SelectItem value={InvoicePaymentType.INSTALLMENT}>Installment</SelectItem>
                              <SelectItem value={InvoicePaymentType.BANK}>Bank</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                              <SelectItem value={InvoiceStatus.PARTIALLY_PAID}>Partially Paid</SelectItem>
                              <SelectItem value={InvoiceStatus.PENDING}>Pending</SelectItem>
                              <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Customer name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Any notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {formError ? (
                    <p className="text-sm text-destructive">{formError}</p>
                  ) : null}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={updateInvoice.isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateInvoice.isPending}>
                      {updateInvoice.isPending ? "Saving…" : "Update Sale"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Selected Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {data?.invoice?.product ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Type</div>
                      <div className="text-right">{data.invoice.product.productModel.productType.name}</div>

                      <div className="text-muted-foreground">Model</div>
                      <div className="text-right">{data.invoice.product.productModel.name}</div>

                      <div className="text-muted-foreground">IMEI</div>
                      <div className="text-right font-mono">{data.invoice.product.imei}</div>

                      <div className="text-muted-foreground">RAM</div>
                      <div className="text-right">{data.invoice.product.ram} GB</div>

                      <div className="text-muted-foreground">Storage</div>
                      <div className="text-right">{data.invoice.product.storage} GB</div>

                      <div className="text-muted-foreground">Color</div>
                      <div className="text-right">{data.invoice.product.color}</div>

                      <div className="text-muted-foreground">Condition</div>
                      <div className="text-right">{data.invoice.product.condition}</div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No product selected</div>
                  )}

                  <div className="pt-2">
                    <div className="text-xs font-medium text-muted-foreground">Freebies</div>
                    {selectedFreebies.length || selectedAccessoryFreebies.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedFreebies.map((p) => (
                          <Badge key={p.id} variant="outline" className="max-w-full">
                            <span className="font-mono text-xs">{p.imei}</span>
                          </Badge>
                        ))}
                        {selectedAccessoryFreebies.map(({ stock, quantity }) => (
                          <Badge key={stock.accessoryId} variant="outline" className="max-w-full">
                            <span className="text-xs">{stock.accessory.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">x{quantity}</span>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-muted-foreground">None</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        ) : (
          <p className="text-sm text-muted-foreground">Sale not found.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
