import { NextRequest } from "next/server"
import { handleCreateProductModel, handleListProductModels } from "../_controllers/product-models.controller"

export async function GET(req: NextRequest) {
  return handleListProductModels(req)
}

export async function POST(req: Request) {
  return handleCreateProductModel(req)
}
