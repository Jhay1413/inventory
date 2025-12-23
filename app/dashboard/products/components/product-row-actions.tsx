"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"
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
import { useProductTypes } from "@/app/queries/product-types.queries"
import { useProductModelsByProductType } from "@/app/queries/product-models.queries"
import { useDeleteProduct, useUpdateProduct } from "@/app/queries/products.queries"
import {
  gadgetFormSchema,
  GadgetAvailability,
  GadgetCondition,
  type GadgetFormValues,
} from "@/types/gadget"
import type { ProductWithRelations } from "@/types/api/products"

export function ProductRowActions({ product }: { product: ProductWithRelations }) {
  const [viewOpen, setViewOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const { data: productTypesData, isLoading: productTypesLoading } = useProductTypes()

  const form = useForm<GadgetFormValues>({
    resolver: zodResolver(gadgetFormSchema) as unknown as Resolver<GadgetFormValues>,
    defaultValues: {
      productTypeId: product.productModel.productTypeId,
      productModelId: product.productModelId,
      color: product.color,
      ram: product.ram,
      imei: product.imei,
      condition: product.condition as GadgetFormValues["condition"],
      availability: product.availability as GadgetFormValues["availability"],
      status: product.status,
    },
  })

  const productTypeId = form.watch("productTypeId")
  const { data: productModelsData, isLoading: productModelsLoading } =
    useProductModelsByProductType(productTypeId)

  function handleEditOpenChange(nextOpen: boolean) {
    setEditOpen(nextOpen)

    // Reset to the row's current values when opening.
    if (nextOpen) {
      form.reset({
        productTypeId: product.productModel.productTypeId,
        productModelId: product.productModelId,
        color: product.color,
        ram: product.ram,
        imei: product.imei,
        condition: product.condition as GadgetFormValues["condition"],
        availability: product.availability as GadgetFormValues["availability"],
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
        imei: values.imei,
        condition: values.condition,
        availability: values.availability,
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
    <div className="flex justify-end gap-2">
      {/* View */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            View
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>View the details for this product.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{product.productModel.productType.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Model</span>
              <span className="font-medium">{product.productModel.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Color</span>
              <span className="font-medium">{product.color}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">RAM</span>
              <span className="font-medium">{product.ram}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">IMEI</span>
              <span className="font-mono text-xs">{product.imei}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Condition</span>
              <span className="font-medium">{product.condition}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Availability</span>
              <span className="font-medium">{product.availability}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">{product.status}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
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

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="imei"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IMEI Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 15 digit IMEI number" maxLength={15} inputMode="numeric" {...field} />
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
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </DialogTrigger>
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
