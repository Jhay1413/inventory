"use client"

import { useEffect, useState } from "react"
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
  onAddBranch: (branch: BranchFormValues) => Promise<void>
  isSubmitting?: boolean
}

export function AddBranchModal({ onAddBranch, isSubmitting }: AddBranchModalProps) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const toSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+/, "")
      .replace(/_+$/, "")

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  })

  const watchedName = form.watch("name")

  // Keep slug synced with name until the user edits slug manually.
  useEffect(() => {
    if (slugManuallyEdited) return
    form.setValue("slug", toSlug(watchedName ?? ""), { shouldValidate: true })
  }, [watchedName, slugManuallyEdited])

  async function onSubmit(values: BranchFormValues) {
    setSubmitError(null)
    try {
      await onAddBranch(values)
      form.reset()
      setSlugManuallyEdited(false)
      setOpen(false)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Failed to create branch")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconBuildingStore className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Branch</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new branch location
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <p className="text-sm text-destructive">{submitError}</p>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Organization</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. warehouse test"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          if (!slugManuallyEdited) {
                            form.setValue("slug", toSlug(e.currentTarget.value), { shouldValidate: true })
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. warehouse_test"
                        {...field}
                        onChange={(e) => {
                          setSlugManuallyEdited(true)
                          field.onChange(toSlug(e.currentTarget.value))
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Lowercase letters/numbers with underscores (used in URLs)
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
                  form.reset({
                    name: "",
                    slug: "",
                  })
                  setSlugManuallyEdited(false)
                  setSubmitError(null)
                  setOpen(false)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Branch"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
