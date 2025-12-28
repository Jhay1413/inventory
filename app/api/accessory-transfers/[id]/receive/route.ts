import { NextRequest } from "next/server"
import { handleReceiveAccessoryTransfer } from "@/app/api/_controllers/accessory-transfers-receive.controller"

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params
  return handleReceiveAccessoryTransfer(req, params)
}
