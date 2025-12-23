import { NextRequest, NextResponse } from "next/server"
import { handleGetInventory } from "@/app/api/_controllers/inventory.controller"

export async function GET(req: NextRequest) {
  return handleGetInventory(req)
}
