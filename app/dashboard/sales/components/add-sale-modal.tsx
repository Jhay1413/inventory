"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
import { z } from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronsUpDown } from "lucide-react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import {
  CreateInvoiceSchema,
  InvoicePaymentType,
  InvoiceStatus,
} from "@/types/api/invoices"
import type { ProductWithRelations } from "@/types/api/products"
import { cn } from "@/lib/utils"
import { useCreateInvoice, useInvoiceProductsSearch } from "@/app/queries/invoices.queries"

const saleFormSchema = CreateInvoiceSchema.extend({
  status: z
    .enum([
      InvoiceStatus.PENDING,
      InvoiceStatus.PARTIALLY_PAID,
      InvoiceStatus.PAID,
      InvoiceStatus.CANCELLED,
    ] as const)
    .default(InvoiceStatus.PAID),
})

type SaleFormValues = z.infer<typeof saleFormSchema>

function formatProductLabel(p: ProductWithRelations) {
  const type = p.productModel?.productType?.name ?? ""
  const model = p.productModel?.name ?? ""
  return `${type} ${model}`.trim() || p.imei
}

export function AddSaleModal() {
  const [open, setOpen] = React.useState(false)
  const [productPopoverOpen, setProductPopoverOpen] = React.useState(false)
  const [productSearch, setProductSearch] = React.useState("")
  const [selectedProduct, setSelectedProduct] = React.useState<ProductWithRelations | null>(null)

  const [freebiesPopoverOpen, setFreebiesPopoverOpen] = React.useState(false)
  const [freebiesSearch, setFreebiesSearch] = React.useState("")
  const [selectedFreebies, setSelectedFreebies] = React.useState<ProductWithRelations[]>([])

  const createInvoice = useCreateInvoice()

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema) as unknown as Resolver<SaleFormValues>,
    defaultValues: {
      productId: "",
      freebieProductIds: [],
      salePrice: 0,
      paymentType: InvoicePaymentType.CASH,
      status: InvoiceStatus.PAID,
      customerName: "",
      customerPhone: "",
      notes: "",
    },
    mode: "onChange",
  })

  const selectedProductId = form.watch("productId")
  const selectedFreebieIds = form.watch("freebieProductIds") ?? []

  const normalizedSearch = productSearch.trim() || undefined
  const productsQuery = useInvoiceProductsSearch(
    { search: normalizedSearch, limit: 10, offset: 0 },
    { enabled: open && Boolean(normalizedSearch) }
  )

  const normalizedFreebiesSearch = freebiesSearch.trim() || undefined
  const freebiesQuery = useInvoiceProductsSearch(
    { search: normalizedFreebiesSearch, limit: 10, offset: 0 },
    { enabled: open && Boolean(normalizedFreebiesSearch) }
  )

  const products = productsQuery.data?.products ?? []
  React.useEffect(() => {
    if (!selectedProductId) {
      setSelectedProduct(null)
    }
  }, [selectedProductId])

  React.useEffect(() => {
    // Keep selected freebies in sync with ids in the form
    if (!selectedFreebieIds.length) {
      setSelectedFreebies([])
    }
  }, [selectedFreebieIds.length])

  React.useEffect(() => {
    if (open) return
    form.reset()
    setProductSearch("")
    setProductPopoverOpen(false)
    setSelectedProduct(null)

    setFreebiesSearch("")
    setFreebiesPopoverOpen(false)
    setSelectedFreebies([])
  }, [open, form])

  function handleImeiSearchChange(raw: string) {
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 15)
    setProductSearch(digitsOnly)
  }

  function handleFreebiesSearchChange(raw: string) {
    // Allow broader search (model name etc). Keep it simple.
    setFreebiesSearch(raw)
  }

  async function onSubmit(values: SaleFormValues) {
    await createInvoice.mutateAsync({
      productId: values.productId,
      freebieProductIds:
        values.freebieProductIds?.filter((id) => id && id !== values.productId) ?? undefined,
      salePrice: values.salePrice,
      paymentType: values.paymentType,
      status: values.status,
      customerName: values.customerName?.trim() ? values.customerName.trim() : undefined,
      customerPhone: values.customerPhone?.trim() ? values.customerPhone.trim() : undefined,
      notes: values.notes?.trim() ? values.notes.trim() : undefined,
    })

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          New Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>New Sale</DialogTitle>
          <DialogDescription>Search product by IMEI and save the sale.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sale Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Product (IMEI)</FormLabel>
                      <FormControl>
                        <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? selectedProduct
                                  ? `${formatProductLabel(selectedProduct)} — ${selectedProduct.imei}`
                                  : "Selected"
                                : "Search by IMEI"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[420px] p-0" align="start">
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="Type IMEI"
                                value={productSearch}
                                onValueChange={handleImeiSearchChange}
                                inputMode="numeric"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {productsQuery.isLoading
                                    ? "Searching…"
                                    : normalizedSearch
                                      ? "No product found"
                                      : "Type IMEI to search"}
                                </CommandEmpty>
                                <CommandGroup>
                                  {products.map((p) => (
                                    <CommandItem
                                      key={p.id}
                                      value={p.imei}
                                      onSelect={() => {
                                        form.setValue("productId", p.id, {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        })
                                        setSelectedProduct(p)
                                        setProductPopoverOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          p.id === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium">{formatProductLabel(p)}</span>
                                        <span className="text-xs text-muted-foreground font-mono">{p.imei}</span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                              {selectedFreebies.length
                                ? `Freebies (${selectedFreebies.length})`
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
                                <CommandGroup>
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

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createInvoice.isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!form.formState.isValid || createInvoice.isPending}>
                    {createInvoice.isPending ? "Saving…" : "Save Sale"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Selected Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {selectedProduct ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-muted-foreground">Type</div>
                    <div className="text-right">{selectedProduct.productModel.productType.name}</div>

                    <div className="text-muted-foreground">Model</div>
                    <div className="text-right">{selectedProduct.productModel.name}</div>

                    <div className="text-muted-foreground">IMEI</div>
                    <div className="text-right font-mono">{selectedProduct.imei}</div>

                    <div className="text-muted-foreground">RAM</div>
                    <div className="text-right">{selectedProduct.ram} GB</div>

                    <div className="text-muted-foreground">Storage</div>
                    <div className="text-right">{selectedProduct.storage} GB</div>

                    <div className="text-muted-foreground">Color</div>
                    <div className="text-right">{selectedProduct.color}</div>

                    <div className="text-muted-foreground">Condition</div>
                    <div className="text-right">{selectedProduct.condition}</div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No product selected</div>
                )}

                <div className="pt-2">
                  <div className="text-xs font-medium text-muted-foreground">Freebies</div>
                  {selectedFreebies.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedFreebies.map((p) => (
                        <Badge key={p.id} variant="outline" className="max-w-full">
                          <span className="font-mono text-xs">{p.imei}</span>
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
      </DialogContent>
    </Dialog>
  )
}
