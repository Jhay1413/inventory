import * as dal from "@/app/api/_dal/organizations.dal"

export async function listOrganizations() {
  const organizations = await dal.listOrganizations()
  return { organizations }
}
