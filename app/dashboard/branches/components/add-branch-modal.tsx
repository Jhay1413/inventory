"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconBuildingStore } from "@tabler/icons-react"
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
import { branchFormSchema, type BranchFormValues } from "@/types/branch"

interface AddBranchModalProps {
  onAddBranch: (branch: BranchFormValues) => void
}

export function AddBranchModal({ onAddBranch }: AddBranchModalProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: "",
      location: "",
      phone: "+63 ",
      manager: "",
      employees: 0,
    },
  })

  function onSubmit(values: BranchFormValues) {
    console.log(values)
    onAddBranch(values)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconBuildingStore className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Branch</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new branch location
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Branch Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Branch Information</h3>
              
              {/* Branch Name - Full Width */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Tacloban, Catbalogan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location - Full Width */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Real Street, Tacloban City, Leyte" {...field} />
                    </FormControl>
                    <FormDescription>
                      Complete street address, city, and province
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+63 XX-XXX-XXXX" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Format: +63 XX-XXX-XXXX (e.g. +63 53-325-1234)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Management */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Management</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Manager Name */}
                <FormField
                  control={form.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Manager</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Juan Dela Cruz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Number of Employees */}
                <FormField
                  control={form.control}
                  name="employees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Employees</FormLabel>
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
                  form.reset({
                    name: "",
                    location: "",
                    phone: "+63 ",
                    manager: "",
                    employees: 0,
                  })
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Add Branch</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
