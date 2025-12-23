import { prisma } from "@/app/lib/db"

export type ListProductModelsArgs = {
  productTypeId?: string
  search?: string
  limit: number
  offset: number
}

export async function countProductModels(args: Omit<ListProductModelsArgs, "limit" | "offset">) {
  return prisma.productModel.count({
    where: {
      productTypeId: args.productTypeId,
      name: args.search ? { contains: args.search, mode: "insensitive" } : undefined,
    },
  })
}

export async function listProductModels(args: ListProductModelsArgs) {
  return prisma.productModel.findMany({
    where: {
      productTypeId: args.productTypeId,
      name: args.search ? { contains: args.search, mode: "insensitive" } : undefined,
    },
    include: {
      productType: true,
    },
    orderBy: [{ name: "asc" }],
    take: args.limit,
    skip: args.offset,
  })
}

export async function getProductModelById(id: string) {
  return prisma.productModel.findUnique({
    where: { id },
    include: { productType: true },
  })
}

export async function createProductModel(data: { name: string; productTypeId: string }) {
  return prisma.productModel.create({
    data,
    include: { productType: true },
  })
}

export async function updateProductModel(
  id: string,
  data: Partial<{ name: string; productTypeId: string }>
) {
  return prisma.productModel.update({
    where: { id },
    data,
    include: { productType: true },
  })
}

export async function deleteProductModel(id: string) {
  return prisma.productModel.delete({
    where: { id },
  })
}
