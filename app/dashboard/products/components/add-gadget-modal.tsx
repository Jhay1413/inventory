"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconDeviceMobile, IconX } from "@tabler/icons-react"
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
import { 
  gadgetFormSchema, 
  type GadgetFormValues,
  GadgetType,
  GadgetCondition,
  GadgetAvailability,
  Branch
} from "../types"

interface AddGadgetModalProps {
  onAddGadget: (gadget: GadgetFormValues) => void
}

export function AddGadgetModal({ onAddGadget }: AddGadgetModalProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<GadgetFormValues>({
    resolver: zodResolver(gadgetFormSchema),
  })

  function onSubmit(values: GadgetFormValues) {
    console.log(values)
    onAddGadget(values)
    form.reset()
    setOpen(false)
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
                  name="type"
                  render={({ field }) => (
                    <FormItem >
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={GadgetType.APPLE}>Apple</SelectItem>
                          <SelectItem value={GadgetType.ANDROID}>Android</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Model */}
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. iPhone 15 Pro Max" {...field} />
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
                        {...field} 
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

            {/* Location & Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Location & Pricing</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Branch */}
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Branch.TACLOBAN}>Tacloban</SelectItem>
                          <SelectItem value={Branch.CATBALOGAN}>Catbalogan</SelectItem>
                          <SelectItem value={Branch.GUIUAN}>Guiuan E.Samar</SelectItem>
                          <SelectItem value={Branch.BORONGAN}>Borongan E.Samar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₱)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
