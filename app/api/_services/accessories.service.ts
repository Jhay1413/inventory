import * as dal from "@/app/api/_dal/accessories.dal"

export async function listAccessories(args: { search?: string }) {
  return dal.listAccessories({ search: args.search })
}

export async function createAccessory(
  input: { name: string },
  ctx: { actorOrganizationId: string | null; isAdminOrganization: boolean }
) {
  if (!ctx.actorOrganizationId) throw new Error("Unauthorized")
  if (!ctx.isAdminOrganization) throw new Error("Forbidden")

  const name = input.name.trim()
  if (!name) throw new Error("Name is required")

  try {
    return await dal.createAccessory(name)
  } catch (e) {
    // If it already exists (unique name), return existing.
    const existing = await dal.getAccessoryByName(name)
    if (existing) return existing
    throw e
  }
}
