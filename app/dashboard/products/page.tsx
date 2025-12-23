"use client"

import * as React from "react"
import { IconSearch } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddGadgetModal } from "./components/add-gadget-modal"
import { ProductStatsCards } from "./components/product-stats-cards"
import { ProductRowActions } from "./components/product-row-actions"
import type { GadgetFormSubmission } from "@/types/gadget"
import { useCreateProduct, useProducts } from "@/app/queries/products.queries"
import { useProductTypes } from "@/app/queries/product-types.queries"
import { useProductStats } from "@/app/queries/product-stats.queries"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [conditionFilter, setConditionFilter] = React.useState("all")
  const [availabilityFilter, setAvailabilityFilter] = React.useState("all")

  const listFilters = React.useMemo(
    () => ({
      limit: 100,
      offset: 0,
      search: searchQuery.trim() || undefined,
      productTypeId: typeFilter === "all" ? undefined : typeFilter,
      condition: conditionFilter === "all" ? undefined : (conditionFilter as any),
      availability: availabilityFilter === "all" ? undefined : (availabilityFilter as any),
    }),
    [availabilityFilter, conditionFilter, searchQuery, typeFilter]
  )

  const { data: productsData, isLoading: productsLoading } = useProducts(listFilters)
  const { data: productTypesData } = useProductTypes()
  const createProduct = useCreateProduct()
  const { data: statsData, isLoading: statsLoading } = useProductStats()

  const products = productsData?.products ?? []

  const handleAddGadget = async (newGadget: GadgetFormSubmission) => {
    await createProduct.mutateAsync({
      productModelId: newGadget.productModelId,
      color: newGadget.color,
      ram: newGadget.ram,
      imei: newGadget.imei,
      condition: newGadget.condition,
      availability: newGadget.availability,
      status: newGadget.status,
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your gadget inventory across all branches
          </p>
        </div>
        <AddGadgetModal onAddGadget={handleAddGadget} />
      </div>

      {/* Stats Cards */}
      <ProductStatsCards stats={statsData?.stats} isLoading={statsLoading} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter gadgets by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by model or IMEI..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(productTypesData?.productTypes ?? []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="BrandNew">Brand New</SelectItem>
                <SelectItem value="SecondHand">Second Hand</SelectItem>
              </SelectContent>
            </Select>

            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gadgets Inventory</CardTitle>
          <CardDescription>
            {productsLoading ? "Loading..." : `${products.length} gadget(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>RAM</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.productModel.productType.name}</div>
                    <div className="text-xs text-muted-foreground">{product.color}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.productModel.name}</div>
                    <div className="text-xs text-muted-foreground">{product.color}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.ram}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{product.imei}</TableCell>
                  <TableCell>
                    <Badge
                      variant={product.condition === "BrandNew" ? "default" : "outline"}
                      className={
                        product.condition === "BrandNew"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          : ""
                      }
                    >
                      {product.condition === "BrandNew" ? "Brand New" : "Second Hand"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.availability === "Available" ? "default" : "secondary"}
                      className={
                        product.availability === "Available"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {product.availability}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.status}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ProductRowActions product={product} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
