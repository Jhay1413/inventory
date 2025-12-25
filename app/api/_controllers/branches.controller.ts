import { NextRequest, NextResponse } from "next/server"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import * as service from "@/app/api/_services/branches.service"
import { branchFormSchema } from "@/types/branch"

export async function handleListBranches(req: NextRequest) {
  const { activeOrganizationId, isAdminOrganization } = await getActiveOrgContext(req)

  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdminOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const result = await service.listBranchesOverview()
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch branches"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function handleCreateBranch(req: NextRequest) {
  const { activeOrganizationId, isAdminOrganization } = await getActiveOrgContext(req)

  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isAdminOrganization) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = branchFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  try {
    const result = await service.createBranch(req.headers, parsed.data)
    return NextResponse.json(result, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create branch"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
