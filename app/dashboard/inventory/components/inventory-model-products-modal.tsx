"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

import { useProducts } from "@/app/queries/products.queries"
import { ProductAvailability, ProductCondition } from "@/types/api/products"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productModelId: string | null
  title?: string
}

export function InventoryModelProductsModal({ open, onOpenChange, productModelId, title }: Props) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [availability, setAvailability] = React.useState<string>("all")
  const [condition, setCondition] = React.useState<string>("all")
  const [defective, setDefective] = React.useState<"all" | "defective" | "notDefective">("all")

  React.useEffect(() => {
    if (open) return
    setSearch("")
    setStatus("")
    setAvailability("all")
    setCondition("all")
    setDefective("all")
  }, [open])

  const query = React.useMemo(
    () => ({
      limit: 50,
      offset: 0,
      productModelId: productModelId ?? undefined,
      search: search.trim() ? search.trim() : undefined,
      status: status.trim() ? status.trim() : undefined,
      availability: availability === "all" ? undefined : (availability as any),
      condition: condition === "all" ? undefined : (condition as any),
      isDefective:
        defective === "all" ? undefined : defective === "defective" ? true : false,
    }),
    [productModelId, search, status, availability, condition, defective]
  )

  const enabled = open && Boolean(productModelId)
  const { data, isLoading } = useProducts(query, { enabled })

  const products = data?.products ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{title ?? "Products"}</DialogTitle>
          <DialogDescription>
            List of products under this model. Use filters to narrow down by IMEI, status, condition, or availability.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-5">
          <Input
            placeholder="Search IMEI"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
       
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger>
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All availability</SelectItem>
              <SelectItem value={ProductAvailability.AVAILABLE}>Available</SelectItem>
              <SelectItem value={ProductAvailability.SOLD}>Sold</SelectItem>
            </SelectContent>
          </Select>

          <Select value={defective} onValueChange={(v) => setDefective(v as typeof defective)}>
            <SelectTrigger>
              <SelectValue placeholder="Defective" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="defective">Defective</SelectItem>
              <SelectItem value="notDefective">Not Defective</SelectItem>
            </SelectContent>
          </Select>

          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger>
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All condition</SelectItem>
              <SelectItem value={ProductCondition.BRAND_NEW}>Brand New</SelectItem>
              <SelectItem value={ProductCondition.SECOND_HAND}>Second Hand</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IMEI</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-center">RAM</TableHead>
                <TableHead className="text-center">Storage</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.imei}</TableCell>
                    <TableCell>{p.branch?.name ?? "—"}</TableCell>
                    <TableCell>{p.color}</TableCell>
                    <TableCell className="text-center">{p.ram}</TableCell>
                    <TableCell className="text-center">{p.storage}</TableCell>
                    <TableCell>
                      {p.isDefective ? (
                        <Badge variant="destructive">Defective</Badge>
                      ) : (
                        <Badge variant="outline">{p.condition}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.availability === ProductAvailability.AVAILABLE ? "default" : "secondary"}>
                        {p.availability}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
