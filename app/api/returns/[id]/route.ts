import { NextRequest } from "next/server"
import {
  handleGetReturn,
  handleUpdateReturn,
} from "@/app/api/_controllers/returns.controller"

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return handleGetReturn(req, id)
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return handleUpdateReturn(req, id)
}
