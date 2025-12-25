import { NextRequest } from "next/server"
import { handleGetProductStats } from "@/app/api/_controllers/product-stats.controller"

export async function GET(req: NextRequest) {
  return handleGetProductStats(req)
}
