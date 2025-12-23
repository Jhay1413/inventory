import { NextResponse } from "next/server"
import * as service from "@/app/api/_services/product-stats.service"

export async function handleGetProductStats() {
  try {
    const stats = await service.getProductStats()
    return NextResponse.json({ stats })
  } catch {
    return NextResponse.json({ error: "Failed to fetch product stats" }, { status: 500 })
  }
}
