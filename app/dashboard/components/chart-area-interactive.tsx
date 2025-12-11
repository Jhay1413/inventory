"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "Sales revenue by branch"

const chartData = [
  { date: "2025-09-01", tacloban: 75000, catbalogan: 58000, guiuan: 42000, borongan: 51000 },
  { date: "2025-09-02", tacloban: 82000, catbalogan: 61000, guiuan: 39000, borongan: 55000 },
  { date: "2025-09-03", tacloban: 78000, catbalogan: 59000, guiuan: 44000, borongan: 53000 },
  { date: "2025-09-04", tacloban: 89000, catbalogan: 65000, guiuan: 47000, borongan: 58000 },
  { date: "2025-09-05", tacloban: 92000, catbalogan: 68000, guiuan: 49000, borongan: 61000 },
  { date: "2025-09-06", tacloban: 88000, catbalogan: 64000, guiuan: 45000, borongan: 57000 },
  { date: "2025-09-07", tacloban: 85000, catbalogan: 62000, guiuan: 43000, borongan: 54000 },
  { date: "2025-09-08", tacloban: 95000, catbalogan: 71000, guiuan: 51000, borongan: 64000 },
  { date: "2025-09-09", tacloban: 91000, catbalogan: 67000, guiuan: 48000, borongan: 60000 },
  { date: "2025-09-10", tacloban: 87000, catbalogan: 63000, guiuan: 46000, borongan: 56000 },
  { date: "2025-09-11", tacloban: 93000, catbalogan: 69000, guiuan: 50000, borongan: 62000 },
  { date: "2025-09-12", tacloban: 89000, catbalogan: 65000, guiuan: 47000, borongan: 58000 },
  { date: "2025-09-13", tacloban: 96000, catbalogan: 72000, guiuan: 52000, borongan: 65000 },
  { date: "2025-09-14", tacloban: 84000, catbalogan: 61000, guiuan: 44000, borongan: 55000 },
  { date: "2025-09-15", tacloban: 90000, catbalogan: 66000, guiuan: 48000, borongan: 59000 },
  { date: "2025-09-16", tacloban: 86000, catbalogan: 63000, guiuan: 45000, borongan: 56000 },
  { date: "2025-09-17", tacloban: 98000, catbalogan: 74000, guiuan: 53000, borongan: 67000 },
  { date: "2025-09-18", tacloban: 94000, catbalogan: 70000, guiuan: 51000, borongan: 63000 },
  { date: "2025-09-19", tacloban: 91000, catbalogan: 67000, guiuan: 49000, borongan: 60000 },
  { date: "2025-09-20", tacloban: 87000, catbalogan: 64000, guiuan: 46000, borongan: 57000 },
  { date: "2025-09-21", tacloban: 92000, catbalogan: 68000, guiuan: 50000, borongan: 61000 },
  { date: "2025-09-22", tacloban: 88000, catbalogan: 65000, guiuan: 47000, borongan: 58000 },
  { date: "2025-09-23", tacloban: 95000, catbalogan: 71000, guiuan: 52000, borongan: 64000 },
  { date: "2025-09-24", tacloban: 99000, catbalogan: 75000, guiuan: 54000, borongan: 68000 },
  { date: "2025-09-25", tacloban: 93000, catbalogan: 69000, guiuan: 50000, borongan: 62000 },
  { date: "2025-09-26", tacloban: 89000, catbalogan: 66000, guiuan: 48000, borongan: 59000 },
  { date: "2025-09-27", tacloban: 97000, catbalogan: 73000, guiuan: 53000, borongan: 66000 },
  { date: "2025-09-28", tacloban: 91000, catbalogan: 67000, guiuan: 49000, borongan: 60000 },
  { date: "2025-09-29", tacloban: 94000, catbalogan: 70000, guiuan: 51000, borongan: 63000 },
  { date: "2025-09-30", tacloban: 100000, catbalogan: 76000, guiuan: 55000, borongan: 69000 },
  { date: "2025-10-01", tacloban: 96000, catbalogan: 72000, guiuan: 52000, borongan: 65000 },
  { date: "2025-10-02", tacloban: 92000, catbalogan: 68000, guiuan: 50000, borongan: 61000 },
  { date: "2025-10-03", tacloban: 98000, catbalogan: 74000, guiuan: 53000, borongan: 67000 },
  { date: "2025-10-04", tacloban: 101000, catbalogan: 77000, guiuan: 56000, borongan: 70000 },
  { date: "2025-10-05", tacloban: 105000, catbalogan: 80000, guiuan: 58000, borongan: 73000 },
  { date: "2025-10-06", tacloban: 102000, catbalogan: 78000, guiuan: 56000, borongan: 71000 },
  { date: "2025-10-07", tacloban: 99000, catbalogan: 75000, guiuan: 54000, borongan: 68000 },
  { date: "2025-10-08", tacloban: 103000, catbalogan: 79000, guiuan: 57000, borongan: 72000 },
  { date: "2025-10-09", tacloban: 100000, catbalogan: 76000, guiuan: 55000, borongan: 69000 },
  { date: "2025-10-10", tacloban: 97000, catbalogan: 73000, guiuan: 53000, borongan: 66000 },
  { date: "2025-10-11", tacloban: 104000, catbalogan: 80000, guiuan: 58000, borongan: 73000 },
  { date: "2025-10-12", tacloban: 101000, catbalogan: 77000, guiuan: 56000, borongan: 70000 },
  { date: "2025-10-13", tacloban: 106000, catbalogan: 81000, guiuan: 59000, borongan: 74000 },
  { date: "2025-10-14", tacloban: 98000, catbalogan: 74000, guiuan: 54000, borongan: 67000 },
  { date: "2025-10-15", tacloban: 102000, catbalogan: 78000, guiuan: 56000, borongan: 71000 },
  { date: "2025-10-16", tacloban: 99000, catbalogan: 75000, guiuan: 55000, borongan: 68000 },
  { date: "2025-10-17", tacloban: 107000, catbalogan: 82000, guiuan: 60000, borongan: 75000 },
  { date: "2025-10-18", tacloban: 104000, catbalogan: 80000, guiuan: 58000, borongan: 73000 },
  { date: "2025-10-19", tacloban: 101000, catbalogan: 77000, guiuan: 56000, borongan: 70000 },
  { date: "2025-10-20", tacloban: 98000, catbalogan: 74000, guiuan: 54000, borongan: 67000 },
  { date: "2025-10-21", tacloban: 103000, catbalogan: 79000, guiuan: 57000, borongan: 72000 },
  { date: "2025-10-22", tacloban: 100000, catbalogan: 76000, guiuan: 55000, borongan: 69000 },
  { date: "2025-10-23", tacloban: 105000, catbalogan: 81000, guiuan: 59000, borongan: 74000 },
  { date: "2025-10-24", tacloban: 108000, catbalogan: 83000, guiuan: 61000, borongan: 76000 },
  { date: "2025-10-25", tacloban: 104000, catbalogan: 80000, guiuan: 58000, borongan: 73000 },
  { date: "2025-10-26", tacloban: 101000, catbalogan: 77000, guiuan: 56000, borongan: 70000 },
  { date: "2025-10-27", tacloban: 106000, catbalogan: 82000, guiuan: 60000, borongan: 75000 },
  { date: "2025-10-28", tacloban: 102000, catbalogan: 78000, guiuan: 57000, borongan: 71000 },
  { date: "2025-10-29", tacloban: 105000, catbalogan: 81000, guiuan: 59000, borongan: 74000 },
  { date: "2025-10-30", tacloban: 109000, catbalogan: 84000, guiuan: 62000, borongan: 77000 },
  { date: "2025-10-31", tacloban: 106000, catbalogan: 82000, guiuan: 60000, borongan: 75000 },
  { date: "2025-11-01", tacloban: 103000, catbalogan: 79000, guiuan: 58000, borongan: 72000 },
  { date: "2025-11-02", tacloban: 107000, catbalogan: 83000, guiuan: 61000, borongan: 76000 },
  { date: "2025-11-03", tacloban: 110000, catbalogan: 85000, guiuan: 63000, borongan: 78000 },
  { date: "2025-11-04", tacloban: 114000, catbalogan: 88000, guiuan: 65000, borongan: 81000 },
  { date: "2025-11-05", tacloban: 111000, catbalogan: 86000, guiuan: 64000, borongan: 79000 },
  { date: "2025-11-06", tacloban: 108000, catbalogan: 84000, guiuan: 62000, borongan: 77000 },
  { date: "2025-11-07", tacloban: 112000, catbalogan: 87000, guiuan: 64000, borongan: 80000 },
  { date: "2025-11-08", tacloban: 109000, catbalogan: 85000, guiuan: 63000, borongan: 78000 },
  { date: "2025-11-09", tacloban: 106000, catbalogan: 82000, guiuan: 61000, borongan: 75000 },
  { date: "2025-11-10", tacloban: 113000, catbalogan: 88000, guiuan: 65000, borongan: 81000 },
  { date: "2025-11-11", tacloban: 110000, catbalogan: 86000, guiuan: 64000, borongan: 79000 },
  { date: "2025-11-12", tacloban: 115000, catbalogan: 89000, guiuan: 66000, borongan: 82000 },
  { date: "2025-11-13", tacloban: 107000, catbalogan: 83000, guiuan: 62000, borongan: 76000 },
  { date: "2025-11-14", tacloban: 111000, catbalogan: 87000, guiuan: 64000, borongan: 80000 },
  { date: "2025-11-15", tacloban: 108000, catbalogan: 84000, guiuan: 63000, borongan: 77000 },
  { date: "2025-11-16", tacloban: 116000, catbalogan: 90000, guiuan: 67000, borongan: 83000 },
  { date: "2025-11-17", tacloban: 113000, catbalogan: 88000, guiuan: 65000, borongan: 81000 },
  { date: "2025-11-18", tacloban: 110000, catbalogan: 86000, guiuan: 64000, borongan: 79000 },
  { date: "2025-11-19", tacloban: 107000, catbalogan: 83000, guiuan: 62000, borongan: 76000 },
  { date: "2025-11-20", tacloban: 112000, catbalogan: 87000, guiuan: 65000, borongan: 80000 },
  { date: "2025-11-21", tacloban: 109000, catbalogan: 85000, guiuan: 63000, borongan: 78000 },
  { date: "2025-11-22", tacloban: 114000, catbalogan: 89000, guiuan: 66000, borongan: 82000 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
  },
  tacloban: {
    label: "Tacloban",
    color: "hsl(var(--chart-1))",
  },
  catbalogan: {
    label: "Catbalogan",
    color: "hsl(var(--chart-2))",
  },
  guiuan: {
    label: "Guiuan E.Samar",
    color: "hsl(var(--chart-3))",
  },
  borongan: {
    label: "Borongan E.Samar",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2025-11-22")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Sales Revenue by Branch</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Daily revenue across all branches
          </span>
          <span className="@[540px]/card:hidden">Revenue by branch</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="borongan"
              type="natural"
              fill="hsl(var(--chart-4))"
              fillOpacity={0.4}
              stroke="hsl(var(--chart-4))"
              stackId="a"
            />
            <Area
              dataKey="guiuan"
              type="natural"
              fill="hsl(var(--chart-3))"
              fillOpacity={0.4}
              stroke="hsl(var(--chart-3))"
              stackId="a"
            />
            <Area
              dataKey="catbalogan"
              type="natural"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.4}
              stroke="hsl(var(--chart-2))"
              stackId="a"
            />
            <Area
              dataKey="tacloban"
              type="natural"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.4}
              stroke="hsl(var(--chart-1))"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
