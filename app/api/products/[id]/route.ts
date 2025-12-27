import { NextRequest } from "next/server"
import {
  handleGetProduct,
  handleDeleteProduct,
  handleUpdateProduct,
} from "@/app/api/_controllers/products.controller"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  return handleGetProduct(req, id)
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  return handleUpdateProduct(req, id)
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  return handleDeleteProduct(id)
}
