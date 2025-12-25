import { IconTrendingDown, IconTrendingUp, IconDeviceMobile, IconAlertCircle, IconTruck, IconTransfer } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards(props: {
  totalRevenue: number
  totalInventory: number
  lowStockAlerts: number
  pendingDeliveries: number
  revenueScopeLabel: string
  revenueScopeDetail: string
  inventoryScopeDetail: string
}) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 py-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ₱{props.totalRevenue.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {props.revenueScopeLabel} <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {props.revenueScopeDetail}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Inventory</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {props.totalInventory.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconDeviceMobile />
              Units
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Stock across branches <IconDeviceMobile className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {props.inventoryScopeDetail}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Low Stock Alerts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {props.lowStockAlerts.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-orange-600 text-orange-600">
              <IconAlertCircle />
              Urgent
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium text-orange-600">
            Needs restocking <IconAlertCircle className="size-4" />
          </div>
          <div className="text-muted-foreground">Items below threshold</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Deliveries</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {props.pendingDeliveries.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-blue-600 text-blue-600">
              <IconTruck />
              In Transit
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active shipments <IconTruck className="size-4" />
          </div>
          <div className="text-muted-foreground">Incoming & outgoing</div>
        </CardFooter>
      </Card>
    </div>
  )
}
