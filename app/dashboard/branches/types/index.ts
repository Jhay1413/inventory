import { z } from "zod"

// Branch type
export interface Branch {
    id: string
    name: string
    location: string
    phone: string
    manager: string
    employees: number
    totalStock: number
    monthlySales: number
    revenue: number
    status: "Active" | "Inactive"
}

// Zod schema for branch form
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
