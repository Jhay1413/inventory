import { z } from "zod"
import { OrganizationSchema } from "@/types/api/organizations"

export const BranchOverviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  location: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  manager: z.string().nullable().optional(),
  employees: z.number().int().nonnegative(),
  totalStock: z.number().int().nonnegative(),
  monthlySales: z.number().int().nonnegative(),
  revenue: z.number().int().nonnegative(),
  status: z.enum(["Active", "Inactive"]),
})

export type BranchOverview = z.infer<typeof BranchOverviewSchema>

export const BranchesListResponseSchema = z.object({
  branches: z.array(BranchOverviewSchema),
})

export type BranchesListResponse = z.infer<typeof BranchesListResponseSchema>

export const CreateBranchResponseSchema = z.object({
  organization: OrganizationSchema,
})

export type CreateBranchResponse = z.infer<typeof CreateBranchResponseSchema>
