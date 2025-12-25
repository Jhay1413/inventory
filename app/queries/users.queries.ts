"use client"

import { useQuery } from "@tanstack/react-query"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usersService } from "@/app/services/users.service"
import type { CreateUserInput, UpdateUserFormInput } from "@/types/api/users"

export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
} as const

export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => usersService.list(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserInput) => usersService.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUser(userId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => usersService.getById(userId),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 15,
    gcTime: 1000 * 60 * 5,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateUserFormInput) => {
      const { id, ...payload } = input
      return usersService.update(id, payload)
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) }),
      ])
    },
  })
}
