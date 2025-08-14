import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/base'
import { toast } from 'sonner'

// Базовые типы для работы с моделями
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages?: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

export interface ModelSearchParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
  [key: string]: any
}

// Конфигурация эндпоинтов для разных моделей
const modelEndpoints: Record<string, string> = {
  notifications: '/notifications', // Универсальные эндпоинты
  users: '/admin/users', 
  orders: '/orders',
  settings: '/settings',
  admins: '/admins',
  products: '/products',
  deposits: '/operations/admin/deposits', // Админские эндпоинты для депозитов (только DEPOSIT типы)
  appWallet: '/app-wallet', // Админские эндпоинты для app wallet
  leaderboardParticipants: '/leaderboard/admin/participants',
  // Можно легко добавлять новые модели
}

// Функция для получения базового URL модели
function getModelEndpoint(model: string): string {
  const endpoint = modelEndpoints[model]
  if (!endpoint) {
    throw new Error(`Endpoint for model "${model}" not configured`)
  }
  return endpoint
}

// Ключи для кэширования запросов
export const modelKeys = {
  all: (model: string) => [model] as const,
  lists: (model: string) => [...modelKeys.all(model), 'list'] as const,
  list: (model: string, params?: ModelSearchParams) => [...modelKeys.lists(model), params] as const,
  details: (model: string) => [...modelKeys.all(model), 'detail'] as const,
  detail: (model: string, id: string) => [...modelKeys.details(model), id] as const,
  stats: (model: string) => [...modelKeys.all(model), 'stats'] as const,
}

// ============================================================================
// ОСНОВНЫЕ ХУКИ ДЛЯ РАБОТЫ С МОДЕЛЯМИ
// ============================================================================

/**
 * Хук для получения списка записей модели с пагинацией
 */
export function useModelList<T extends BaseEntity>(
  model: string, 
  params?: ModelSearchParams,
  options?: {
    enabled?: boolean
    refetchInterval?: number
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: modelKeys.list(model, params),
    queryFn: async (): Promise<PaginatedResponse<T>> => {
      try {
        const endpoint = getModelEndpoint(model)
        const page = params?.page || 1
        const limit = params?.limit || 10

        const response = await api.get<any>(endpoint, {
          params: {
            page,
            limit,
            ...params
          }
        })
        
        console.log(`📊 API Response for ${model}:`, response.data) // Debug logging
        
        // Специальная обработка для users (новый формат ответа)
        if (model === 'users' && response.data?.success) {
          return {
            data: response.data.data || [],
            total: response.data.pagination?.total || 0,
            page: response.data.pagination?.page || page,
            limit: response.data.pagination?.limit || limit,
            totalPages: response.data.pagination?.totalPages || 0
          } as PaginatedResponse<T>
        }

        // Спец-обработка для leaderboardParticipants (AdminParticipantsListResponseDto)
        if (model === 'leaderboardParticipants' && response.data && 'data' in response.data && 'total' in response.data) {
          const d = response.data
          return {
            data: d.data || [],
            total: d.total || 0,
            page: d.page || page,
            limit: d.limit || limit,
            totalPages: d.totalPages || Math.ceil((d.total || 0) / (d.limit || limit)),
          } as PaginatedResponse<T>
        }
        
        // Бэкенд возвращает данные напрямую в формате PaginatedResponse
        // Проверяем, что это объект с нужными полями
        if (typeof response.data === 'object' && response.data !== null && 'data' in response.data && 'total' in response.data) {
          return response.data as unknown as PaginatedResponse<T>
        }
        
        // Если ответ обернут в ApiResponse
        if (typeof response.data === 'object' && response.data !== null && 'data' in response.data && typeof response.data.data === 'object' && 'data' in response.data.data) {
          return (response.data as ApiResponse<PaginatedResponse<T>>).data
        }
        
        // Fallback - пытаемся интерпретировать как PaginatedResponse
        return response.data as unknown as PaginatedResponse<T>
      } catch (error) {
        console.error(`❌ API Error for ${model}:`, error)
        throw error
      }
    },
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime || 1000 * 60 * 5, // 5 минут по умолчанию
    refetchOnWindowFocus: true,
  })
}

/**
 * Хук для получения одной записи по ID
 */
