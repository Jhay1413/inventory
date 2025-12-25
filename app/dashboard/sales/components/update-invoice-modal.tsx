"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Resolver } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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

import { useInvoice, useUpdateInvoice } from "@/app/queries/invoices.queries"
import {
  InvoicePaymentType,
  InvoiceStatus,
  type UpdateInvoiceFormInput,
} from "@/types/api/invoices"

const UpdateSaleFormSchema = z.object({
  id: z.string().min(1),
  salePrice: z.coerce.number().int().positive("Sales price is required"),
  paymentType: z.enum([
    InvoicePaymentType.CASH,
    InvoicePaymentType.CREDIT,
    InvoicePaymentType.INSTALLMENT,
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

export function UpdateInvoiceModal({ invoiceId }: { invoiceId: string }) {
  const [open, setOpen] = useState(false)
  const { data, isLoading, error } = useInvoice(invoiceId, { enabled: open })
  const updateInvoice = useUpdateInvoice()

  const [formError, setFormError] = useState<string | null>(null)

  const defaults = useMemo<UpdateSaleFormValues | undefined>(() => {
    const invoice = data?.invoice
    if (!invoice) return undefined

    return {
      id: invoice.id,
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
      salePrice: 0,
      paymentType: InvoicePaymentType.CASH,
      status: InvoiceStatus.PAID,
      customerName: "",
      customerPhone: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (!defaults) return
    form.reset(defaults)
  }, [defaults, form])

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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit sale</DialogTitle>
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
              className="space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                setFormError(null)

                const payload: UpdateInvoiceFormInput = {
                  id: values.id,
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
            >
              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales price</FormLabel>
                    <FormControl>
                      <Input type="number" inputMode="numeric" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="paymentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment type</FormLabel>
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
                          <SelectItem value={InvoiceStatus.PENDING}>Pending</SelectItem>
                          <SelectItem value={InvoiceStatus.PARTIALLY_PAID}>Partially Paid</SelectItem>
                          <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                          <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer name</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
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
                    <FormLabel>Customer phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={updateInvoice.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateInvoice.isPending}>
                  {updateInvoice.isPending ? "Updating..." : "Update sale"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <p className="text-sm text-muted-foreground">Sale not found.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
