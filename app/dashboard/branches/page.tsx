"use client"

import * as React from "react"
import { IconBuildingStore, IconMapPin, IconPhone, IconUsers } from "@tabler/icons-react"
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
import { AddBranchModal } from "./components/add-branch-modal"
import type { Branch, BranchFormValues } from "@/types/branch"
import { useBranches, useCreateBranch } from "@/app/queries/branches.queries"

export default function BranchesPage() {
  const { data, isLoading, error } = useBranches()
  const createBranch = useCreateBranch()

  const branchesList: Branch[] = React.useMemo(() => {
    return (data?.branches ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      location: b.location ?? "—",
      phone: b.phone ?? "—",
      manager: b.manager ?? "—",
      employees: b.employees,
      totalStock: b.totalStock,
      monthlySales: b.monthlySales,
      revenue: b.revenue,
      status: b.status,
    }))
  }, [data])

  const totalBranches = branchesList.length
  const totalEmployees = branchesList.reduce((sum, branch) => sum + branch.employees, 0)
  const totalStock = branchesList.reduce((sum, branch) => sum + branch.totalStock, 0)
  const totalRevenue = branchesList.reduce((sum, branch) => sum + branch.revenue, 0)

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">
            Manage all store locations and their performance
          </p>
        </div>
        <AddBranchModal
          isSubmitting={createBranch.isPending}
          onAddBranch={async (values: BranchFormValues) => {
            await createBranch.mutateAsync(values)
          }}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <IconBuildingStore className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBranches}</div>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Across all branches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <IconBuildingStore className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">Units in stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IconBuildingStore className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Branches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Branches</CardTitle>
          <CardDescription>Overview of all store locations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-center">Employees</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Monthly Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-sm text-muted-foreground">
                    Loading branches...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-sm text-destructive">
                    {error instanceof Error ? error.message : "Failed to load branches"}
                  </TableCell>
                </TableRow>
              ) : branchesList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-sm text-muted-foreground">
                    No branches found.
                  </TableCell>
                </TableRow>
              ) : (
                branchesList.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <IconBuildingStore className="h-4 w-4 text-muted-foreground" />
                        {branch.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconMapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="max-w-[200px] truncate">{branch.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconPhone className="h-4 w-4 text-muted-foreground" />
                        {branch.phone}
                      </div>
                    </TableCell>
                    <TableCell>{branch.manager}</TableCell>
                    <TableCell className="text-center">{branch.employees}</TableCell>
                    <TableCell className="text-center">{branch.totalStock}</TableCell>
                    <TableCell className="text-center">{branch.monthlySales}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₱{branch.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {branch.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Branch Performance Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Branches</CardTitle>
            <CardDescription>By revenue this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {branchesList
                .slice()
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 3)
                .map((branch, index) => (
                  <div key={branch.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{branch.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {branch.monthlySales} sales
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">₱{branch.revenue.toLocaleString()}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
            <CardDescription>Stock levels by branch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {branchesList
                .slice()
                .sort((a, b) => b.totalStock - a.totalStock)
                .map((branch) => (
                  <div key={branch.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconBuildingStore className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium">{branch.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${totalStock > 0 ? (branch.totalStock / totalStock) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm font-medium w-12 text-right">
                        {branch.totalStock}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
