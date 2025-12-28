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
import { useOrgContext } from "@/app/queries/org-context.queries"

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
            title: "Gadgets & Accessories",
            url: "/dashboard/products",
            icon: IconDeviceMobile,
        },
        {
            title: "Manage Types & Models",
            url: "/dashboard/products/manage",
            icon: IconPackage,
        },
        {
            title: "Inventory Management",
            url: "/dashboard/inventory",
            icon: IconBox,
        },
        {
            title: "Sales",
            url: "/dashboard/sales",
            icon: IconCurrencyDollar,
        },
        {
            title: "Returns",
            url: "/dashboard/returns",
            icon: IconReport,
        },
        {
            title: "Branches",
            url: "/dashboard/branches",
            icon: IconBuildingStore,
        },
        {
            title: "Users",
            url: "/dashboard/users",
            icon: IconUsers,
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
                    title: "Incoming",
                    url: "/dashboard/transfers/incoming",
                },
                {
                    title: "Pending",
                    url: "/dashboard/transfers/pending",
                },
                {
                    title: "History",
                    url: "/dashboard/transfers/history",
                },
                {
                    title: "Create Transfer",
                    url: "/dashboard/transfers/new",
                },
            ],
        },
        {
            title: "Stock",
            icon: IconPackage,
            url: "/dashboard/stock",
            items: [
                {
                    title: "Overview",
                    url: "/dashboard/stock/overview",
                },
                {
                    title: "Alerts",
                    url: "/dashboard/stock/alerts",
                },
                {
                    title: "Orders",
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

const nonAdminData = {
    navMain: [
        {
            title: "Branch Dashboard",
            url: "/dashboard/branch",
            icon: IconDashboard,
        },
        {
            title: "Gadgets & Accessories",
            url: "/dashboard/products",
            icon: IconDeviceMobile,
        },
        {
            title: "Inventory Management",
            url: "/dashboard/inventory",
            icon: IconBox,
        },
        {
            title: "Sales",
            url: "/dashboard/sales",
            icon: IconCurrencyDollar,
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
                    title: "Incoming",
                    url: "/dashboard/transfers/incoming",
                },
                {
                    title: "Pending",
                    url: "/dashboard/transfers/pending",
                },
                {
                    title: "History",
                    url: "/dashboard/transfers/history",
                },
                {
                    title: "Create Transfer",
                    url: "/dashboard/transfers/new",
                },
            ],
        },
    ],
}

export function AppSidebar({ isAdminOrganization, ...props }: React.ComponentProps<typeof Sidebar> & { isAdminOrganization?: boolean }) {
    const org = useOrgContext(isAdminOrganization === undefined)
    const resolvedIsAdmin = isAdminOrganization ?? org.data?.isAdminOrganization ?? false

    const navMain = resolvedIsAdmin ? data.navMain : nonAdminData.navMain
    const navOperations = resolvedIsAdmin ? data.navOperations : nonAdminData.navOperations

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
                <NavMain items={navMain} />
                <NavOperations items={navOperations} />
                {resolvedIsAdmin ? (
                    <>
                        <NavDocuments items={data.documents} />
                        <NavSecondary items={data.navSecondary} className="mt-auto" />
                    </>
                ) : null}
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}
