import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersBasicApi, BasicUsersListParams } from '@/shared/api/users-basic'

export const basicUserKeys = {
  all: ['basic-users'] as const,
  list: (params?: BasicUsersListParams) => [...basicUserKeys.all, 'list', params] as const,
  detail: (id: string) => [...basicUserKeys.all, 'detail', id] as const,
}

export function useBasicUsersList(params: BasicUsersListParams) {
  return useQuery({
    queryKey: basicUserKeys.list(params),
    queryFn: async () => {
      const res = await usersBasicApi.list(params)
      return res
    },
  })
}

export function useBasicUpdateUsername() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, username }: { id: string; username: string }) => usersBasicApi.updateUsername(id, username),
    onSuccess: (_res, _vars) => {
      qc.invalidateQueries({ queryKey: basicUserKeys.all })
    },
  })
}

export function useBasicSetPassword() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => usersBasicApi.setPassword(id, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: basicUserKeys.all })
    },
  })
}

export function useBasicSetFundPassword() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) => usersBasicApi.setFundPassword(id, code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: basicUserKeys.all })
    },
  })
}


