import {
  CreateUserResponseSchema,
  type CreateUserInput,
  type CreateUserResponse,
  UsersListResponseSchema,
  type UsersListResponse,
  UserResponseSchema,
  type UpdateUserInput,
} from "@/types/api/users"

class UsersService {
  private baseUrl = "/api/users"

  async list(): Promise<UsersListResponse> {
    const res = await fetch(this.baseUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch users")
    }

    const data = await res.json()
    return UsersListResponseSchema.parse(data)
  }

  async create(input: CreateUserInput): Promise<CreateUserResponse> {
    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to create user")
    }

    const data = await res.json()
    return CreateUserResponseSchema.parse(data)
  }

  async getById(id: string) {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to fetch user")
    }

    const data = await res.json()
    return UserResponseSchema.parse(data)
  }

  async update(id: string, input: UpdateUserInput) {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to update user")
    }

    const data = await res.json()
    return UserResponseSchema.parse(data)
  }
}

export const usersService = new UsersService()
