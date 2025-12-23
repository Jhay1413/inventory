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
  location: z.string().min(5, {
    message: "Location must be at least 5 characters",
  }),
  phone: z.string().regex(/^\+63\s\d{2}-\d{3}-\d{4}$/, {
    message: "Phone must be in format: +63 XX-XXX-XXXX",
  }),
  manager: z.string().min(2, {
    message: "Manager name must be at least 2 characters",
  }),
  employees: z.number().min(1, {
    message: "Employees must be at least 1",
  }),
})

export type BranchFormValues = z.infer<typeof branchFormSchema>