export function useModelItem<T extends BaseEntity>(
  model: string, 
  id: string, 
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: modelKeys.detail(model, id),
    queryFn: async (): Promise<T> => {
      const endpoint = getModelEndpoint(model)
      const response = await api.get<ApiResponse<T> | T>(`${endpoint}/${id}`)
      
      // Адаптируем ответ в зависимости от структуры
      if (typeof response.data === 'object' && response.data !== null && 'data' in response.data) {
        return (response.data as ApiResponse<T>).data
      }
      
      return response.data as T
    },
    enabled: !!id && options?.enabled !== false,
    staleTime: options?.staleTime || 1000 * 60 * 5,
  })
}

/**
 * Хук для создания новой записи
 */
export function useCreateModel<T extends BaseEntity, TCreate = Partial<T>>(
  model: string,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: any) => void
    showToast?: boolean
  }
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: TCreate): Promise<T> => {
      const endpoint = getModelEndpoint(model)
      const response = await api.post<ApiResponse<T> | T>(endpoint, data)
      
      // Адаптируем ответ
      if (typeof response.data === 'object' && response.data !== null && 'data' in response.data) {
        return (response.data as ApiResponse<T>).data
      }
      
      return response.data as T
    },
    onSuccess: (data) => {
      // Инвалидируем кэш списков
      queryClient.invalidateQueries({ queryKey: modelKeys.lists(model) })
      
      // Добавляем в кэш деталей
      queryClient.setQueryData(modelKeys.detail(model, data.id), data)
      
      // Инвалидируем статистику
      queryClient.invalidateQueries({ queryKey: modelKeys.stats(model) })
      
      if (options?.showToast !== false) {
        toast.success(`${getModelDisplayName(model)} created successfully`)
      }
      
      options?.onSuccess?.(data)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || `Error creating ${getModelDisplayName(model).toLowerCase()}`
      
      if (options?.showToast !== false) {
        toast.error(message)
      }
      
      options?.onError?.(error)
    },
  })
}

/**
 * Хук для обновления записи
 */
export function useUpdateModel<T extends BaseEntity, TUpdate = Partial<T>>(
  model: string,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: any) => void
    showToast?: boolean
  }
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TUpdate }): Promise<T> => {
      const endpoint = getModelEndpoint(model)
      const response = await api.put<ApiResponse<T> | T>(`${endpoint}/${id}`, data)
      
      // Адаптируем ответ
      if (typeof response.data === 'object' && response.data !== null && 'data' in response.data) {
        return (response.data as ApiResponse<T>).data
      }
      
      return response.data as T 
    },
    onSuccess: (data, variables) => {
      // Обновляем кэш списков
      queryClient.invalidateQueries({ queryKey: modelKeys.lists(model) })
      
      // Инвалидируем кэш деталей чтобы данные загружались заново
      queryClient.invalidateQueries({ queryKey: modelKeys.detail(model, variables.id) })
      
      // Инвалидируем статистику
      queryClient.invalidateQueries({ queryKey: modelKeys.stats(model) })
      
      console.log(`✅ Cache invalidated for ${model} with id: ${variables.id}`)
      
      if (options?.showToast !== false) {
        toast.success(`${getModelDisplayName(model)} updated successfully`)
      }
      
      options?.onSuccess?.(data)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || `Error updating ${getModelDisplayName(model).toLowerCase()}`
      
      if (options?.showToast !== false) {
        toast.error(message)
      }
      
      options?.onError?.(error)
    },
  })
}

/**
 * Хук для удаления записи
 */
export function useDeleteModel(
  model: string,
  options?: {
    onSuccess?: (id: string) => void
    onError?: (error: any) => void
    showToast?: boolean
  }
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const endpoint = getModelEndpoint(model)
      await api.delete(`${endpoint}/${id}`)
    },
    onSuccess: (_, deletedId) => {
      // Инвалидируем кэш списков
      queryClient.invalidateQueries({ queryKey: modelKeys.lists(model) })
      
      // Удаляем из кэша деталей
      queryClient.removeQueries({ queryKey: modelKeys.detail(model, deletedId) })
      
      // Инвалидируем статистику
      queryClient.invalidateQueries({ queryKey: modelKeys.stats(model) })
      
      if (options?.showToast !== false) {
        toast.success(`${getModelDisplayName(model)} deleted successfully`)
      }
      
      options?.onSuccess?.(deletedId)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || `Error deleting ${getModelDisplayName(model).toLowerCase()}`
      
      if (options?.showToast !== false) {
        toast.error(message)
      }
      
      options?.onError?.(error)
    },
  })
}

