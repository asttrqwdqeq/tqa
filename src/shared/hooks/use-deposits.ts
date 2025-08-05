import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/base'

// ============================================================================
// ТИПЫ ДАННЫХ
// ============================================================================

export interface DepositEntity {
  id: string
  txHash?: string
  userId: string
  value: number
  equivalentValue?: number
  currency: 'USDT' | 'USDC' | 'TON'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  type: 'DEPOSIT'
  createdAt: string
  completedAt?: string
  userWallet?: string
  parentOperationId?: string
  user?: {
    id: string
    tgId: string
  }
}

export interface DepositSearchParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  userId?: string
  status?: DepositEntity['status']
  currency?: DepositEntity['currency']
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

export interface DepositStats {
  totalDeposits: number
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

// ============================================================================
// ОСНОВНОЙ ХУК ДЛЯ ДЕПОЗИТОВ
// ============================================================================

/**
 * Простой хук для получения депозитов без лишних оптимизаций
 */
export function useDeposits(params?: DepositSearchParams) {
  return useQuery({
    queryKey: ['deposits', params],
    queryFn: async (): Promise<PaginatedResponse<DepositEntity>> => {
      const response = await api.get<PaginatedResponse<DepositEntity>>('/operations/admin/deposits', {
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
    gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

/**
 * Хук для получения конкретного депозита по ID
 */
export function useDeposit(id: string, enabled = true) {
  return useQuery({
    queryKey: ['deposit', id],
    queryFn: async (): Promise<DepositEntity> => {
      const response = await api.get<DepositEntity>(`/operations/admin/${id}`)
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
 * Хук для получения статистики по депозитам
 */
export function useDepositStats() {
  return useQuery({
    queryKey: ['deposit-stats'],
    queryFn: async (): Promise<DepositStats> => {
      const response = await api.get<DepositStats>('/operations/admin/deposits/stats')
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

// Алиас для совместимости
export const useOnlyDeposits = useDeposits