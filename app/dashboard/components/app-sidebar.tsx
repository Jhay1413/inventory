"use client"

import * as React from "react"
import {
    IconBox,
    IconBuildingStore,
    IconChartBar,
    IconCurrencyDollar,
    IconDashboard,
    IconDeviceMobile,
    IconHelp,
    IconInnerShadowTop,
    IconPackage,
    IconReport,
    IconSearch,
    IconSettings,
    IconTransfer,
    IconTruck,
    IconUsers,
} from "@tabler/icons-react"


import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavDocuments } from "./nav-documents"
import { NavOperations } from "./nav-operations"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: IconDashboard,
        },
        {
            title: "Products",
            url: "/dashboard/products",
            icon: IconDeviceMobile,
        },
        {
            title: "Inventory",
            url: "/dashboard/inventory",
            icon: IconBox,
        },
        {
            title: "Sales",
            url: "/dashboard/sales",
            icon: IconCurrencyDollar,
        },
        {
            title: "Branches",
            url: "/dashboard/branches",
            icon: IconBuildingStore,
        },
    ],
    navOperations: [
        {
            title: "Transfers",
            icon: IconTransfer,
            isActive: true,
            url: "/dashboard/transfers",
            items: [
                {
                    title: "Pending Transfers",
                    url: "/dashboard/transfers/pending",
                },
                {
                    title: "Transfer History",
                    url: "/dashboard/transfers/history",
                },
                {
                    title: "New Transfer",
                    url: "/dashboard/transfers/new",
                },
            ],
        },
        {
            title: "Stock Management",
            icon: IconPackage,
            url: "/dashboard/stock",
            items: [
                {
                    title: "Stock Overview",
                    url: "/dashboard/stock/overview",
                },
                {
                    title: "Low Stock Alerts",
                    url: "/dashboard/stock/alerts",
                },
                {
                    title: "Restock Orders",
                    url: "/dashboard/stock/orders",
                },
            ],
        },
        {
            title: "Deliveries",
            icon: IconTruck,
            url: "/dashboard/deliveries",
            items: [
                {
                    title: "Incoming",
                    url: "/dashboard/deliveries/incoming",
                },
                {
                    title: "Outgoing",
                    url: "/dashboard/deliveries/outgoing",
                },
            ],
        },
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "#",
            icon: IconSettings,
        },
        {
            title: "Get Help",
            url: "#",
            icon: IconHelp,
        },
        {
            title: "Search",
            url: "#",
            icon: IconSearch,
        },
    ],
    documents: [
        {
            name: "Sales Reports",
            url: "/dashboard/reports/sales",
            icon: IconReport,
        },
        {
            name: "Inventory Reports",
            url: "/dashboard/reports/inventory",
            icon: IconBox,
        },
        {
            name: "Branch Performance",
            url: "/dashboard/reports/branches",
            icon: IconChartBar,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#">
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">R&G Gadgets</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavOperations items={data.navOperations} />
                <NavDocuments items={data.documents} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
