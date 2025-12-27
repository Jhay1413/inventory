"use client"

import * as React from "react"

import { IconMail, type Icon } from "@tabler/icons-react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { authClient } from "@/app/lib/auth-client"
import { useOrgContext } from "@/app/queries/org-context.queries"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isSwitchingBranch, setIsSwitchingBranch] = React.useState(false)

  const { data: orgContext } = useOrgContext(true)
  const {
    data: organizations,
    isPending: isOrganizationsPending,
    error: organizationsError,
  } = authClient.useListOrganizations()

  const activeOrganizationId = orgContext?.activeOrganizationId
  const selectedOrganizationId = React.useMemo(() => {
    if (!activeOrganizationId) return undefined
    if (!organizations || organizations.length === 0) return undefined
    return organizations.some((o) => o.id === activeOrganizationId)
      ? activeOrganizationId
      : undefined
  }, [activeOrganizationId, organizations])

  const handleBranchChange = async (organizationId: string) => {
    const org = organizations?.find((o) => o.id === organizationId)
    if (!org) return

    setIsSwitchingBranch(true)
    const { error } = await authClient.organization.setActive({
      organizationId: org.id,
      organizationSlug: org.slug,
    })
    setIsSwitchingBranch(false)

    if (error) {
      toast("Failed to select branch: " + error.message)
      return
    }

    await queryClient.invalidateQueries()
    router.refresh()
  }
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Select
              value={selectedOrganizationId}
              onValueChange={handleBranchChange}
              disabled={
                isOrganizationsPending ||
                isSwitchingBranch ||
                !!organizationsError ||
                !organizations ||
                organizations.length === 0
              }
            >
              <SelectTrigger
                aria-label="Select branch"
                className="w-full h-8 px-2 border border-border bg-transparent shadow-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!"
              >
                <SelectValue
                  placeholder={
                    isOrganizationsPending
                      ? "Loading branches…"
                      : organizationsError
                        ? "Failed to load branches"
                        : "Select branch"
                  }
                />
              </SelectTrigger>
              <SelectContent align="start" className="border border-border">
                {organizations?.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild isActive={pathname === item.url}>
                <a href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
