import { prisma } from "@/app/lib/db"
import { auth } from "@/app/lib/auth"

export async function listUsersWithBranches() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      members: {
        select: {
          organization: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  })

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role ?? null,
    branches: u.members
      .map((m) => m.organization)
      .filter((o): o is NonNullable<typeof o> => Boolean(o)),
  }))
}

export async function getUserWithBranches(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      members: {
        select: {
          organization: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? null,
    branches: user.members
      .map((m) => m.organization)
      .filter((o): o is NonNullable<typeof o> => Boolean(o)),
  }
}

export async function createAuthUser(
  headers: Headers,
  input: {
    email: string
    password: string
    name: string
    role?: "admin" | "user"
  }
) {
  const result = await auth.api.createUser({
    headers,
    body: {
      email: input.email,
      password: input.password,
      name: input.name,
    },
  })

  const createdUser = (result as any)?.user
  if (!createdUser?.id) {
    throw new Error("Failed to create user")
  }

  return createdUser as { id: string }
}

export async function addUserToOrganization(
  headers: Headers,
  input: {
    userId: string
    organizationId: string
    role?: "admin" | "member"
  }
) {
  const result = await auth.api.addMember({
    headers,
    body: {
      userId: input.userId,
      organizationId: input.organizationId,
      role: input.role ?? "member",
    },
  })

  const member = result as any
  if (!member?.id) {
    throw new Error("Failed to add user to organization")
  }

  return member as { id: string }
}

export async function listUserMemberships(userId: string) {
  return prisma.member.findMany({
    where: { userId },
    select: { id: true, organizationId: true },
  })
}

export async function adminUpdateAuthUser(
  headers: Headers,
  input: {
    userId: string
    data: Record<string, unknown>
  }
) {
  const result = await auth.api.adminUpdateUser({
    headers,
    body: {
      userId: input.userId,
      data: input.data,
    },
  })

  const updatedUser = result as any
  if (!updatedUser?.id) {
    throw new Error("Failed to update user")
  }

  return updatedUser as { id: string }
}

export async function removeUserFromOrganization(
  headers: Headers,
  input: {
    memberIdOrEmail: string
    organizationId: string
  }
) {
  const result = await auth.api.removeMember({
    headers,
    body: {
      memberIdOrEmail: input.memberIdOrEmail,
      organizationId: input.organizationId,
    },
  })

  const removed = result as any
  if (!removed?.id) {
    throw new Error("Failed to remove user from organization")
  }

  return removed as { id: string }
}
