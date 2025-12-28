"use client"

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

import { useReturns, useUpdateReturn } from "@/app/queries/returns.queries"
import { ReturnStatus, type ReturnWithRelations } from "@/types/api/returns"

const PER_PAGE = 15

function statusBadge(status: ReturnWithRelations["status"]) {
  if (status === ReturnStatus.COMPLETED) return <Badge variant="default">Completed</Badge>
  if (status === ReturnStatus.REJECTED) return <Badge variant="destructive">Rejected</Badge>
  if (status === ReturnStatus.PROCESSING) return <Badge variant="secondary">Processing</Badge>
  return <Badge variant="outline">Open</Badge>
}

export default function ReturnsPage() {
  const [status, setStatus] = React.useState<string>("all")
  const [page, setPage] = React.useState(1)

  const updateReturn = useUpdateReturn()

  React.useEffect(() => {
    setPage(1)
  }, [status])

  const query = React.useMemo(
    () => ({
      limit: PER_PAGE,
      offset: (page - 1) * PER_PAGE,
      status: status === "all" ? undefined : (status as any),
    }),
    [page, status]
  )

  const { data, isLoading, error } = useReturns(query)
  const rows = data?.returns ?? []
  const total = data?.pagination.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Returns</h1>
          <p className="text-muted-foreground">Defect returns for exchange or repair</p>
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value={ReturnStatus.OPEN}>Open</SelectItem>
            <SelectItem value={ReturnStatus.PROCESSING}>Processing</SelectItem>
            <SelectItem value={ReturnStatus.COMPLETED}>Completed</SelectItem>
            <SelectItem value={ReturnStatus.REJECTED}>Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Return requests</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${rows.length} return(s) on this page`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Failed to load returns"}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return ID</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isLoading && rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No returns found
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {rows.map((r) => {
                    const productCount = r.productItems?.length ?? 0
                    const accessoryCount = r.accessoryItems?.reduce((sum, it) => sum + it.quantity, 0) ?? 0

                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-mono text-xs">{r.invoiceId.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <div className="font-medium">{r.branch.name}</div>
                          <div className="text-xs text-muted-foreground">{r.branch.slug}</div>
                        </TableCell>
                        <TableCell>{statusBadge(r.status)}</TableCell>
                        <TableCell className="text-right">
                          {productCount} gadget(s){accessoryCount ? ` • ${accessoryCount} accessory` : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.status !== ReturnStatus.COMPLETED ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateReturn.mutate({ id: r.id, status: ReturnStatus.COMPLETED })}
                              disabled={updateReturn.isPending}
                            >
                              Mark completed
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {pageCount}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={page >= pageCount || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
