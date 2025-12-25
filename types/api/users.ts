import { z } from "zod"

export const BranchSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

export type Branch = z.infer<typeof BranchSchema>

export const UserWithBranchesSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string().nullable().optional(),
  branches: z.array(BranchSchema),
})

export type UserWithBranches = z.infer<typeof UserWithBranchesSchema>

export const UsersListResponseSchema = z.object({
  users: z.array(UserWithBranchesSchema),
})

export type UsersListResponse = z.infer<typeof UsersListResponseSchema>

export const userFormData = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["admin", "user", "member"]).default("user"),
  organizationIds: z.array(z.string()).min(1, "At least one branch is required"),
  memberRole: z.string().optional().default("member"),
})
export const updateUserFormData = userFormData.omit({ password: true }).extend({
  id: z.string().min(1, "User id is required"),
})

// Create
export const CreateUserSchema = userFormData
export type CreateUserInput = z.input<typeof CreateUserSchema>
export type CreateUserData = z.output<typeof CreateUserSchema>

// Update (API)
export const UpdateUserSchema = updateUserFormData.omit({ id: true })
export type UpdateUserInput = z.input<typeof UpdateUserSchema>
export type UpdateUserData = z.output<typeof UpdateUserSchema>

// Update (UI-only: includes id for reusable form submit handlers)
export const UpdateUserFormSchema = updateUserFormData
export type UpdateUserFormInput = z.input<typeof UpdateUserFormSchema>
export type UpdateUserFormData = z.output<typeof UpdateUserFormSchema>

// Back-compat alias used by the UI
export type UserFormData = CreateUserInput

export const CreateUserResponseSchema = z.object({
  user: UserWithBranchesSchema,
})

export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>

export const UserResponseSchema = z.object({
  user: UserWithBranchesSchema,
})

export type UserResponse = z.infer<typeof UserResponseSchema>


