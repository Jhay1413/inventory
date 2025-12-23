import * as dal from "../_dal/product-models.dal"

export type ListArgs = {
  productTypeId?: string
  search?: string
  limit: number
  offset: number
}

export async function listProductModels(args: ListArgs) {
  const [total, productModels] = await Promise.all([
    dal.countProductModels({ productTypeId: args.productTypeId, search: args.search }),
    dal.listProductModels(args),
  ])

  return {
    productModels,
    pagination: {
      total,
      limit: args.limit,
      offset: args.offset,
      hasMore: args.offset + args.limit < total,
    },
  }
}

export async function getProductModel(id: string) {
  return dal.getProductModelById(id)
}

export async function createProductModel(input: { name: string; productTypeId: string }) {
  return dal.createProductModel(input)
}

export async function updateProductModel(
  id: string,
  input: Partial<{ name: string; productTypeId: string }>
) {
  return dal.updateProductModel(id, input)
}

export async function deleteProductModel(id: string) {
  return dal.deleteProductModel(id)
}
