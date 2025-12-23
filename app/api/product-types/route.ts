import { handleCreateProductType, handleGetProductTypes } from "../_controllers/product-types.controller"

export async function GET() {
  return handleGetProductTypes()
}

export async function POST(req: Request) {
  return handleCreateProductType(req)
}
