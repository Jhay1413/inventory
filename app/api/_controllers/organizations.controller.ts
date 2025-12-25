import { NextRequest, NextResponse } from "next/server"
import * as service from "@/app/api/_services/organizations.service"

export async function handleListOrganizations(_req: NextRequest) {
  try {
    const result = await service.listOrganizations()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 })
  }
}
