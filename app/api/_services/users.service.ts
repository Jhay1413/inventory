import * as dal from "@/app/api/_dal/users.dal"
import type { CreateUserData, UpdateUserData } from "@/types/api/users"

export async function listUsers() {
  const users = await dal.listUsersWithBranches()
  return { users }
}

export async function createUser(headers: Headers, input: CreateUserData) {
  const created = await dal.createAuthUser(headers, {
    email: input.email,
    password: input.password,
    name: input.name,
    role: input.role === "member" ? "user" : input.role,
  })

  await Promise.all(
    input.organizationIds.map((organizationId) =>
      dal.addUserToOrganization(headers, {
        userId: created.id,
        organizationId,
        role: input.memberRole as "member" | "admin" | undefined,
      })
    )
  )

  return dal.getUserWithBranches(created.id)
}

export async function getUser(id: string) {
  return dal.getUserWithBranches(id)
}

export async function updateUser(headers: Headers, userId: string, input: UpdateUserData) {
  const mappedRole = input.role === "member" ? "user" : input.role

  await dal.adminUpdateAuthUser(headers, {
    userId,
    data: {
      name: input.name,
      email: input.email,
      role: mappedRole,
    },
  })

  const existingMemberships = await dal.listUserMemberships(userId)
  const existingOrgIds = new Set(existingMemberships.map((m) => m.organizationId))
  const desiredOrgIds = new Set(input.organizationIds)

  const toRemove = existingMemberships.filter((m) => !desiredOrgIds.has(m.organizationId))
  const toAdd = input.organizationIds.filter((orgId) => !existingOrgIds.has(orgId))

  await Promise.all([
    ...toRemove.map((m) =>
      dal.removeUserFromOrganization(headers, {
        memberIdOrEmail: m.id,
        organizationId: m.organizationId,
      })
    ),
    ...toAdd.map((organizationId) =>
      dal.addUserToOrganization(headers, {
        userId,
        organizationId,
        role: input.memberRole as "member" | "admin" | undefined,
      })
    ),
  ])

  return dal.getUserWithBranches(userId)
}
