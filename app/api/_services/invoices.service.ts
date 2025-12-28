import * as dal from "@/app/api/_dal/invoices.dal"

export async function createInvoice(args: {
  productId: string
  freebieProductIds?: string[]
  freebieAccessoryItems?: { accessoryId: string; quantity: number }[]
  branchId: string
  createdById: string
  salePrice: number
  paymentType: "Cash" | "Credit" | "Installment"
  status: "Pending" | "PartiallyPaid" | "Paid" | "Cancelled"
  customerName?: string
  customerPhone?: string
  notes?: string
}) {
  return dal.createInvoiceTx(args)
}

export async function getInvoiceById(args: { id: string; branchId?: string }) {
  return dal.getInvoiceById(args)
}

export async function listInvoices(args: {
  branchId?: string
  limit: number
  offset: number
  search?: string
  status?: "Pending" | "PartiallyPaid" | "Paid" | "Cancelled"
  paymentType?: "Cash" | "Credit" | "Installment"
  productTypeId?: string
  condition?: "BrandNew" | "SecondHand"
}) {
  return dal.listInvoices(args)
}

export async function updateInvoice(args: {
  id: string
  branchId?: string
  data: {
    salePrice?: number
    paymentType?: "Cash" | "Credit" | "Installment"
    status?: "Pending" | "PartiallyPaid" | "Paid" | "Cancelled"
    customerName?: string
    customerPhone?: string
    notes?: string
  }
}) {
  return dal.updateInvoiceTx(args)
}

export async function getInvoiceStats(args: { branchId?: string }) {
  return dal.getInvoiceStats(args)
}
