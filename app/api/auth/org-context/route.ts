import { NextRequest, NextResponse } from "next/server"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"

export async function GET(req: NextRequest) {
  const { activeOrganizationId, isAdminOrganization, userId } = await getActiveOrgContext(req)

  if (!userId || !activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    activeOrganizationId,
    isAdminOrganization,
  })
}
