"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { IconDeviceMobile, IconSearch } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { authClient } from "@/app/lib/auth-client"
import { useCreateTransfer, useTransferProductsSearch } from "@/app/queries/transfers.queries"
import { useCreateAccessoryTransfer } from "@/app/queries/accessory-transfers.queries"
import { useAccessoryStockList } from "@/app/queries/accessory-stock.queries"
import {
  type ProductWithRelations,
} from "@/types/api/products"
import type { AccessoryStockWithRelations } from "@/types/api/accessory-stock"

function formatProductLabel(p: ProductWithRelations) {
  const typeName = p.productModel?.productType?.name ?? ""
  const modelName = p.productModel?.name ?? ""
  const left = [typeName, modelName].filter(Boolean).join(" · ")
  return left ? `${left} (${p.imei})` : p.imei
}

const transferFormSchema = z.object({
  productId: z.string().min(1, "Select an IMEI"),
  toBranchId: z.string().min(1, "Destination branch is required"),
  reason: z.string().trim().min(1, "Reason is required"),
  notes: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
})

type TransferFormValues = z.infer<typeof transferFormSchema>

const accessoryTransferFormSchema = z.object({
  accessoryId: z.string().min(1, "Select an accessory"),
  quantity: z.coerce.number().int().positive().max(100000),
  toBranchId: z.string().min(1, "Destination branch is required"),
  reason: z.string().trim().min(1, "Reason is required"),
  notes: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
})

type AccessoryTransferFormValues = z.infer<typeof accessoryTransferFormSchema>

function formatAccessoryLabel(stock: AccessoryStockWithRelations) {
  return `${stock.accessory.name} (Available: ${stock.quantity})`
}

