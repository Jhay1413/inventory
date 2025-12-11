"use client"

import * as React from "react"
import { IconAlertTriangle, IconBell } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
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

const lowStockAlerts = [
  {
    id: "1",
    product: "Google Pixel 8 Pro",
    type: "Android",
    currentStock: 8,
    minStock: 10,
    branch: "All Branches",
    deficit: 2,
    priority: "Medium",
    lastRestocked: "2025-11-15",
  },
  {
    id: "2",
    product: "iPhone 13",
    type: "Apple",
    currentStock: 3,
    minStock: 10,
    branch: "All Branches",
    deficit: 7,
    priority: "High",
    lastRestocked: "2025-11-10",
  },
  {
    id: "3",
    product: "iPhone 14 Pro",
    type: "Apple",
    currentStock: 2,
    minStock: 5,
    branch: "Westside",
    deficit: 3,
    priority: "Medium",
    lastRestocked: "2025-11-18",
  },
  {
    id: "4",
    product: "Samsung Galaxy S24 Ultra",
    type: "Android",
    currentStock: 1,
    minStock: 3,
    branch: "Downtown",
    deficit: 2,
    priority: "High",
    lastRestocked: "2025-11-12",
  },
]

export default function LowStockAlertsPage() {
  const highPriorityAlerts = lowStockAlerts.filter(a => a.priority === "High").length
  const mediumPriorityAlerts = lowStockAlerts.filter(a => a.priority === "Medium").length

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
          <p className="text-muted-foreground">
            Products that need immediate attention
          </p>
        </div>
        <Button>
          <IconBell className="mr-2 h-4 w-4" />
          Configure Alerts
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Active alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highPriorityAlerts}</div>
            <p className="text-xs text-muted-foreground">Urgent action needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mediumPriorityAlerts}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>Products below minimum stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-center">Current Stock</TableHead>
                <TableHead className="text-center">Min Required</TableHead>
                <TableHead className="text-center">Deficit</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.product}</TableCell>
                  <TableCell>
                    <Badge variant={alert.type === "Apple" ? "default" : "secondary"}>
                      {alert.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{alert.branch}</TableCell>
                  <TableCell className="text-center font-semibold">{alert.currentStock}</TableCell>
                  <TableCell className="text-center">{alert.minStock}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="destructive">-{alert.deficit}</Badge>
                  </TableCell>
                  <TableCell>{new Date(alert.lastRestocked).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        alert.priority === "High"
                          ? "border-red-600 text-red-600"
                          : "border-yellow-600 text-yellow-600"
                      }
                    >
                      {alert.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm">Create Order</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Settings</CardTitle>
          <CardDescription>Configure when to receive low stock alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when stock falls below minimum
                  </p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Auto-Reorder</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically create restock orders for critical items
                  </p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
