"use client"

import * as React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useCreateReturn } from "@/app/queries/returns.queries"
import { useProducts } from "@/app/queries/products.queries"
import type { InvoiceWithRelations } from "@/types/api/invoices"
import { ReturnResolution } from "@/types/api/returns"

const schema = z.object({
  productId: z.string().min(1, "Select a returned item"),
  resolution: z.enum([ReturnResolution.EXCHANGE, ReturnResolution.REPAIR] as const),
  defectNotes: z.string().trim().min(1, "Defect notes are required"),
  replacementSearch: z.string().optional(),
  replacementProductId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function invoiceProductOptions(invoice: InvoiceWithRelations) {
  const list = [] as Array<{ id: string; label: string }>

  // Main product
  list.push({
    id: invoice.product.id,
    label: `${invoice.product.productModel.name} • ${invoice.product.imei}`,
  })

  // Freebie products
  for (const it of invoice.items ?? []) {
    if (!it.isFreebie) continue
    list.push({
      id: it.product.id,
      label: `${it.product.productModel.name} • ${it.product.imei}`,
    })
  }

  return list
}

export function CreateReturnModal({ invoice }: { invoice: InvoiceWithRelations }) {
  const createReturn = useCreateReturn()
  const [open, setOpen] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      productId: invoice.product.id,
      resolution: ReturnResolution.REPAIR,
      defectNotes: "",
      replacementSearch: "",
      replacementProductId: "",
    },
  })

  const resolution = form.watch("resolution")
  const replacementSearch = form.watch("replacementSearch")

  const replacementsQuery = useProducts(
    {
      limit: 15,
      offset: 0,
      availability: "Available",
      search: replacementSearch?.trim() || undefined,
    },
    { enabled: open && resolution === ReturnResolution.EXCHANGE }
  )

  const replacementProducts = replacementsQuery.data?.products ?? []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Return</Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create return</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await createReturn.mutateAsync({
              invoiceId: invoice.id,
              productItems: [
                {
                  productId: values.productId,
                  defectNotes: values.defectNotes,
                  resolution: values.resolution,
                  replacementProductId:
                    values.resolution === ReturnResolution.EXCHANGE
                      ? values.replacementProductId || undefined
                      : undefined,
                },
              ],
            })

            setOpen(false)
            form.reset({
              productId: invoice.product.id,
              resolution: ReturnResolution.REPAIR,
              defectNotes: "",
              replacementSearch: "",
              replacementProductId: "",
            })
          })}
        >
          <div className="space-y-2">
            <Label>Returned item</Label>
            <Select
              value={form.watch("productId")}
              onValueChange={(v) => form.setValue("productId", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {invoiceProductOptions(invoice).map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.productId ? (
              <p className="text-xs text-destructive">{form.formState.errors.productId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Resolution</Label>
            <Select
              value={resolution}
              onValueChange={(v) => form.setValue("resolution", v as FormValues["resolution"], { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ReturnResolution.REPAIR}>Repair</SelectItem>
                <SelectItem value={ReturnResolution.EXCHANGE}>Exchange</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Defect notes</Label>
            <Input
              value={form.watch("defectNotes")}
              onChange={(e) => form.setValue("defectNotes", e.target.value, { shouldValidate: true })}
              placeholder="Describe the defect..."
            />
            {form.formState.errors.defectNotes ? (
              <p className="text-xs text-destructive">{form.formState.errors.defectNotes.message}</p>
            ) : null}
          </div>

          {resolution === ReturnResolution.EXCHANGE ? (
            <div className="space-y-3 rounded-md border p-3">
              <div className="space-y-2">
                <Label>Replacement search (IMEI / model)</Label>
                <Input
                  value={replacementSearch ?? ""}
                  onChange={(e) => form.setValue("replacementSearch", e.target.value)}
                  placeholder="Search available units..."
                />
              </div>

              <div className="space-y-2">
                <Label>Replacement unit</Label>
                <Select
                  value={form.watch("replacementProductId") || ""}
                  onValueChange={(v) => form.setValue("replacementProductId", v, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={replacementsQuery.isLoading ? "Loading..." : "Select replacement"} />
                  </SelectTrigger>
                  <SelectContent>
                    {replacementProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.productModel.name} • {p.imei}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!form.formState.isValid || createReturn.isPending}>
              Create return
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
