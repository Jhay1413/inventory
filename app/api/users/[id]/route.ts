import { NextRequest } from "next/server"
import { handleGetUser, handleUpdateUser } from "@/app/api/_controllers/users.controller"

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  return handleGetUser(id)
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  return handleUpdateUser(req, id)
}
