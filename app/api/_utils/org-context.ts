import { auth } from "@/app/lib/auth"
import { prisma } from "@/app/lib/db"

export async function getActiveOrgContext(req: { headers: Headers }): Promise<{
  activeOrganizationId: string | null
  isAdminOrganization: boolean
  userId: string | null
}> {
  const sessionResponse = await auth.api.getSession({
    headers: req.headers,
  })

  const userId = sessionResponse?.user?.id ?? null

  const activeOrganizationId = sessionResponse?.session?.activeOrganizationId ?? null
  if (!activeOrganizationId) {
    return { activeOrganizationId: null, isAdminOrganization: false, userId }
  }

  const activeOrg = await prisma.organization.findUnique({
    where: { id: activeOrganizationId },
    select: { metadata: true },
  })

  let isAdminOrganization = false
  if (activeOrg?.metadata) {
    try {
      const parsed = JSON.parse(activeOrg.metadata) as { isAdminOrganization?: boolean }
      isAdminOrganization = parsed.isAdminOrganization === true
    } catch {
      isAdminOrganization = false
    }
  }

  return { activeOrganizationId, isAdminOrganization, userId }
}
