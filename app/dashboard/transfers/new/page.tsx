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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { authClient } from "@/app/lib/auth-client"
import { useCreateTransfer, useTransferProductsSearch } from "@/app/queries/transfers.queries"
import {
  type ProductWithRelations,
} from "@/types/api/products"

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

export default function NewTransferPage() {
  const router = useRouter()
  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: organizations, isPending: orgsLoading } = authClient.useListOrganizations()

  const [imeiPickerOpen, setImeiPickerOpen] = React.useState(false)
  const [imeiSearch, setImeiSearch] = React.useState("")
  const [debouncedImeiSearch, setDebouncedImeiSearch] = React.useState("")
  const [selectedProduct, setSelectedProduct] = React.useState<ProductWithRelations | null>(null)

  const createTransfer = useCreateTransfer()

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

  React.useEffect(() => {
    const t = window.setTimeout(() => setDebouncedImeiSearch(imeiSearch.trim()), 250)
    return () => window.clearTimeout(t)
  }, [imeiSearch])

  const fromBranchId = activeOrganization?.id
  const fromBranchName = activeOrganization?.name ?? ""
  const toBranchId = form.watch("toBranchId")
  const toBranchName = organizations?.find((o) => o.id === toBranchId)?.name ?? ""

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
    </div>
  )
}
