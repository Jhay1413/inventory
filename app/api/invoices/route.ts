import { NextRequest } from "next/server"
import { handleCreateInvoice, handleListInvoices } from "@/app/api/_controllers/invoices.controller"

export async function GET(req: NextRequest) {
  return handleListInvoices(req)
}

export async function POST(req: NextRequest) {
  return handleCreateInvoice(req)
}
