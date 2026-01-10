"use client"

import * as React from "react"
import { IconChevronLeft, IconChevronRight, IconSearch } from "@tabler/icons-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddGadgetModal } from "./components/add-gadget-modal"
import { ProductStatsCards } from "./components/product-stats-cards"
import { ProductRowActions } from "./components/product-row-actions"
import type { GadgetFormSubmission } from "@/types/gadget"
import { useCreateProduct, useProducts } from "@/app/queries/products.queries"
import { useProductTypes } from "@/app/queries/product-types.queries"
import { useProductStats } from "@/app/queries/product-stats.queries"
import { useAccessoryStockList } from "@/app/queries/accessory-stock.queries"
import { authClient } from "@/app/lib/auth-client"
import { useOrgContext } from "@/app/queries/org-context.queries"

export default function ProductsPage() {
  const PER_PAGE = 15

  const [tab, setTab] = React.useState<"gadgets" | "accessories">("gadgets")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [branchScope, setBranchScope] = React.useState<"all" | "current">("all")
  const [gadgetsPage, setGadgetsPage] = React.useState(1)
  const [accessoriesPage, setAccessoriesPage] = React.useState(1)
  const [conditionFilter, setConditionFilter] = React.useState<"all" | "BrandNew" | "SecondHand">(
    "all"
  )
  const [availabilityFilter, setAvailabilityFilter] = React.useState<"all" | "Available" | "Sold">(
    "all"
  )
    const [defectiveFilter, setDefectiveFilter] = React.useState<
    "all" | "defective" | "notDefective"
  >("all")

  const { data: activeOrganization } = authClient.useActiveOrganization()
  const { data: orgContext } = useOrgContext()

  const activeOrganizationId = React.useMemo(() => {
    if (!activeOrganization || typeof activeOrganization !== "object") return undefined
    if (!("id" in activeOrganization)) return undefined
    const id = (activeOrganization as { id?: unknown }).id
    return typeof id === "string" ? id : undefined
  }, [activeOrganization])

  const activeOrganizationName = React.useMemo(() => {
    if (!activeOrganization || typeof activeOrganization !== "object") return undefined
    if (!("name" in activeOrganization)) return undefined
    const name = (activeOrganization as { name?: unknown }).name
    return typeof name === "string" ? name : undefined
  }, [activeOrganization])

  const isAdminOrganization = React.useMemo(() => {
    const raw =
      activeOrganization &&
      typeof activeOrganization === "object" &&
      "metadata" in activeOrganization
        ? (activeOrganization as Record<string, unknown>).metadata
        : undefined
    if (!raw) return false
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
      return Boolean(
        parsed && typeof parsed === "object" && (parsed as Record<string, unknown>).isAdminOrganization === true
      )
    } catch {
      return false
    }
  }, [activeOrganization])

  const listFilters = React.useMemo(
    () => ({
      limit: PER_PAGE,
      offset: (gadgetsPage - 1) * PER_PAGE,
      search: searchQuery.trim() || undefined,
      branchId:
        !isAdminOrganization && branchScope === "current" ? activeOrganizationId : undefined,
      productTypeId: typeFilter === "all" ? undefined : typeFilter,
      condition: conditionFilter === "all" ? undefined : conditionFilter,
      availability: availabilityFilter === "all" ? undefined : availabilityFilter,
      isDefective:
        defectiveFilter === "all" ? undefined : defectiveFilter === "defective" ? true : false,
    }),
    [
      activeOrganizationId,
      availabilityFilter,
      branchScope,
      conditionFilter,
      defectiveFilter,
      gadgetsPage,
      isAdminOrganization,
      PER_PAGE,
      searchQuery,
      typeFilter,
    ]
  )

  const { data: productsData, isLoading: productsLoading } = useProducts(listFilters)
  const { data: productTypesData } = useProductTypes()
  const createProduct = useCreateProduct()
  const { data: statsData, isLoading: statsLoading } = useProductStats()

  const {
    data: warehouseAccessoryData,
    isLoading: warehouseAccessoryLoading,
  } = useAccessoryStockList(
    { branchId: activeOrganizationId },
    { enabled: isAdminOrganization && !!activeOrganizationId }
  )

  const accessoryStockFilters = React.useMemo(
    () => ({
      limit: PER_PAGE,
      offset: (accessoriesPage - 1) * PER_PAGE,
      ...(!isAdminOrganization && branchScope === "current" && activeOrganizationId
        ? { branchId: activeOrganizationId }
        : {}),
    }),
    [PER_PAGE, accessoriesPage, activeOrganizationId, branchScope, isAdminOrganization]
  )

  const { data: accessoryStockData, isLoading: accessoriesLoading } = useAccessoryStockList(
    accessoryStockFilters,
    { enabled: tab === "accessories" }
  )

  React.useEffect(() => {
    setGadgetsPage(1)
  }, [searchQuery, typeFilter, conditionFilter, availabilityFilter, defectiveFilter, branchScope])

  React.useEffect(() => {
    setAccessoriesPage(1)
  }, [branchScope])

  const products = productsData?.products ?? []
  const gadgetsTotal = productsData?.pagination.total ?? 0
  const gadgetsPageCount = Math.max(1, Math.ceil(gadgetsTotal / PER_PAGE))

  const accessoriesTotal = accessoryStockData?.pagination.total ?? 0
  const accessoriesPageCount = Math.max(1, Math.ceil(accessoriesTotal / PER_PAGE))

  const handleAddGadget = async (newGadget: GadgetFormSubmission) => {
    await createProduct.mutateAsync({
      productModelId: newGadget.productModelId,
      color: newGadget.color,
      ram: newGadget.ram,
      storage: newGadget.storage,
      imei: newGadget.imei,
      autoGenerateImei: newGadget.autoGenerateImei,
      condition: newGadget.condition,
      availability: newGadget.availability,
      isDefective: newGadget.isDefective,
      defectNotes: newGadget.defectNotes,
      status: newGadget.status,
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Manage your inventory across all branches
          </p>
        </div>
        {isAdminOrganization ? <AddGadgetModal onAddGadget={handleAddGadget} /> : null}
      </div>

      {/* Stats Cards */}
      <div className="space-y-4">
        <ProductStatsCards stats={statsData?.stats} isLoading={statsLoading} />
        <div className="grid gap-4 md:grid-cols-4">
          {isAdminOrganization && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Warehouse Gadgets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : statsData?.stats?.currentBranchStock ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Gadgets in warehouse</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Warehouse Accessories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {warehouseAccessoryLoading ? "..." : (warehouseAccessoryData?.stocks ?? []).reduce((sum, s) => sum + s.quantity, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Accessories in warehouse</p>
                </CardContent>
              </Card>
            </>
          )}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gadgets for Transfer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : statsData?.stats?.pendingTransfers ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Pending transfers from branch</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accessories for Transfer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : statsData?.stats?.pendingAccessoryTransfers ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Pending transfers from branch</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
          <TabsTrigger value="accessories">Accessories</TabsTrigger>
        </TabsList>

        <TabsContent value="gadgets" className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter gadgets by various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`grid gap-3 ${isAdminOrganization ? "md:grid-cols-5" : "md:grid-cols-6"}`}
              >
                <div className="relative">
                  <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by model or IMEI..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {!isAdminOrganization ? (
                  <Select value={branchScope} onValueChange={(v) => setBranchScope(v as typeof branchScope)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All branches</SelectItem>
                      <SelectItem value="current">
                        {activeOrganizationName ? `My branch (${activeOrganizationName})` : "My branch"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : null}

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full">
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

                <Select
                  value={defectiveFilter}
                  onValueChange={(v) => setDefectiveFilter(v as typeof defectiveFilter)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Defective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="defective">Defective</SelectItem>
                    <SelectItem value="notDefective">Not Defective</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={conditionFilter}
                  onValueChange={(v) => setConditionFilter(v as "all" | "BrandNew" | "SecondHand")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="BrandNew">Brand New</SelectItem>
                    <SelectItem value="SecondHand">Second Hand</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={availabilityFilter}
                  onValueChange={(v) => setAvailabilityFilter(v as "all" | "Available" | "Sold")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Availability</SelectItem>
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
                    <TableHead>Branch</TableHead>
                    <TableHead>RAM</TableHead>
                    <TableHead>Storage</TableHead>
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
                        <div className="font-medium">{product.branch?.name ?? "—"}</div>
                        {product.branch?.slug ? (
                          <div className="text-xs text-muted-foreground">{product.branch.slug}</div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.ram}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.storage}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{product.imei}</TableCell>
                      <TableCell>
                        {product.isDefective ? (
                          <Badge variant="destructive">Defective</Badge>
                        ) : (
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
                        )}
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

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {gadgetsPage} of {gadgetsPageCount}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGadgetsPage((p) => Math.max(1, p - 1))}
                    disabled={gadgetsPage <= 1 || productsLoading}
                  >
                    <span className="sr-only">Previous page</span>
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setGadgetsPage((p) => Math.min(gadgetsPageCount, p + 1))}
                    disabled={gadgetsPage >= gadgetsPageCount || productsLoading}
                  >
                    <span className="sr-only">Next page</span>
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessories Inventory</CardTitle>
              <CardDescription>
                {accessoriesLoading
                  ? "Loading..."
                  : `${(accessoryStockData?.stocks ?? []).length} stock row(s) found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Accessory</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(accessoryStockData?.stocks ?? []).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="font-medium">{s.accessory.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{s.branch.name}</div>
                        <div className="text-xs text-muted-foreground">{s.branch.slug}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{s.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {accessoriesPage} of {accessoriesPageCount}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAccessoriesPage((p) => Math.max(1, p - 1))}
                    disabled={accessoriesPage <= 1 || accessoriesLoading}
                  >
                    <span className="sr-only">Previous page</span>
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAccessoriesPage((p) => Math.min(accessoriesPageCount, p + 1))}
                    disabled={accessoriesPage >= accessoriesPageCount || accessoriesLoading}
                  >
                    <span className="sr-only">Next page</span>
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
