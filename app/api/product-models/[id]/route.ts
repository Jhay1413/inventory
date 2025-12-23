import {
  handleDeleteProductModel,
  handleGetProductModel,
  handleUpdateProductModel,
} from "../../_controllers/product-models.controller"

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return handleGetProductModel(id)
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return handleUpdateProductModel(req, id)
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  return handleDeleteProductModel(id)
}
