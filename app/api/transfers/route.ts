import { NextRequest } from "next/server"
import { handleCreateTransfer } from "@/app/api/_controllers/transfers.controller"
import { handleListTransfers } from "@/app/api/_controllers/transfers-list.controller"

export async function GET(req: NextRequest) {
  return handleListTransfers(req)
}

export async function POST(req: NextRequest) {
  return handleCreateTransfer(req)
}
