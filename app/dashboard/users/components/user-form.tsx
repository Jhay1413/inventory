"use client"

import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import type { Organization } from "@/types/api/organizations"
import {
  type CreateUserInput,
  type UpdateUserFormInput,
  userFormData,
  updateUserFormData,
} from "@/types/api/users"

export type UserFormMode = "create" | "update"

type BaseProps = {
  organizations: Organization[]
  isSubmitting?: boolean
  submitLabel: string
  errorMessage?: string | null
}

type CreateProps = BaseProps & {
  mode: "create"
  defaultValues?: Partial<CreateUserInput>
  onSubmit: (values: CreateUserInput) => Promise<void> | void
}

type UpdateProps = BaseProps & {
  mode: "update"
  defaultValues?: Partial<UpdateUserFormInput>
  onSubmit: (values: UpdateUserFormInput) => Promise<void> | void
}

export function UserForm(props: CreateProps | UpdateProps) {
  const { organizations, isSubmitting, submitLabel, errorMessage } = props

  const isCreate = props.mode === "create"

  if (isCreate) {
    const createDefaults = useMemo<Partial<CreateUserInput>>(
      () => ({
        name: "",
        email: "",
        password: "",
        role: "user",
        organizationIds: [],
        memberRole: "member",
        ...(props.defaultValues ?? {}),
      }),
      [props.defaultValues]
    )

    const form = useForm<CreateUserInput>({
      resolver: zodResolver(userFormData),
      defaultValues: createDefaults,
    })

    useEffect(() => {
      form.reset(createDefaults)
    }, [createDefaults, form])

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await props.onSubmit(values)
          })}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="James Smith" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="user@example.com"
                    type="email"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="some-secure-password"
                    type="password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select value={field.value ?? "user"} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="user">user</SelectItem>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="member">member</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organizationIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branches</FormLabel>
                <FormControl>
                  <div className="space-y-2 rounded-md border p-3 max-h-52 overflow-auto">
                    {organizations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No branches found.</p>
                    ) : (
                      organizations.map((org) => {
                        const current = Array.isArray(field.value) ? field.value : []
                        const checked = current.includes(org.id)

                        return (
                          <label key={org.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => {
                                const next = checked
                                  ? current.filter((x) => x !== org.id)
                                  : [...current, org.id]
                                field.onChange(next)
                              }}
                            />
                            <span>{org.name}</span>
                          </label>
                        )
                      })
                    )}
                  </div>
                </FormControl>
                <p className="text-xs text-muted-foreground">Select one or more branches.</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={!!isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    )
  }

  const updateDefaults = useMemo<Partial<UpdateUserFormInput>>(
    () => ({
      id: "",
      name: "",
      email: "",
      role: "user",
      organizationIds: [],
      memberRole: "member",
      ...(props.defaultValues ?? {}),
    }),
    [props.defaultValues]
  )

  const form = useForm<UpdateUserFormInput>({
    resolver: zodResolver(updateUserFormData),
    defaultValues: updateDefaults,
  })

  useEffect(() => {
    form.reset(updateDefaults)
  }, [form, updateDefaults])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await (props as UpdateProps).onSubmit(values)
        })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="James Smith" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select value={field.value ?? "user"} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                  <SelectItem value="member">member</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organizationIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branches</FormLabel>
              <FormControl>
                <div className="space-y-2 rounded-md border p-3 max-h-52 overflow-auto">
                  {organizations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No branches found.</p>
                  ) : (
                    organizations.map((org) => {
                      const checked = Array.isArray(field.value) && field.value.includes(org.id)

                      return (
                        <label key={org.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => {
                              const current = Array.isArray(field.value) ? field.value : []
                              const next = checked
                                ? current.filter((x) => x !== org.id)
                                : [...current, org.id]
                              field.onChange(next)
                            }}
                          />
                          <span>{org.name}</span>
                        </label>
                      )
                    })
                  )}
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground">Select one or more branches.</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={!!isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
