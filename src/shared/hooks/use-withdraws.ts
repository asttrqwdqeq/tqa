import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/base'

// ============================================================================
// ТИПЫ ДАННЫХ
// ============================================================================

export interface WithdrawEntity {
  id: string
  txHash?: string
  userId: string
  value: number
  equivalentValue?: number
  currency: 'USDT' | 'USDC' | 'TON'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  completedAt?: string
  userWallet?: string
  user?: {
    id: string
    tgId: string
    balance: number
  }
  wallet?: {
    id: string
    address: string
    currency: 'USDT' | 'USDC' | 'TON'
  }
}

export interface WithdrawSearchParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  userId?: string
  status?: WithdrawEntity['status']
  currency?: WithdrawEntity['currency']
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface WithdrawStats {
  totalWithdraws: number
  totalAmount: number
  avgAmount: number
  totalPending: number
  totalCompleted: number
  totalFailed: number
  currencyBreakdown: {
    USDT: { count: number; amount: number }
    USDC: { count: number; amount: number }
    TON: { count: number; amount: number }
  }
  recentActivity: number
}

export interface WithdrawApprovalData {
  txHash?: string
}

export interface WithdrawRejectionData {
  reason?: string
}

// ============================================================================
// ОСНОВНОЙ ХУК ДЛЯ ВЫВОДОВ
// ============================================================================

/**
 * Хук для получения списка выводов
 */
export function useWithdraws(params?: WithdrawSearchParams) {
  return useQuery({
    queryKey: ['withdraws', params],
    queryFn: async (): Promise<PaginatedResponse<WithdrawEntity>> => {
      const response = await api.get<PaginatedResponse<WithdrawEntity>>('/admin/withdraws', {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          search: params?.search,
          status: params?.status,
          currency: params?.currency,
          sortBy: params?.sortBy || 'createdAt',
          sortOrder: params?.sortOrder || 'desc',
          userId: params?.userId,
          dateFrom: params?.dateFrom,
          dateTo: params?.dateTo,
          minAmount: params?.minAmount,
          maxAmount: params?.maxAmount
        }
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

/**
 * Хук для получения конкретного вывода по ID
 */
export function useWithdraw(id: string, enabled = true) {
  return useQuery({
    queryKey: ['withdraw', id],
    queryFn: async (): Promise<WithdrawEntity> => {
      const response = await api.get<WithdrawEntity>(`/admin/withdraws/${id}`)
      return response.data
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

/**
 * Хук для получения статистики по выводам
 */
export function useWithdrawStats() {
  return useQuery({
    queryKey: ['withdraw-stats'],
    queryFn: async (): Promise<WithdrawStats> => {
      const response = await api.get<WithdrawStats>('/admin/withdraws/stats')
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

/**
 * Хук для подтверждения вывода
 */
export function useApproveWithdraw() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, txHash }: { id: string; txHash?: string }): Promise<WithdrawEntity> => {
      const response = await api.post<WithdrawEntity>(`/admin/withdraws/${id}/approve`, {
        txHash
      })
      return response.data
    },
    onSuccess: (data) => {
      // Обновляем кэш для конкретного вывода
      queryClient.setQueryData(['withdraw', data.id], data)
      
      // Инвалидируем списки и статистику
      queryClient.invalidateQueries({ queryKey: ['withdraws'] })
      queryClient.invalidateQueries({ queryKey: ['withdraw-stats'] })
    }
  })
}

/**
 * Хук для отклонения вывода
 */
export function useRejectWithdraw() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }): Promise<WithdrawEntity> => {
      const response = await api.post<WithdrawEntity>(`/admin/withdraws/${id}/reject`, {
        reason
      })
      return response.data
    },
    onSuccess: (data) => {
      // Обновляем кэш для конкретного вывода
      queryClient.setQueryData(['withdraw', data.id], data)
      
      // Инвалидируем списки и статистику
      queryClient.invalidateQueries({ queryKey: ['withdraws'] })
      queryClient.invalidateQueries({ queryKey: ['withdraw-stats'] })
    }
  })
}