import { NextRequest } from "next/server"
import { handleCreateAccessory, handleListAccessories } from "@/app/api/_controllers/accessories.controller"

export async function GET(req: NextRequest) {
  return handleListAccessories(req)
}

export async function POST(req: NextRequest) {
  return handleCreateAccessory(req)
}
