import { NextRequest } from "next/server"
import { handleListOrganizations } from "@/app/api/_controllers/organizations.controller"

export async function GET(req: NextRequest) {
  return handleListOrganizations(req)
}
