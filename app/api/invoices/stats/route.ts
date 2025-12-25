import { NextRequest } from "next/server"
import { handleInvoiceStats } from "@/app/api/_controllers/invoices.controller"

export async function GET(req: NextRequest) {
  return handleInvoiceStats(req)
}
