import { z } from "zod"

export const OrgContextResponseSchema = z.object({
  activeOrganizationId: z.string(),
  isAdminOrganization: z.boolean(),
})

export type OrgContextResponse = z.infer<typeof OrgContextResponseSchema>
