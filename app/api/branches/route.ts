import { NextRequest } from "next/server"
import { handleCreateBranch, handleListBranches } from "@/app/api/_controllers/branches.controller"

export async function GET(req: NextRequest) {
  return handleListBranches(req)
}

export async function POST(req: NextRequest) {
  return handleCreateBranch(req)
}
