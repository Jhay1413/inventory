import { NextRequest, NextResponse } from "next/server"
import * as service from "@/app/api/_services/product-stats.service"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"

export async function handleGetProductStats(req: NextRequest) {
  try {
    const { activeOrganizationId, isAdminOrganization } = await getActiveOrgContext(req)
    if (!activeOrganizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const branchId = isAdminOrganization ? undefined : activeOrganizationId
    const currentBranchId = activeOrganizationId // All orgs get their current branch stats
    const stats = await service.getProductStats({ branchId, currentBranchId })
    return NextResponse.json({ stats })
  } catch {
    return NextResponse.json({ error: "Failed to fetch product stats" }, { status: 500 })
  }
}
