"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconBuilding,
  IconBuildingCommunity,
  IconBuildingStore,
  IconBuildingWarehouse,
  type TablerIcon,
} from "@tabler/icons-react"

import { authClient } from "@/app/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function getBranchIcon(branch: { name?: string; slug?: string }): TablerIcon {
  const key = `${branch.slug ?? ""} ${branch.name ?? ""}`.toLowerCase()
  if (key.includes("warehouse")) return IconBuildingWarehouse
  if (key.includes("tacloban")) return IconBuildingStore
  if (key.includes("catbalogan")) return IconBuildingCommunity
  if (key.includes("guian") || key.includes("guiuan")) return IconBuilding
  if (key.includes("borongan")) return IconBuildingCommunity
  return IconBuildingStore
}

export default function SelectOrganizationPage() {
  const router = useRouter()
  const [isSelecting, setIsSelecting] = useState(false)

  const { data: organizations, isPending, error } = authClient.useListOrganizations()

  const handleSelect = async (organizationId: string,orgSlug:string) => {
    setIsSelecting(true)
   const { data, error } = await authClient.organization.setActive({
    organizationId: organizationId,
    organizationSlug: orgSlug,
});
    setIsSelecting(false)

    if (error) {
      toast("Failed to select branch: " + error.message)
      return
    }

    router.replace("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen w-full p-4 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Select branch</CardTitle>
          <CardDescription>Choose where you want to work today.</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="text-sm text-muted-foreground text-center">Loading branches…</div>
          ) : error ? (
            <div className="text-sm text-destructive text-center">{error.message}</div>
          ) : !organizations || organizations.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center">No branches found.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {organizations.map((org) => {
                const Icon = getBranchIcon(org)
                return (
                  <Button
                    key={org.id}
                    type="button"
                    variant="outline"
                    disabled={isSelecting}
                    onClick={() => handleSelect(org.id,org.slug)}
                    className="justify-start gap-3 h-12"
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="truncate">{org.name}</span>
                  </Button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
