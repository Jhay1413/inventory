"use client"

import * as React from "react"
import { IconAlertCircle, IconBox, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
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
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useInventory } from "@/app/queries/inventory.queries"
import { useProductTypes } from "@/app/queries/product-types.queries"
import { InventoryModelProductsModal } from "@/app/dashboard/inventory/components/inventory-model-products-modal"
import { useAccessoryStockList } from "@/app/queries/accessory-stock.queries"
import { useOrgContext } from "@/app/queries/org-context.queries"

const MIN_STOCK_DEFAULT = 10

export default function InventoryPage() {
  const [tab, setTab] = React.useState<"gadgets" | "accessories">("gadgets")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [selectedModel, setSelectedModel] = React.useState<{
    productModelId: string
    productModelName: string
    productTypeName: string
  } | null>(null)

  const { data: orgContext } = useOrgContext()
  const isAdminOrganization = orgContext?.isAdminOrganization ?? false

  const { data: productTypesData } = useProductTypes()

  const inventoryQuery = React.useMemo(
    () => ({
      productTypeId: typeFilter === "all" ? undefined : typeFilter,
    }),
    [typeFilter]
  )

  const { data: inventoryData, isLoading } = useInventory(inventoryQuery)

  const { data: accessoryStockData, isLoading: accessoriesLoading } = useAccessoryStockList(
    {},
    { enabled: tab === "accessories" }
  )

  // For admin org, get warehouse (current branch) stock separately
  const { data: warehouseStockData, isLoading: warehouseLoading } = useAccessoryStockList(
    { branchId: orgContext?.activeOrganizationId },
    { enabled: tab === "accessories" && isAdminOrganization }
  )

  const items = inventoryData?.items ?? []
  const totals = inventoryData?.totals ?? {
    total: 0,
    available: 0,
    sold: 0,
    brandNew: 0,
    secondHand: 0,
  }

  const healthyStockItems = items.filter((i) => i.total >= MIN_STOCK_DEFAULT).length
  const lowStockItems = items.filter((i) => i.total > 0 && i.total < MIN_STOCK_DEFAULT).length
  const criticalStockItems = items.filter((i) => i.total === 0).length

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <InventoryModelProductsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        productModelId={selectedModel?.productModelId ?? null}
        title={
          selectedModel
            ? `${selectedModel.productModelName} - ${selectedModel.productTypeName}`
            : "Products"
        }
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Monitor stock levels by product model
          </p>
        </div>
        {tab === "gadgets" ? (
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter by type" />
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
        ) : null}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="gadgets">Gadgets</TabsTrigger>
          <TabsTrigger value="accessories">Accessories</TabsTrigger>
        </TabsList>

        <TabsContent value="gadgets" className="mt-4 space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                <IconBox className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.total}</div>
                <p className="text-xs text-muted-foreground">
                  {typeFilter === "all"
                    ? "All product types"
                    : (productTypesData?.productTypes ?? []).find((t) => t.id === typeFilter)?.name}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Healthy Stock</CardTitle>
                <IconTrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{healthyStockItems}</div>
                <p className="text-xs text-muted-foreground">Products above minimum</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <IconTrendingDown className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
                <p className="text-xs text-muted-foreground">Need restocking soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
                <IconAlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{criticalStockItems}</div>
                <p className="text-xs text-muted-foreground">Immediate attention needed</p>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Levels</CardTitle>
              <CardDescription>
                {isLoading ? "Loading..." : `${items.length} model(s) found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">Sold</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Stock Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isLoading && items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No inventory found
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {items.map((item) => {
                    const stockPercentage = (item.total / MIN_STOCK_DEFAULT) * 100
                    const status =
                      item.total === 0
                        ? "critical"
                        : item.total < MIN_STOCK_DEFAULT
                          ? "low"
                          : "healthy"
                    return (
                      <TableRow key={item.productModelId}>
                        <TableCell
                          className="font-medium cursor-pointer"
                          onClick={() => {
                            setSelectedModel({
                              productModelId: item.productModelId,
                              productModelName: item.productModelName,
                              productTypeName: item.productTypeName,
                            })
                            setDetailsOpen(true)
                          }}
                        >
                          {item.productModelName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.productTypeName}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{item.available}</TableCell>
                        <TableCell className="text-center">{item.sold}</TableCell>
                        <TableCell className="text-center font-bold">{item.total}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              status === "healthy"
                                ? "border-green-600 text-green-600"
                                : status === "low"
                                  ? "border-yellow-600 text-yellow-600"
                                  : "border-red-600 text-red-600"
                            }
                          >
                            {status === "healthy" && "Healthy"}
                            {status === "low" && "Low Stock"}
                            {status === "critical" && "Critical"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={Math.min(stockPercentage, 100)} className="w-[100px]" />
                            <span className="text-sm text-muted-foreground">
                              {Math.round(stockPercentage)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessories" className="mt-4">
          {isAdminOrganization && (
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Warehouse Stock</CardTitle>
                  <IconBox className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {warehouseLoading ? "..." : (warehouseStockData?.stocks ?? []).reduce((sum, s) => sum + s.quantity, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Accessories in warehouse</p>
                </CardContent>
              </Card>
            </div>
          )}

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
                  {!accessoriesLoading && (accessoryStockData?.stocks ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No accessory stock found
                      </TableCell>
                    </TableRow>
                  ) : null}

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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