export default function NewTransferPage() {
  const router = useRouter()
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: organizations, isPending: orgsLoading } = authClient.useListOrganizations()

  const [imeiPickerOpen, setImeiPickerOpen] = React.useState(false)
  const [imeiSearch, setImeiSearch] = React.useState("")
  const [debouncedImeiSearch, setDebouncedImeiSearch] = React.useState("")
  const [selectedProduct, setSelectedProduct] = React.useState<ProductWithRelations | null>(null)

  const [accessoryPickerOpen, setAccessoryPickerOpen] = React.useState(false)
  const [accessorySearch, setAccessorySearch] = React.useState("")
  const [selectedAccessoryStock, setSelectedAccessoryStock] = React.useState<AccessoryStockWithRelations | null>(null)

  const createTransfer = useCreateTransfer()
  const createAccessoryTransfer = useCreateAccessoryTransfer()

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema) as unknown as Resolver<TransferFormValues>,
    mode: "onChange",
    defaultValues: {
      productId: "",
      toBranchId: "",
      reason: "",
      notes: "",
    },
  })

  const accessoryForm = useForm<AccessoryTransferFormValues>({
    resolver: zodResolver(accessoryTransferFormSchema) as unknown as Resolver<AccessoryTransferFormValues>,
    mode: "onChange",
    defaultValues: {
      accessoryId: "",
      quantity: 1,
      toBranchId: "",
      reason: "",
      notes: "",
    },
  })

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedImeiSearch(imeiSearch.trim()), 250)
    return () => window.clearTimeout(t)
  }, [imeiSearch])

  const fromBranchId = activeOrganization?.id
  const fromBranchName = activeOrganization?.name ?? ""
  const toBranchId = form.watch("toBranchId")
  const toBranchName = organizations?.find((o) => o.id === toBranchId)?.name ?? ""
  const accessoryToBranchId = accessoryForm.watch("toBranchId")
  const accessoryToBranchName = organizations?.find((o) => o.id === accessoryToBranchId)?.name ?? ""

  React.useEffect(() => {
    setSelectedProduct(null)
    setImeiSearch("")
    setDebouncedImeiSearch("")
    form.setValue("productId", "", { shouldDirty: true, shouldValidate: true })
  }, [fromBranchId, form])

  const { data: productsData, isLoading: productsLoading } = useTransferProductsSearch(
    {
      limit: 10,
      offset: 0,
      search: debouncedImeiSearch || undefined,
    },
    {
      enabled: Boolean(fromBranchId && debouncedImeiSearch),
    }
  )

  const imeiResults = productsData?.products ?? []
  const toBranchOptions = React.useMemo(() => {
    return (organizations ?? []).filter((o) => o.id !== fromBranchId)
  }, [fromBranchId, organizations])

  const accessoryStocksQuery = useAccessoryStockList({}, { enabled: Boolean(fromBranchId) })
  const accessoryStocks = accessoryStocksQuery.data?.stocks ?? []
  const filteredAccessoryStocks = React.useMemo(() => {
    const normalized = accessorySearch.trim().toLowerCase()
    return accessoryStocks
      .filter((s) => s.quantity > 0)
      .filter((s) => {
        if (!normalized) return true
        return s.accessory.name.toLowerCase().includes(normalized)
      })
      .slice(0, 25)
  }, [accessorySearch, accessoryStocks])

  const onSubmit = async (values: TransferFormValues) => {
    try {
      await createTransfer.mutateAsync({
        productId: values.productId,
        toBranchId: values.toBranchId,
        reason: values.reason,
        notes: values.notes,
      })

      form.reset()
      router.replace("/dashboard/transfers")
      router.refresh()
    } catch {
      // handled by mutation
    }
  }

  const onSubmitAccessory = async (values: AccessoryTransferFormValues) => {
    try {
      await createAccessoryTransfer.mutateAsync({
        accessoryId: values.accessoryId,
        toBranchId: values.toBranchId,
        quantity: values.quantity,
        reason: values.reason,
        notes: values.notes,
      })

      accessoryForm.reset()
      setAccessorySearch("")
      setSelectedAccessoryStock(null)
      setAccessoryPickerOpen(false)
      router.replace("/dashboard/transfers")
      router.refresh()
    } catch {
      // handled by mutation
    }
  }

  const handleCancel = () => {
    router.replace("/dashboard/transfers")
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Transfer Request</h1>
        <p className="text-muted-foreground">
          Create a new transfer request between branches
        </p>
      </div>
      <Tabs defaultValue="gadget" className="w-full">
        <TabsList>
          <TabsTrigger value="gadget">Gadget</TabsTrigger>
          <TabsTrigger value="accessory">Accessory</TabsTrigger>
        </TabsList>

        <TabsContent value="gadget" className="mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-6 md:grid-cols-2"
            >
            <Card>
              <CardHeader>
                <CardTitle>Transfer Details</CardTitle>
                <CardDescription>Enter the transfer information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>IMEI</FormLabel>
                      <FormControl>
                        <Popover open={imeiPickerOpen} onOpenChange={setImeiPickerOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-between"
                              disabled={!fromBranchId}
                            >
                              <span className="truncate">
                                {selectedProduct?.id === field.value
                                  ? formatProductLabel(selectedProduct)
                                  : field.value
                                    ? "Selected IMEI"
                                    : "Search IMEI"}
                              </span>
                              <IconSearch className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[--radix-popover-trigger-width] p-0"
                            align="start"
                          >
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="Type IMEI"
                                value={imeiSearch}
                                onValueChange={setImeiSearch}
                              />
                              <CommandList>
                                {productsLoading ? (
                                  <CommandEmpty>Searching…</CommandEmpty>
                                ) : debouncedImeiSearch ? (
                                  <CommandEmpty>No matching IMEI found.</CommandEmpty>
                                ) : (
                                  <CommandEmpty>Type an IMEI to search.</CommandEmpty>
                                )}
                                <CommandGroup>
                                  {imeiResults.map((p) => (
                                    <CommandItem
                                      key={p.id}
                                      value={p.id}
                                      onSelect={() => {
                                        setSelectedProduct(p)
                                        field.onChange(p.id)
                                        form.clearErrors("productId")
                                        setImeiPickerOpen(false)
                                      }}
                                    >
                                      <div className="flex w-full items-center justify-between gap-2">
                                        <span className="truncate">{formatProductLabel(p)}</span>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                          {p.condition}
                                        </span>
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

                <div className="space-y-2">
                  <FormLabel htmlFor="from">From Branch</FormLabel>
                  <Input id="from" value={fromBranchName} placeholder="Current branch" disabled />
                </div>

                <FormField
                  control={form.control}
                  name="toBranchId"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel htmlFor="to">To Branch</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="to">
                            <SelectValue placeholder="Select destination branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {orgsLoading ? (
                              <SelectItem value="__loading" disabled>
                                Loading…
                              </SelectItem>
                            ) : toBranchOptions.length === 0 ? (
                              <SelectItem value="__none" disabled>
                                No other branches
                              </SelectItem>
                            ) : (
                              toBranchOptions.map((org) => (
                                <SelectItem key={org.id} value={org.id}>
                                  {org.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel htmlFor="reason">Transfer Reason</FormLabel>
                      <FormControl>
                        <Input id="reason" placeholder="Why is this transfer needed?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel htmlFor="notes">Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input id="notes" placeholder="Any additional information" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transfer Summary</CardTitle>
                <CardDescription>Review before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <IconDeviceMobile className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Product:</span>
                    <span className="text-muted-foreground truncate">
                      {selectedProduct ? formatProductLabel(selectedProduct) : "Not selected"}
                    </span>
                  </div>
                  {selectedProduct ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Type</div>
                      <div className="text-right">
                        {selectedProduct.productModel?.productType?.name ?? "—"}
                      </div>

                      <div className="text-muted-foreground">Model</div>
                      <div className="text-right">{selectedProduct.productModel?.name ?? "—"}</div>

                      <div className="text-muted-foreground">IMEI</div>
                      <div className="text-right">{selectedProduct.imei}</div>

                      <div className="text-muted-foreground">Condition</div>
                      <div className="text-right">{selectedProduct.condition}</div>

                      <div className="text-muted-foreground">Availability</div>
                      <div className="text-right">{selectedProduct.availability}</div>

                      <div className="text-muted-foreground">Status</div>
                      <div className="text-right">{selectedProduct.status}</div>

                      <div className="text-muted-foreground">Color</div>
                      <div className="text-right">{selectedProduct.color}</div>

                      <div className="text-muted-foreground">RAM</div>
                      <div className="text-right">{selectedProduct.ram} GB</div>

                      <div className="text-muted-foreground">Storage</div>
                      <div className="text-right">{selectedProduct.storage} GB</div>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">From:</span>
                    <span className="text-muted-foreground">{fromBranchName || "Not selected"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">To:</span>
                    <span className="text-muted-foreground">{toBranchName || "Not selected"}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <h4 className="font-semibold">Important Notes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Transfer requests require manager approval</li>
                    <li>Estimated delivery time: 1-2 business days</li>
                    <li>Ensure product availability at source branch</li>
                    <li>Destination branch will be notified upon approval</li>
                  </ul>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    className="w-full"
                    size="lg"
                    type="submit"
                    disabled={!form.formState.isValid || createTransfer.isPending}
                  >
                    {createTransfer.isPending ? "Submitting…" : "Submit Transfer Request"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    onClick={handleCancel}
                    disabled={createTransfer.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="accessory" className="mt-4">
          <Form {...accessoryForm}>
            <form
              onSubmit={accessoryForm.handleSubmit(onSubmitAccessory)}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Accessory Transfer Details</CardTitle>
                  <CardDescription>Transfer accessory quantity between branches</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={accessoryForm.control}
                    name="accessoryId"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Accessory</FormLabel>
                        <FormControl>
                          <Popover open={accessoryPickerOpen} onOpenChange={setAccessoryPickerOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-between"
                                disabled={!fromBranchId}
                              >
                                <span className="truncate">
                                  {selectedAccessoryStock?.accessoryId === field.value
                                    ? formatAccessoryLabel(selectedAccessoryStock)
                                    : field.value
                                      ? "Selected accessory"
                                      : "Search accessory"}
                                </span>
                                <IconSearch className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[--radix-popover-trigger-width] p-0"
                              align="start"
                            >
                              <Command shouldFilter={false}>
                                <CommandInput
                                  placeholder="Type accessory name"
                                  value={accessorySearch}
                                  onValueChange={setAccessorySearch}
                                />
                                <CommandList>
                                  {accessoryStocksQuery.isLoading ? (
                                    <CommandEmpty>Loading…</CommandEmpty>
                                  ) : filteredAccessoryStocks.length === 0 ? (
                                    <CommandEmpty>
                                      {accessorySearch.trim()
                                        ? "No matching accessories."
                                        : "No accessories in stock."}
                                    </CommandEmpty>
                                  ) : null}
                                  <CommandGroup>
                                    {filteredAccessoryStocks.map((stock) => (
                                      <CommandItem
                                        key={stock.id}
                                        value={stock.accessory.name}
                                        onSelect={() => {
                                          setSelectedAccessoryStock(stock)
                                          field.onChange(stock.accessoryId)
                                          accessoryForm.clearErrors("accessoryId")
                                          const qty = accessoryForm.getValues("quantity")
                                          if (qty > stock.quantity) {
                                            accessoryForm.setValue("quantity", stock.quantity, {
                                              shouldDirty: true,
                                              shouldValidate: true,
                                            })
                                          }
                                          setAccessoryPickerOpen(false)
                                        }}
                                      >
                                        <div className="flex w-full items-center justify-between gap-2">
                                          <span className="truncate">{stock.accessory.name}</span>
                                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            Available: {stock.quantity}
                                          </span>
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
                    control={accessoryForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={selectedAccessoryStock?.quantity ?? undefined}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel htmlFor="fromAccessory">From Branch</FormLabel>
                    <Input id="fromAccessory" value={fromBranchName} placeholder="Current branch" disabled />
                  </div>

                  <FormField
                    control={accessoryForm.control}
                    name="toBranchId"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel htmlFor="toAccessory">To Branch</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="toAccessory">
                              <SelectValue placeholder="Select destination branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {orgsLoading ? (
                                <SelectItem value="__loading" disabled>
                                  Loading…
                                </SelectItem>
                              ) : toBranchOptions.length === 0 ? (
                                <SelectItem value="__none" disabled>
                                  No other branches
                                </SelectItem>
                              ) : (
                                toBranchOptions.map((org) => (
                                  <SelectItem key={org.id} value={org.id}>
                                    {org.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={accessoryForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Transfer Reason</FormLabel>
                        <FormControl>
                          <Input placeholder="Why is this transfer needed?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={accessoryForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Any additional information" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transfer Summary</CardTitle>
                  <CardDescription>Review before submitting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Accessory</span>
                      <span className="text-sm font-semibold">
                        {selectedAccessoryStock?.accessory.name ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quantity</span>
                      <span className="text-sm font-semibold">
                        {accessoryForm.watch("quantity")?.toLocaleString?.() ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">From</span>
                      <span className="text-sm font-semibold">{fromBranchName || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">To</span>
                      <span className="text-sm font-semibold">{accessoryToBranchName || "—"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!accessoryForm.formState.isValid || createAccessoryTransfer.isPending}
                    >
                      {createAccessoryTransfer.isPending ? "Submitting…" : "Submit Transfer"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
