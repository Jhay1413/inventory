"use client"

import { ChartAreaInteractive } from "./components/chart-area-interactive";
import { SectionCards } from "./components/section-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function Page() {
    // Recent activity data
    const recentActivity = [
        {
            id: "TXN-001",
            type: "Sale",
            branch: "Tacloban",
            product: "iPhone 15 Pro Max",
            amount: 74999,
            status: "Completed",
            time: "2 mins ago"
        },
        {
            id: "TXN-002",
            type: "Transfer",
            branch: "Catbalogan → Tacloban",
            product: "Samsung Galaxy S24",
            amount: 0,
            status: "In Transit",
            time: "15 mins ago"
        },
        {
            id: "TXN-003",
            type: "Sale",
            branch: "Borongan E.Samar",
            product: "MacBook Air M3",
            amount: 69999,
            status: "Completed",
            time: "28 mins ago"
        },
        {
            id: "TXN-004",
            type: "Delivery",
            branch: "Guiuan E.Samar",
            product: "AirPods Pro 2 (3 units)",
            amount: 44970,
            status: "Delivered",
            time: "1 hour ago"
        },
        {
            id: "TXN-005",
            type: "Sale",
            branch: "Catbalogan",
            product: "iPad Air M2",
            amount: 39999,
            status: "Completed",
            time: "2 hours ago"
        },
    ]

    // Top selling products
    const topProducts = [
        { name: "iPhone 15 Pro Max", sales: 45, revenue: 3374955, growth: 15 },
        { name: "Samsung Galaxy S24 Ultra", sales: 38, revenue: 2849962, growth: 12 },
        { name: "MacBook Air M3", sales: 28, revenue: 1959972, growth: 8 },
        { name: "iPad Air M2", sales: 32, revenue: 1279968, growth: -3 },
        { name: "AirPods Pro 2", sales: 67, revenue: 1003933, growth: 22 },
    ]

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
            </div>
            
            <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest transactions across all branches</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {activity.type}
                                            </Badge>
                                            <span className="text-sm font-medium">{activity.product}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{activity.branch}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                    <div className="text-right space-y-1">
                                        {activity.amount > 0 && (
                                            <p className="text-sm font-semibold">₱{activity.amount.toLocaleString()}</p>
                                        )}
                                        <Badge
                                            variant={activity.status === "Completed" || activity.status === "Delivered" ? "default" : "secondary"}
                                            className={
                                                activity.status === "Completed" || activity.status === "Delivered"
                                                    ? "bg-green-600 hover:bg-green-700 text-xs"
                                                    : "bg-blue-600 hover:bg-blue-700 text-xs"
                                            }
                                        >
                                            {activity.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Selling Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                        <CardDescription>Best performers this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {topProducts.map((product, index) => (
                                <div key={product.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">{product.sales} units sold</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">₱{product.revenue.toLocaleString()}</p>
                                            <p className={`text-xs ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {product.growth >= 0 ? '+' : ''}{product.growth}%
                                            </p>
                                        </div>
                                    </div>
                                    <Progress value={(product.sales / 70) * 100} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}