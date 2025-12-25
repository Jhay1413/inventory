import { NextRequest } from "next/server"
import {
  handleGetInvoice,
  handleUpdateInvoice,
} from "@/app/api/_controllers/invoices.controller"

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return handleGetInvoice(req, id)
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return handleUpdateInvoice(req, id)
}
