import { prisma } from "@/app/lib/db"
import type { Prisma } from "@/app/generated/prisma/client"

type ProductFilters = {
  branchId?: string
  search?: string
  status?: string
  productTypeId?: string
  productModelId?: string
  condition?: "BrandNew" | "SecondHand"
  availability?: "Available" | "Sold"
}

function buildProductsWhere(filters: ProductFilters) {
  const where: Prisma.ProductWhereInput = {}

  const and: Prisma.ProductWhereInput[] = []

  if (filters.branchId) {
    and.push({ branchId: filters.branchId })
  }

  if (filters.status) {
    and.push({ status: { contains: filters.status, mode: "insensitive" } })
  }

  if (filters.productModelId) {
    and.push({ productModelId: filters.productModelId })
  }

  if (filters.condition) {
    and.push({ condition: filters.condition })
  }

  if (filters.availability) {
    and.push({ availability: filters.availability })
  }

  if (filters.productTypeId) {
    and.push({
      productModel: {
        productTypeId: filters.productTypeId,
      },
    })
  }

  if (filters.search) {
    and.push({
      OR: [
        { imei: { contains: filters.search } },
        {
          productModel: {
            name: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        },
      ],
    })
  }

  if (and.length > 0) {
    where.AND = and
  }

  return where
}

export async function createProduct(data: {
  productModelId: string
  branchId: string
  color: string
  ram: number
  storage?: number
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

export async function productExistsByImei(imei: string) {
  const found = await prisma.product.findUnique({
    where: { imei },
    select: { id: true },
  })
  return Boolean(found)
}

export async function getOrganizationIdBySlug(slug: string) {
  const org = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true },
  })

  return org?.id ?? null
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
    data: data as Prisma.ProductUpdateInput,
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
