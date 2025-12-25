import { NextRequest, NextResponse } from "next/server"
import { getActiveOrgContext } from "@/app/api/_utils/org-context"
import {
  CreateInvoiceSchema,
  InvoiceListQuerySchema,
  InvoiceStatsQuerySchema,
  InvoiceStatus,
  UpdateInvoiceSchema,
} from "@/types/api/invoices"
import * as service from "@/app/api/_services/invoices.service"

export async function handleCreateInvoice(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = CreateInvoiceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  const { activeOrganizationId, userId } = await getActiveOrgContext(req)
  if (!activeOrganizationId || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await service.createInvoice({
      productId: parsed.data.productId,
      freebieProductIds: parsed.data.freebieProductIds,
      branchId: activeOrganizationId,
      createdById: userId,
      salePrice: parsed.data.salePrice,
      paymentType: parsed.data.paymentType,
      status: parsed.data.status ?? InvoiceStatus.PAID,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      notes: parsed.data.notes,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ invoice: result.invoice }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create invoice"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function handleListInvoices(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const raw = Object.fromEntries(searchParams.entries())
  const parsed = InvoiceListQuerySchema.safeParse(raw)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  const { activeOrganizationId, isAdminOrganization } = await getActiveOrgContext(req)
  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const branchId = isAdminOrganization
    ? parsed.data.branchId
    : activeOrganizationId

  const result = await service.listInvoices({
    branchId,
    limit: parsed.data.limit,
    offset: parsed.data.offset,
    search: parsed.data.search,
    status: parsed.data.status,
    paymentType: parsed.data.paymentType,
    productTypeId: parsed.data.productTypeId,
    condition: parsed.data.condition,
  })

  return NextResponse.json(result)
}

export async function handleGetInvoice(req: NextRequest, id: string) {
  const { activeOrganizationId, isAdminOrganization } = await getActiveOrgContext(req)
  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await service.getInvoiceById({
    id,
    branchId: isAdminOrganization ? undefined : activeOrganizationId,
  })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }

  return NextResponse.json({ invoice: result.invoice })
}

export async function handleUpdateInvoice(req: NextRequest, id: string) {
  const body = await req.json().catch(() => null)
  const parsed = UpdateInvoiceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  const { activeOrganizationId, isAdminOrganization } = await getActiveOrgContext(req)
  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await service.updateInvoice({
      id,
      branchId: isAdminOrganization ? undefined : activeOrganizationId,
      data: parsed.data,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ invoice: result.invoice })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update invoice"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function handleInvoiceStats(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const raw = Object.fromEntries(searchParams.entries())
  const parsed = InvoiceStatsQuerySchema.safeParse(raw)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  const { activeOrganizationId, isAdminOrganization } = await getActiveOrgContext(req)
  if (!activeOrganizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const branchId = isAdminOrganization
    ? parsed.data.branchId
    : activeOrganizationId

  const stats = await service.getInvoiceStats({ branchId })
  return NextResponse.json(stats)
}
