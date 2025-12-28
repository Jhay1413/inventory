import { NextRequest } from "next/server"
import {
  handleAddAccessoryStock,
  handleListAccessoryStock,
} from "@/app/api/_controllers/accessory-stock.controller"

export async function GET(req: NextRequest) {
  return handleListAccessoryStock(req)
}

export async function POST(req: NextRequest) {
  return handleAddAccessoryStock(req)
}
