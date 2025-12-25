import { z } from "zod"

export const BranchStatus = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
} as const

export type BranchStatusValue = typeof BranchStatus[keyof typeof BranchStatus]

export const BranchSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  phone: z.string(),
  manager: z.string(),
  employees: z.number(),
  totalStock: z.number(),
  monthlySales: z.number(),
  revenue: z.number(),
  status: z.enum([BranchStatus.ACTIVE, BranchStatus.INACTIVE] as const),
})

export type Branch = z.infer<typeof BranchSchema>

export const branchFormSchema = z.object({
  name: z.string().min(2, {
    message: "Branch name must be at least 2 characters",
  }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, {
      message: "Slug must be lowercase letters/numbers with underscores",
    }),
})

export type BranchFormValues = z.infer<typeof branchFormSchema>
