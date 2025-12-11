"use client"

import * as React from "react"
import { IconCalendar, IconCurrencyDollar, IconDeviceMobile, IconShoppingCart, IconTrendingUp } from "@tabler/icons-react"
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

// Mock sales data
const salesData = [
  {
    id: "1",
    date: "2025-11-22",
    product: "iPhone 15 Pro Max",
    type: "Apple",
    imei: "352468091234567",
    condition: "BrandNew",
    price: 1199,
    customer: "John Doe",
    branch: "Tacloban",
    status: "Completed",
    paymentType: "Cash",
    downpayment: 0,
    balance: 0,
  },
  {
    id: "2",
    date: "2025-11-22",
    product: "Samsung Galaxy S24 Ultra",
    type: "Android",
    imei: "359876543210987",
    condition: "BrandNew",
    price: 1099,
    customer: "Jane Smith",
    branch: "Catbalogan",
    status: "Completed",
    paymentType: "Credit Card",
    downpayment: 0,
    balance: 0,
  },
  {
    id: "3",
    date: "2025-11-21",
    product: "iPhone 14 Pro",
    type: "Apple",
    imei: "351234567890123",
    condition: "SecondHand",
    price: 799,
    customer: "Mike Johnson",
    branch: "Tacloban",
    status: "Completed",
    paymentType: "Installment",
    downpayment: 200,
    balance: 599,
  },
  {
    id: "4",
    date: "2025-11-21",
    product: "Google Pixel 8 Pro",
    type: "Android",
    imei: "356789012345678",
    condition: "BrandNew",
    price: 899,
    customer: "Sarah Williams",
    branch: "Guiuan E.Samar",
    status: "Completed",
    paymentType: "Installment",
    downpayment: 300,
    balance: 599,
  },
  {
    id: "5",
    date: "2025-11-20",
    product: "iPhone 13",
    type: "Apple",
    imei: "358901234567890",
    condition: "SecondHand",
    price: 499,
    customer: "Tom Brown",
    branch: "Catbalogan",
    status: "Completed",
    paymentType: "Cash",
    downpayment: 0,
    balance: 0,
  },
  {
    id: "6",
    date: "2025-11-20",
    product: "OnePlus 12",
    type: "Android",
    imei: "357890123456789",
    condition: "BrandNew",
    price: 749,
    customer: "Emma Davis",
    branch: "Borongan E.Samar",
    status: "Completed",
    paymentType: "Credit Card",
    downpayment: 0,
    balance: 0,
  },
  {
    id: "7",
    date: "2025-11-19",
    product: "iPhone 15",
    type: "Apple",
    imei: "354567890123456",
    condition: "BrandNew",
    price: 999,
    customer: "Chris Wilson",
    branch: "Tacloban",
    status: "Pending",
    paymentType: "Installment",
    downpayment: 250,
    balance: 749,
  },
]

const branches = [
  { id: "all", name: "All Branches" },
  { id: "tacloban", name: "Tacloban" },
  { id: "catbalogan", name: "Catbalogan" },
  { id: "guiuan", name: "Guiuan E.Samar" },
  { id: "borongan", name: "Borongan E.Samar" },
]

export default function SalesPage() {
  const [branchFilter, setBranchFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [dateFilter, setDateFilter] = React.useState("all")
  const [paymentFilter, setPaymentFilter] = React.useState("all")

  const filteredSales = salesData.filter((sale) => {
    const matchesBranch = branchFilter === "all" || sale.branch === branches.find(b => b.id === branchFilter)?.name
    const matchesType = typeFilter === "all" || sale.type === typeFilter
    const matchesPayment = paymentFilter === "all" || sale.paymentType === paymentFilter
    
    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = sale.date === "2025-11-22"
    } else if (dateFilter === "week") {
      matchesDate = new Date(sale.date) >= new Date("2025-11-18")
    }

    return matchesBranch && matchesType && matchesDate && matchesPayment
  })

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.price, 0)
  const totalSales = filteredSales.length
  const completedSales = filteredSales.filter(s => s.status === "Completed").length
  const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">
            Track and analyze sales across all branches
          </p>
        </div>
        <Button>
          <IconShoppingCart className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {branchFilter === "all" ? "All branches" : branches.find(b => b.id === branchFilter)?.name}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {completedSales} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Sale Value</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{avgSaleValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
            <IconDeviceMobile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSales}</div>
            <p className="text-xs text-muted-foreground">Gadgets sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter sales by branch, type, date, and payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Apple">Apple</SelectItem>
                <SelectItem value="Android">Android</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Types</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="Installment">Installment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>
            {filteredSales.length} sale(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead className="text-right">Downpayment</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(sale.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{sale.product}</TableCell>
                  <TableCell>
                    <Badge variant={sale.type === "Apple" ? "default" : "secondary"}>
                      {sale.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{sale.imei}</TableCell>
                  <TableCell>
                    <Badge variant={sale.condition === "BrandNew" ? "default" : "outline"}>
                      {sale.condition === "BrandNew" ? "Brand New" : "Second Hand"}
                    </Badge>
                  </TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.branch}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        sale.paymentType === "Cash"
                          ? "border-green-600 text-green-600"
                          : sale.paymentType === "Credit Card"
                          ? "border-blue-600 text-blue-600"
                          : "border-orange-600 text-orange-600"
                      }
                    >
                      {sale.paymentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {sale.paymentType === "Installment" ? (
                      <span className="font-semibold">₱{sale.downpayment.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {sale.paymentType === "Installment" ? (
                      <span className="font-semibold text-orange-600">₱{sale.balance.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={sale.status === "Completed" ? "default" : "secondary"}
                      className={
                        sale.status === "Completed"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-yellow-600 hover:bg-yellow-700"
                      }
                    >
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₱{sale.price.toLocaleString()}
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
