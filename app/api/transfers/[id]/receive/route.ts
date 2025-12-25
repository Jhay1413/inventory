import { NextRequest } from "next/server"
import { handleReceiveTransfer } from "@/app/api/_controllers/transfers-receive.controller"

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params
  return handleReceiveTransfer(req, params)
}
