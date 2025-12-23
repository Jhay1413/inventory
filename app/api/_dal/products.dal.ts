import { prisma } from "@/app/lib/db"

type ProductFilters = {
  search?: string
  status?: string
  productTypeId?: string
  productModelId?: string
  condition?: "BrandNew" | "SecondHand"
  availability?: "Available" | "Sold"
}

function buildProductsWhere(filters: ProductFilters) {
  const where: any = {}

  if (filters.status) {
    where.status = { contains: filters.status, mode: "insensitive" }
  }

  if (filters.productModelId) {
    where.productModelId = filters.productModelId
  }

  if (filters.condition) {
    where.condition = filters.condition
  }

  if (filters.availability) {
    where.availability = filters.availability
  }

  if (filters.productTypeId) {
    where.productModel = {
      ...(where.productModel ?? {}),
      productTypeId: filters.productTypeId,
    }
  }

  if (filters.search) {
    where.OR = [
      { imei: { contains: filters.search } },
      {
        productModel: {
          name: {
            contains: filters.search,
            mode: "insensitive",
          },
        },
      },
    ]
  }

  return where
}

export async function createProduct(data: {
  productModelId: string
  color: string
  ram: number
  imei: string
  condition: "BrandNew" | "SecondHand"
  availability: "Available" | "Sold"
  status: string
}) {
  return prisma.product.create({
    data,
    include: {
      productModel: {
        include: {
          productType: true,
        },
      },
    },
  })
}

export async function countProducts(filters: ProductFilters = {}) {
  return prisma.product.count({ where: buildProductsWhere(filters) })
}

export async function listProducts(args: { limit: number; offset: number } & ProductFilters) {
  return prisma.product.findMany({
    where: buildProductsWhere(args),
    include: {
      productModel: {
        include: {
          productType: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
    take: args.limit,
    skip: args.offset,
  })
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  return prisma.product.update({
    where: { id },
    // Zod already validated the shape in the controller; keep DAL simple.
    data: data as any,
    include: {
      productModel: {
        include: {
          productType: true,
        },
      },
    },
  })
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  })
}
