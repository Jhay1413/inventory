import * as dal from "@/app/api/_dal/products.dal"
import type { CreateProductInput, ProductListQuery } from "@/types/api/products"

export async function listProducts(args: ProductListQuery) {
  const filters = {
    search: args.search,
    status: args.status,
    productTypeId: args.productTypeId,
    productModelId: args.productModelId,
    condition: args.condition,
    availability: args.availability,
  }

  const [total, products] = await Promise.all([
    dal.countProducts(filters),
    dal.listProducts({ limit: args.limit, offset: args.offset, ...filters }),
  ])

  return {
    products,
    pagination: {
      total,
      limit: args.limit,
      offset: args.offset,
      hasMore: args.offset + args.limit < total,
    },
  }
}

export async function createProduct(input: CreateProductInput) {
  return dal.createProduct(input)
}

export async function updateProduct(id: string, input: Record<string, unknown>) {
  return dal.updateProduct(id, input)
}

export async function deleteProduct(id: string) {
  return dal.deleteProduct(id)
}