/**
 * Хук для получения статистики модели
 */
export function useModelStats<T = any>(
  model: string,
  options?: {
    enabled?: boolean
    refetchInterval?: number
  }
) {
  return useQuery({
    queryKey: modelKeys.stats(model),
    queryFn: async (): Promise<T> => {
      const endpoint = getModelEndpoint(model)
      const response = await api.get<ApiResponse<T> | T>(`${endpoint}/stats`)
      
      // Адаптируем ответ
      if (typeof response.data === 'object' && response.data !== null && 'data' in response.data) {
        return (response.data as ApiResponse<T>).data
      }
      
      return response.data as T
    },
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval || 1000 * 60 * 10, // 10 минут
    staleTime: 1000 * 60 * 5, // 5 минут
  })
}

/**
 * Хук для пакетных операций
 */
export function useBulkActions<T extends BaseEntity>(
  model: string,
  options?: {
    onSuccess?: (action: string, ids: string[]) => void
    onError?: (error: any) => void
    showToast?: boolean
  }
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ action, ids, data }: { 
      action: 'delete' | 'update' | 'activate' | 'deactivate'
      ids: string[]
      data?: any 
    }): Promise<T[]> => {
      const endpoint = getModelEndpoint(model)
      const response = await api.post<ApiResponse<T[]> | T[]>(`${endpoint}/bulk`, {
        action,
        ids,
        data
      })
      
      // Адаптируем ответ
      if (response.data && 'data' in response.data) {
        return (response.data as ApiResponse<T[]>).data
      }
      
      return response.data as T[]
    },
    onSuccess: (data, variables) => {
      // Инвалидируем весь кэш модели
      queryClient.invalidateQueries({ queryKey: modelKeys.all(model) })
      
      if (options?.showToast !== false) {
        toast.success(`Пакетная операция "${variables.action}" выполнена для ${variables.ids.length} записей`)
      }
      
      options?.onSuccess?.(variables.action, variables.ids)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Ошибка при выполнении пакетной операции'
      
      if (options?.showToast !== false) {
        toast.error(message)
      }
      
      options?.onError?.(error)
    },
  })
}

// ============================================================================
// УТИЛИТЫ И ХЕЛПЕРЫ
// ============================================================================

/**
 * Хук для предзагрузки данных модели
 */
export function usePrefetchModel() {
  const queryClient = useQueryClient()
  
  return {
    prefetchList: (model: string, params?: ModelSearchParams) => {
      queryClient.prefetchQuery({
        queryKey: modelKeys.list(model, params),
        queryFn: async () => {
          const endpoint = getModelEndpoint(model)
          const response = await api.get(endpoint, { params })
          return response.data
        },
        staleTime: 1000 * 60 * 5,
      })
    },
    
    prefetchItem: (model: string, id: string) => {
      queryClient.prefetchQuery({
        queryKey: modelKeys.detail(model, id),
        queryFn: async () => {
          const endpoint = getModelEndpoint(model)
          const response = await api.get(`${endpoint}/${id}`)
          return response.data
        },
        staleTime: 1000 * 60 * 5,
      })
    }
  }
}

/**
 * Хук для работы с серверной пагинацией
 */
export function useModelPagination(initialPage = 1, initialPageSize = 10) {
  const [page, setPage] = React.useState(initialPage)
  const [pageSize, setPageSize] = React.useState(initialPageSize)
  
  const paginationConfig = React.useCallback((total: number) => ({
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    onPageChange: setPage,
    onPageSizeChange: (newSize: number) => {
      setPageSize(newSize)
      setPage(1) // Сброс на первую страницу при изменении размера
    },
  }), [page, pageSize])
  
  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    paginationConfig,
    params: { page, limit: pageSize }
  }
}

// Функция для получения отображаемого имени модели
function getModelDisplayName(model: string): string {
  const displayNames: Record<string, string> = {
    notifications: 'Notification',
    users: 'User',
    orders: 'Order',
    settings: 'Setting',
    admins: 'Admin',
    products: 'Product',
    appWallet: 'App Wallet',
  }
  
  return displayNames[model] || model
}

// Добавляем React импорт для хуков состояния
import React from 'react'