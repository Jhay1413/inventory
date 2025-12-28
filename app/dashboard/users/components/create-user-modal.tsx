"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useOrganizations } from "@/app/queries/organizations.queries"
import { useCreateUser } from "@/app/queries/users.queries"
import { UserForm } from "@/app/dashboard/users/components/user-form"

export function CreateUserModal() {
  const [open, setOpen] = useState(false)
  const { data: orgData, isLoading: orgsLoading, error: orgsError } = useOrganizations({
    enabled: open,
  })
  const organizations = useMemo(() => orgData?.organizations ?? [], [orgData])

  const createUser = useCreateUser()
  const [formError, setFormError] = useState<string | null>(null)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setFormError(null)
      }}
    >
      <DialogTrigger asChild>
        <Button>Add user</Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
        </DialogHeader>

        {orgsError ? (
          <p className="text-sm text-destructive">
            {orgsError instanceof Error ? orgsError.message : "Failed to load branches"}
          </p>
        ) : null}

        <UserForm
          mode="create"
          organizations={organizations}
          submitLabel="Create user"
          isSubmitting={createUser.isPending}
          errorMessage={formError}
          onSubmit={async (values) => {
            setFormError(null)
            try {
              await createUser.mutateAsync(values)
              setOpen(false)
            } catch (e) {
              setFormError(e instanceof Error ? e.message : "Failed to create user")
            }
          }}
        />

        {orgsLoading ? (
          <p className="text-xs text-muted-foreground">Loading branches...</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
