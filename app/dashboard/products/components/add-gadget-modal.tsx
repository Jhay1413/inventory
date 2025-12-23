"use client"

import { useEffect, useRef, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconDeviceMobile } from "@tabler/icons-react"
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
  FormDescription,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  gadgetFormSchema,
  GadgetCondition,
  GadgetAvailability,
  type GadgetFormSubmission,
  type GadgetFormValues,
} from "@/types/gadget"
import { useProductTypes } from "@/app/queries/product-types.queries"
import { useProductModelsByProductType } from "@/app/queries/product-models.queries"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"

interface AddGadgetModalProps {
  onAddGadget: (gadget: GadgetFormSubmission) => void
}

export function AddGadgetModal({ onAddGadget }: AddGadgetModalProps) {
  const [open, setOpen] = useState(false)
  const [productModelSearch, setProductModelSearch] = useState("")
  const [productTypeOpen, setProductTypeOpen] = useState(false)
  const [productModelOpen, setProductModelOpen] = useState(false)
  const imeiInputRef = useRef<HTMLInputElement | null>(null)

  const form = useForm<GadgetFormValues>({
    resolver: zodResolver(gadgetFormSchema) as unknown as Resolver<GadgetFormValues>,
    defaultValues: {
      productTypeId: "",
      productModelId: "",
      color: "",
      ram: 0,
      imei: "",
      condition: GadgetCondition.BRAND_NEW,
      availability: GadgetAvailability.AVAILABLE,
      status: "",
    },
  })

  const productTypeId = form.watch("productTypeId")
  const normalizedModelSearch = productModelSearch.trim() || undefined
  const { data: productTypesData, isLoading: productTypesLoading } = useProductTypes()
  const { data: productModelsData, isLoading: productModelsLoading } =
    useProductModelsByProductType(productTypeId, normalizedModelSearch)

  useEffect(() => {
    if (!open) return

    // USB barcode scanners behave like a keyboard: focusing the IMEI field
    // makes scanning fast (no camera needed).
    const timeout = setTimeout(() => {
      imeiInputRef.current?.focus()
      imeiInputRef.current?.select()
    }, 0)

    return () => clearTimeout(timeout)
  }, [open])

  function onSubmit(values: GadgetFormValues) {
    const productType = productTypesData?.productTypes.find((t) => t.id === values.productTypeId)
    const productModel = productModelsData?.find((m) => m.id === values.productModelId)

    const submission: GadgetFormSubmission = {
      ...values,
      productTypeName: productType?.name ?? values.productTypeId,
      productModelName: productModel?.name ?? values.productModelId,
    }

    onAddGadget(submission)
    form.reset()
    setOpen(false)
  }

  function handleImeiChange(rawValue: string) {
    const digitsOnly = rawValue.replace(/\D/g, "").slice(0, 15)
    form.setValue("imei", digitsOnly, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconDeviceMobile className="mr-2 h-4 w-4" />
          Add Gadget
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Gadget</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new gadget to your inventory
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Product Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Type */}
                <FormField
                  control={form.control}
                  name="productTypeId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1">
                      <FormLabel className="text-sm">Product Type</FormLabel>
                      <p className="text-xs text-muted-foreground truncate text-nowrap">
                        You are able to select product type
                      </p>
                      <FormControl>
                        <Popover open={productTypeOpen} onOpenChange={setProductTypeOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between h-8",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? `${productTypesData?.productTypes.find((t) => t.id === field.value)?.name ?? ""}`
                                : productTypesLoading
                                  ? "Loading..."
                                  : "Select product type"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[260px] p-0">
                            <Command>
                              <CommandInput placeholder="Search product type..." />
                              <CommandList>
                                <CommandEmpty>No product type found.</CommandEmpty>
                                <CommandGroup>
                                  {(productTypesData?.productTypes ?? []).map((t) => (
                                    <CommandItem
                                      key={t.id}
                                      value={t.name}
                                      onSelect={() => {
                                        form.setValue("productTypeId", t.id, {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        })

                                        form.setValue("productModelId", "", {
                                          shouldDirty: true,
                                          // Don't validate model immediately when type changes.
                                          shouldValidate: false,
                                        })
                                        form.clearErrors("productModelId")
                                        setProductModelSearch("")
                                        setProductTypeOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          t.id === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {t.name}
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

                {/* Model */}
                <FormField
                  control={form.control}
                  name="productModelId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1">
                      <FormLabel className="text-sm">Product Model</FormLabel>
                      <p className="text-xs text-muted-foreground truncate text-nowrap">
                        You are able to select product model
                      </p>
                      <FormControl>
                        <Popover
                          open={productModelOpen}
                          onOpenChange={(nextOpen) => {
                            if (!productTypeId) return
                            setProductModelOpen(nextOpen)
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              disabled={!productTypeId}
                              className={cn(
                                "justify-between h-8",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? `${(productModelsData ?? []).find((m) => m.id === field.value)?.name ?? ""}`
                                : !productTypeId
                                  ? "Select product type first"
                                  : productModelsLoading
                                    ? "Loading..."
                                    : "Select product model"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[260px] p-0">
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="Search model..."
                                value={productModelSearch}
                                onValueChange={(value) => setProductModelSearch(value)}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {productModelsLoading
                                    ? "Loading..."
                                    : "No product model found."}
                                </CommandEmpty>
                                <CommandGroup>
                                  {(productModelsData ?? []).map((m) => (
                                    <CommandItem
                                      key={m.id}
                                      value={m.name}
                                      onSelect={() => {
                                        form.setValue("productModelId", m.id, {
                                          shouldDirty: true,
                                          shouldValidate: true,
                                        })
                                        form.clearErrors("productModelId")
                                        setProductModelOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          m.id === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {m.name}
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

                {/* Color */}
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

                {/* RAM */}
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
              </div>

              {/* IMEI - Full Width */}
              <FormField
                control={form.control}
                name="imei"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMEI Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter 15 digit IMEI number" 
                        maxLength={15}
                        inputMode="numeric"
                        {...field}
                        ref={imeiInputRef}
                        onChange={(e) => handleImeiChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be exactly 15 digits
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Condition & Availability */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Condition & Status</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Condition */}
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                {/* Availability */}
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              {/* Status - Full Width */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Perfect condition, Minor scratches on back" {...field} />
                    </FormControl>
                    <FormDescription>
                      Describe any damage or special notes about condition
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Gadget</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
