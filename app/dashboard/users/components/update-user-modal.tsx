"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useOrganizations } from "@/app/queries/organizations.queries"
import { useUpdateUser, useUser } from "@/app/queries/users.queries"
import { UserForm } from "@/app/dashboard/users/components/user-form"

export function UpdateUserModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)

  const { data: orgData } = useOrganizations({ enabled: open })
  const organizations = useMemo(() => orgData?.organizations ?? [], [orgData])

  const { data: userData, isLoading, error } = useUser(userId, { enabled: open })
  const updateUser = useUpdateUser()

  const [formError, setFormError] = useState<string | null>(null)

  const defaults = useMemo(() => {
    const u = userData?.user
    if (!u) return undefined

    const resolvedRole =
      u.role === "admin" || u.role === "user" || u.role === "member" ? u.role : "user"

    return {
      id: userId,
      name: u.name,
      email: u.email,
      role: resolvedRole as "admin" | "user" | "member",
      organizationIds: u.branches.map((b) => b.id),
      memberRole: "member" as const,
    }
  }, [userData, userId])

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

      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load user"}
          </p>
        ) : userData?.user ? (
          <UserForm
            mode="update"
            organizations={organizations}
            defaultValues={defaults}
            submitLabel="Update user"
            isSubmitting={updateUser.isPending}
            errorMessage={formError}
            onSubmit={async (values) => {
              setFormError(null)
              try {
                await updateUser.mutateAsync(values)
                setOpen(false)
              } catch (e) {
                setFormError(e instanceof Error ? e.message : "Failed to update user")
              }
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">User not found.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
