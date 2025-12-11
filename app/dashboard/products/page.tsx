"use client"

import * as React from "react"
import { IconDeviceMobile, IconFilter, IconPlus, IconSearch } from "@tabler/icons-react"
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
import type { GadgetFormValues } from "./types"

// Mock data for demonstration
const gadgets = [
  {
    id: "1",
    type: "Apple",
    model: "iPhone 15 Pro Max",
    imei: "352468091234567",
    condition: "BrandNew",
    availability: "Available",
    status: "Perfect",
    branch: "Main Branch",
    price: "₱1,199",
  },
  {
    id: "2",
    type: "Android",
    model: "Samsung Galaxy S24 Ultra",
    imei: "359876543210987",
    condition: "BrandNew",
    availability: "Available",
    status: "Perfect",
    branch: "Downtown",
    price: "₱1,099",
  },
  {
    id: "3",
    type: "Apple",
    model: "iPhone 14 Pro",
    imei: "351234567890123",
    condition: "SecondHand",
    availability: "Available",
    status: "Minor Scratches",
    branch: "Main Branch",
    price: "₱799",
  },
  {
    id: "4",
    type: "Android",
    model: "Google Pixel 8 Pro",
    imei: "356789012345678",
    condition: "BrandNew",
    availability: "Sold",
    status: "Perfect",
    branch: "Guiuan E.Samar",
    price: "₱899",
  },
  {
    id: "5",
    type: "Apple",
    model: "iPhone 13",
    imei: "358901234567890",
    condition: "SecondHand",
    availability: "Available",
    status: "Screen Damage",
    branch: "Downtown",
    price: "₱499",
  },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [conditionFilter, setConditionFilter] = React.useState("all")
  const [availabilityFilter, setAvailabilityFilter] = React.useState("all")
  const [gadgetsList, setGadgetsList] = React.useState(gadgets)

  const handleAddGadget = (newGadget: GadgetFormValues) => {
    const gadget = {
      id: String(gadgetsList.length + 1),
      type: newGadget.type,
      model: newGadget.model,
      imei: newGadget.imei,
      condition: newGadget.condition,
      availability: newGadget.availability,
      status: newGadget.status,
      branch: newGadget.branch,
      price: `₱${newGadget.price.toLocaleString()}`,
    }
    setGadgetsList([...gadgetsList, gadget])
  }

  const filteredGadgets = gadgetsList.filter((gadget) => {
    const matchesSearch =
      gadget.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gadget.imei.includes(searchQuery)
    const matchesType = typeFilter === "all" || gadget.type === typeFilter
    const matchesCondition =
      conditionFilter === "all" || gadget.condition === conditionFilter
    const matchesAvailability =
      availabilityFilter === "all" || gadget.availability === availabilityFilter

    return matchesSearch && matchesType && matchesCondition && matchesAvailability
  })

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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gadgets</CardTitle>
            <IconDeviceMobile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gadgetsList.length}</div>
            <p className="text-xs text-muted-foreground">All products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <IconDeviceMobile className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gadgetsList.filter((g) => g.availability === "Available").length}
            </div>
            <p className="text-xs text-muted-foreground">In stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
            <IconDeviceMobile className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gadgetsList.filter((g) => g.availability === "Sold").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand New</CardTitle>
            <IconDeviceMobile className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gadgetsList.filter((g) => g.condition === "BrandNew").length}
            </div>
            <p className="text-xs text-muted-foreground">New items</p>
          </CardContent>
        </Card>
      </div>

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
                <SelectItem value="Apple">Apple</SelectItem>
                <SelectItem value="Android">Android</SelectItem>
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
            {filteredGadgets.length} gadget(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>IMEI</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGadgets.map((gadget) => (
                <TableRow key={gadget.id}>
                  <TableCell>
                    <Badge variant={gadget.type === "Apple" ? "default" : "secondary"}>
                      {gadget.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{gadget.model}</TableCell>
                  <TableCell className="font-mono text-sm">{gadget.imei}</TableCell>
                  <TableCell>
                    <Badge
                      variant={gadget.condition === "BrandNew" ? "default" : "outline"}
                    >
                      {gadget.condition === "BrandNew" ? "Brand New" : "Second Hand"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={gadget.availability === "Available" ? "default" : "secondary"}
                      className={
                        gadget.availability === "Available"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }
                    >
                      {gadget.availability}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={gadget.status === "Perfect" ? "default" : "destructive"}
                      className={
                        gadget.status === "Perfect"
                          ? "bg-green-600 hover:bg-green-700"
                          : gadget.status.includes("Minor")
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : ""
                      }
                    >
                      {gadget.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{gadget.branch}</TableCell>
                  <TableCell className="font-semibold">{gadget.price}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
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
