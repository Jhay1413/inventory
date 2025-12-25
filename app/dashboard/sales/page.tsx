"use client"

import * as React from "react"
import { IconCalendar, IconDeviceMobile, IconReceipt } from "@tabler/icons-react"
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
import { useProductTypes } from "@/app/queries/product-types.queries"
import { useProductStats } from "@/app/queries/product-stats.queries"
import { useInvoices, useInvoiceStats } from "@/app/queries/invoices.queries"
import { useOrganizations } from "@/app/queries/organizations.queries"
import { AddSaleModal } from "@/app/dashboard/sales/components/add-sale-modal"
import { UpdateInvoiceModal } from "@/app/dashboard/sales/components/update-invoice-modal"
import { authClient } from "@/app/lib/auth-client"
import { ViewInvoiceModal } from "./components/view-invoice-modal"

type ConditionFilter = "all" | "BrandNew" | "SecondHand"

export default function SalesPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [conditionFilter, setConditionFilter] = React.useState<ConditionFilter>("all")
  const [branchFilter, setBranchFilter] = React.useState("all")

  const { data: productTypesData } = useProductTypes()
  const { data: statsData, isLoading: statsLoading } = useProductStats()

  const { data: activeOrganization } = authClient.useActiveOrganization()

  const isAdminOrganization = React.useMemo(() => {
    const raw = (activeOrganization as any)?.metadata
    if (!raw) return false
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw
      return parsed?.isAdminOrganization === true
    } catch {
      return false
    }
  }, [activeOrganization])

  const { data: orgData, isLoading: orgsLoading } = useOrganizations({
    enabled: isAdminOrganization,
  })

  const selectedBranchId = React.useMemo(() => {
    if (!isAdminOrganization) return undefined
    return branchFilter === "all" ? undefined : branchFilter
  }, [branchFilter, isAdminOrganization])

  const listFilters = React.useMemo(
    () => ({
      limit: 100,
      offset: 0,
      search: searchQuery.trim() || undefined,
      branchId: selectedBranchId,
      productTypeId: typeFilter === "all" ? undefined : typeFilter,
      condition: conditionFilter === "all" ? undefined : conditionFilter,
    }),
    [conditionFilter, searchQuery, selectedBranchId, typeFilter]
  )

  const { data: invoicesData, isLoading } = useInvoices(listFilters)
  const invoices = invoicesData?.invoices ?? []

  const { data: invoiceStats, isLoading: invoiceStatsLoading } = useInvoiceStats(
    selectedBranchId ? { branchId: selectedBranchId } : undefined
  )
  const soldCount = statsData?.stats.sold ?? 0

  const subtitle = isAdminOrganization
    ? selectedBranchId
      ? "Sold items for the selected branch"
      : "Sold items across all branches"
    : "Sold items for the selected branch"

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <AddSaleModal />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <IconReceipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoiceStatsLoading ? "..." : (invoiceStats?.totalSales ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Sales</CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoiceStatsLoading ? "..." : (invoiceStats?.todaySales ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoiceStatsLoading ? "" : `${invoiceStats?.todayCount ?? 0} sale(s)`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Sales</CardTitle>
            <IconDeviceMobile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoiceStatsLoading ? "..." : (invoiceStats?.weeklySales ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoiceStatsLoading ? "" : `${invoiceStats?.weeklyCount ?? 0} sale(s)`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter sold items by type, condition, or search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${isAdminOrganization ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
            <Input
              placeholder="Search by model or IMEI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {isAdminOrganization ? (
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {(orgData?.organizations ?? []).map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

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

            <Select value={conditionFilter} onValueChange={(v) => setConditionFilter(v as ConditionFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="BrandNew">Brand New</SelectItem>
                <SelectItem value="SecondHand">Second Hand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sold Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sold Items</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${invoices.length} sale(s) found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sold Date</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Sales price</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    No sold items found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{inv.branch.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{inv.product.productModel.productType.name}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{inv.product.productModel.name}</TableCell>
                    <TableCell className="font-mono text-sm">{inv.product.imei}</TableCell>
                    <TableCell>
                      <Badge
                        variant={inv.product.condition === "BrandNew" ? "default" : "outline"}
                      >
                        {inv.product.condition === "BrandNew" ? "Brand New" : "Second Hand"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{inv.salePrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{inv.paymentType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === "Paid"
                            ? "default"
                            : inv.status === "Cancelled"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {inv.status === "PartiallyPaid" ? "Partially Paid" : inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ViewInvoiceModal invoiceId={inv.id} />
                        <UpdateInvoiceModal invoiceId={inv.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
