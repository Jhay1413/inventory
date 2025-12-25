import { NextRequest } from "next/server"
import { handleCreateProduct, handleListProducts } from "@/app/api/_controllers/products.controller"

export async function GET(req: NextRequest) {
  return handleListProducts(req)
}

export async function POST(req: NextRequest) {
  return handleCreateProduct(req)
}
