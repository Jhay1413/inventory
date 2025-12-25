import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/app/lib/db"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import { listProductAuditLogsForProduct } from "@/app/api/_dal/product-audit.dal"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: productId } = await context.params

  try {
    const { activeOrganizationId, isAdminOrganization, userId } = await getActiveOrgContext(req)
    if (!userId || !activeOrganizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, branchId: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (!isAdminOrganization) {
      // Non-admin users can only see logs for products in their active organization (branch).
      if (!product.branchId || product.branchId !== activeOrganizationId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const logs = await listProductAuditLogsForProduct(prisma, {
      productId,
      take: 50,
    })

    return NextResponse.json({ logs })
  } catch {
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
