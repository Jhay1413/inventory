import * as dal from "@/app/api/_dal/branches.dal"

export async function listBranchesOverview() {
  const branches = await dal.listBranchesOverview()
  return { branches }
}

export async function createBranch(headers: Headers, input: {
  name: string
  slug: string
}) {
  const organization = await dal.createBranchOrganization(headers, input)
  return { organization }
}
