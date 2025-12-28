import { NextRequest } from "next/server"
import { handleCreateReturn, handleListReturns } from "@/app/api/_controllers/returns.controller"

export async function GET(req: NextRequest) {
  return handleListReturns(req)
}

export async function POST(req: NextRequest) {
  return handleCreateReturn(req)
}
