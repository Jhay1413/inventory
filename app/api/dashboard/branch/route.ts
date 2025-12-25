import { NextRequest, NextResponse } from "next/server"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import { getBranchDashboardSummary } from "@/app/api/_services/dashboard.service"

export async function GET(req: NextRequest) {
  const { activeOrganizationId, isAdminOrganization, userId } = await getActiveOrgContext(req)
  if (!userId || !activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (isAdminOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const summary = await getBranchDashboardSummary(activeOrganizationId)
    return NextResponse.json(summary)
  } catch {
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 })
  }
}
