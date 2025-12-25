import { NextRequest, NextResponse } from "next/server"
import * as service from "@/app/api/_services/users.service"
import { CreateUserSchema, UpdateUserSchema } from "@/types/api/users"

export async function handleListUsers(_req: NextRequest) {
  try {
    const result = await service.listUsers()
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function handleCreateUser(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = CreateUserSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  try {
    const user = await service.createUser(req.headers, parsed.data)
    return NextResponse.json({ user }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create user"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function handleGetUser(id: string) {
  try {
    const user = await service.getUser(id)
    return NextResponse.json({ user })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch user"
    return NextResponse.json({ error: message }, { status: 404 })
  }
}

export async function handleUpdateUser(req: NextRequest, id: string) {
  const body = await req.json().catch(() => null)
  const parsed = UpdateUserSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    )
  }

  try {
    const user = await service.updateUser(req.headers, id, parsed.data)
    return NextResponse.json({ user })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update user"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
