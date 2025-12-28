import { NextRequest } from "next/server"
import { handleCreateAccessoryTransfer } from "@/app/api/_controllers/accessory-transfers.controller"
import { handleListAccessoryTransfers } from "@/app/api/_controllers/accessory-transfers-list.controller"

export async function GET(req: NextRequest) {
  return handleListAccessoryTransfers(req)
}

export async function POST(req: NextRequest) {
  return handleCreateAccessoryTransfer(req)
}
