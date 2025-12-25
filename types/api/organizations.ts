import { z } from "zod"

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
})

export type Organization = z.infer<typeof OrganizationSchema>

export const OrganizationsListResponseSchema = z.object({
  organizations: z.array(OrganizationSchema),
})

export type OrganizationsListResponse = z.infer<typeof OrganizationsListResponseSchema>
