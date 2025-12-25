import { NextRequest } from "next/server"
import { handleCreateUser, handleListUsers } from "@/app/api/_controllers/users.controller"

export async function GET(req: NextRequest) {
  return handleListUsers(req)
}

export async function POST(req: Request) {
  return handleCreateUser(req)
}
