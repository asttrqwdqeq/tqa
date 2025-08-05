/**
 * Типизированные хуки для конкретных моделей
 * Обертки над универсальными хуками с правильными типами
 */

import { 
  useModelList, 
  useModelItem, 
  useCreateModel, 
  useUpdateModel, 
  useDeleteModel,
  useModelStats,
  useBulkActions,
  type BaseEntity,
  type ModelSearchParams 
} from './use-model-data'

// ============================================================================
// ТИПЫ ДЛЯ МОДЕЛЕЙ
// ============================================================================

// Notification модель
export interface NotificationEntity extends BaseEntity {
  title: string
  message: string
  isAlert: boolean
}

export interface CreateNotificationData {
  title: string
  message: string
  isAlert?: boolean
}

export interface UpdateNotificationData {
  title?: string
  message?: string
  isAlert?: boolean
}

// User модель
export interface UserEntity extends BaseEntity {
  name: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  isActive: boolean
  lastLogin?: string
  avatar?: string
}

// Deposit/Operation модель
export interface DepositEntity extends BaseEntity {
  txHash?: string
  userId: string
  value: number
  equivalentValue?: number
  currency: 'USDT' | 'USDC' | 'TON'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  type: 'DEPOSIT' | 'WITHDRAW' | 'QUANT' | 'REFERRAL_QUANT_BONUS' | 'REFERRAL_DEPOSIT_BONUS' | 'REACH_VIP_LEVEL_BONUS' | 'LEADERBOARD_BONUS' | 'SUPPORT_BONUS' | 'REGISTRATION_BONUS'
  completedAt?: string
  userWallet?: string
  parentOperationId?: string
  // Дополнительные поля для админки
  user?: {
    id: string
    tgId: string
  }
}

export interface DepositSearchParams extends ModelSearchParams {
  userId?: string
  status?: 'PENDING' | 'COMPLETED' | 'FAILED'
  type?: 'DEPOSIT' | 'WITHDRAW' | 'QUANT' | 'REFERRAL_QUANT_BONUS' | 'REFERRAL_DEPOSIT_BONUS' | 'REACH_VIP_LEVEL_BONUS' | 'LEADERBOARD_BONUS' | 'SUPPORT_BONUS' | 'REGISTRATION_BONUS'
  currency?: 'USDT' | 'USDC' | 'TON'
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'admin' | 'user' | 'moderator'
  isActive?: boolean
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: 'admin' | 'user' | 'moderator'
  isActive?: boolean
  avatar?: string
}

// Order модель
export interface OrderEntity extends BaseEntity {
  orderNumber: string
  customerName: string
  customerEmail?: string
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  items?: OrderItem[]
  notes?: string
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  total: number
}

export interface CreateOrderData {
  orderNumber: string
  customerName: string
  customerEmail?: string
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  items?: Omit<OrderItem, 'id'>[]
  notes?: string
}

export interface UpdateOrderData {
  customerName?: string
  customerEmail?: string
  total?: number
  status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  items?: OrderItem[]
  notes?: string
}

// Settings модель
type SettingsValue = string | number | boolean | Record<string, unknown> | unknown[]

export interface SettingsEntity extends BaseEntity {
  key: string
  value: SettingsValue
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  category?: string
  isPublic: boolean
}

export interface CreateSettingsData {
  key: string
  value: SettingsValue
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  category?: string
  isPublic?: boolean
}

export interface UpdateSettingsData {
  value?: SettingsValue
  description?: string
  category?: string
  isPublic?: boolean
}

// Статистика для разных моделей
export interface NotificationStats {
  total: number
  alerts: number
  notifications: number
  recentActivity: { date: string; count: number }[]
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  byRole: Record<string, number>
  recentRegistrations: { date: string; count: number }[]
  lastLoginActivity: { date: string; count: number }[]
}

export interface OrderStats {
  total: number
  totalRevenue: number
  byStatus: Record<string, number>
  recentOrders: { date: string; count: number; revenue: number }[]
  averageOrderValue: number
}

// ============================================================================
// ТИПИЗИРОВАННЫЕ ХУКИ ДЛЯ NOTIFICATIONS
// ============================================================================

export function useNotifications(params?: ModelSearchParams & {
  isAlert?: boolean
}) {
  return useModelList<NotificationEntity>('notifications', params)
}

export function useNotification(id: string) {
  return useModelItem<NotificationEntity>('notifications', id)
}

export function useCreateNotification(options?: {
  onSuccess?: (data: NotificationEntity) => void
  onError?: (error: unknown) => void
}) {
  return useCreateModel<NotificationEntity, CreateNotificationData>('notifications', options)
}

export function useUpdateNotification(options?: {
  onSuccess?: (data: NotificationEntity) => void
  onError?: (error: unknown) => void
}) {
  return useUpdateModel<NotificationEntity, UpdateNotificationData>('notifications', options)
}

export function useDeleteNotification(options?: {
  onSuccess?: (id: string) => void
  onError?: (error: unknown) => void
}) {
  return useDeleteModel('notifications', options)
}

export function useNotificationStats() {
  return useModelStats<NotificationStats>('notifications')
}

export function useBulkNotifications() {
  return useBulkActions<NotificationEntity>('notifications')
}

// ============================================================================
// ТИПИЗИРОВАННЫЕ ХУКИ ДЛЯ USERS
// ============================================================================

export function useUsers(params?: ModelSearchParams & {
  role?: 'admin' | 'user' | 'moderator'
  isActive?: boolean
}) {
  return useModelList<UserEntity>('users', params)
}

export function useUser(id: string) {
  return useModelItem<UserEntity>('users', id)
}

export function useCreateUser(options?: {
  onSuccess?: (data: UserEntity) => void
  onError?: (error: unknown) => void
}) {
  return useCreateModel<UserEntity, CreateUserData>('users', options)
}

export function useUpdateUser(options?: {
  onSuccess?: (data: UserEntity) => void
  onError?: (error: unknown) => void
}) {
  return useUpdateModel<UserEntity, UpdateUserData>('users', options)
}

export function useDeleteUser(options?: {
  onSuccess?: (id: string) => void
  onError?: (error: unknown) => void
}) {
  return useDeleteModel('users', options)
}

export function useUserStats() {
  return useModelStats<UserStats>('users')
}

export function useBulkUsers() {
  return useBulkActions<UserEntity>('users')
}

// ============================================================================
// ТИПИЗИРОВАННЫЕ ХУКИ ДЛЯ ORDERS
// ============================================================================

export function useOrders(params?: ModelSearchParams & {
  status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  customerName?: string
}) {
  return useModelList<OrderEntity>('orders', params)
}

export function useOrder(id: string) {
  return useModelItem<OrderEntity>('orders', id)
}

export function useCreateOrder(options?: {
  onSuccess?: (data: OrderEntity) => void
  onError?: (error: unknown) => void
}) {
  return useCreateModel<OrderEntity, CreateOrderData>('orders', options)
}

export function useUpdateOrder(options?: {
  onSuccess?: (data: OrderEntity) => void
  onError?: (error: unknown) => void
}) {
  return useUpdateModel<OrderEntity, UpdateOrderData>('orders', options)
}

export function useDeleteOrder(options?: {
  onSuccess?: (id: string) => void
  onError?: (error: unknown) => void
}) {
  return useDeleteModel('orders', options)
}

export function useOrderStats() {
  return useModelStats<OrderStats>('orders')
}

export function useBulkOrders() {
  return useBulkActions<OrderEntity>('orders')
}

// ============================================================================
// ТИПИЗИРОВАННЫЕ ХУКИ ДЛЯ SETTINGS
// ============================================================================

export function useSettings(params?: ModelSearchParams & {
  category?: string
  isPublic?: boolean
}) {
  return useModelList<SettingsEntity>('settings', params)
}

export function useSetting(id: string) {
  return useModelItem<SettingsEntity>('settings', id)
}

export function useCreateSetting(options?: {
  onSuccess?: (data: SettingsEntity) => void
  onError?: (error: unknown) => void
}) {
  return useCreateModel<SettingsEntity, CreateSettingsData>('settings', options)
}

export function useUpdateSetting(options?: {
  onSuccess?: (data: SettingsEntity) => void
  onError?: (error: unknown) => void
}) {
  return useUpdateModel<SettingsEntity, UpdateSettingsData>('settings', options)
}

export function useDeleteSetting(options?: {
  onSuccess?: (id: string) => void
  onError?: (error: unknown) => void
}) {
  return useDeleteModel('settings', options)
}

export function useBulkSettings() {
  return useBulkActions<SettingsEntity>('settings')
}

// ============================================================================
// СПЕЦИАЛЬНЫЕ ХУКИ ДЛЯ БИЗНЕС-ЛОГИКИ
// ============================================================================

/**
 * Хук для переключения типа уведомления (alert/notification)
 */
export function useToggleNotificationAlert() {
  const updateMutation = useUpdateNotification()
  
  return {
    toggle: (id: string, isAlert: boolean) => {
      return updateMutation.mutate({ id, data: { isAlert } })
    },
    isLoading: updateMutation.isPending,
    error: updateMutation.error
  }
}

/**
 * Хук для блокировки/разблокировки пользователя
 */
export function useToggleUserStatus() {
  const updateMutation = useUpdateUser()
  
  return {
    toggle: (id: string, isActive: boolean) => {
      return updateMutation.mutate({ id, data: { isActive } })
    },
    isLoading: updateMutation.isPending,
    error: updateMutation.error
  }
}

/**
 * Хук для изменения статуса заказа
 */
export function useUpdateOrderStatus() {
  const updateMutation = useUpdateOrder()
  
  return {
    updateStatus: (id: string, status: OrderEntity['status']) => {
      return updateMutation.mutate({ id, data: { status } })
    },
    isLoading: updateMutation.isPending,
    error: updateMutation.error
  }
}

/**
 * Хук для получения настройки по ключу
 */
export function useSettingByKey(key: string) {
  return useSettings({ 
    search: key,
    limit: 1 
  })
}

/**
 * Хук для обновления настройки по ключу
 */
export function useUpdateSettingByKey() {
  const updateMutation = useUpdateSetting()

  return {
    updateByKey: (key: string, value: SettingsValue) => {
      // В реальном приложении здесь будет поиск ID по ключу
      // Пока используем key как ID для примера
      return updateMutation.mutate({ id: key, data: { value } })
    },
    isLoading: updateMutation.isPending,
    error: updateMutation.error
  }
}

// ============================================================================
// ДЕПОЗИТЫ/ОПЕРАЦИИ
// ============================================================================

/**
 * Хук для получения списка депозитов в админке
 */
export function useDeposits(params?: DepositSearchParams, options?: {
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
}) {
  return useModelList<DepositEntity>('deposits', params, options)
}

/**
 * Хук для получения депозитов только типа DEPOSIT
 */
export function useOnlyDeposits(params?: Omit<DepositSearchParams, 'type'>, options?: {
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
}) {
  return useDeposits({
    ...params,
    type: 'DEPOSIT'
  }, options)
}

/**
 * Хук для получения всех операций пользователя
 */
export function useUserOperations(userId: string, params?: Omit<DepositSearchParams, 'userId'>, options?: {
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
}) {
  return useDeposits({
    ...params,
    userId
  }, options)
}

/**
 * Хук для получения депозитов по статусу
 */
export function useDepositsByStatus(status: DepositEntity['status'], params?: Omit<DepositSearchParams, 'status'>, options?: {
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
}) {
  return useDeposits({
    ...params,
    status
  }, options)
}

/**
 * Хук для получения конкретного депозита/операции
 */
export function useDeposit(id: string, options?: { enabled?: boolean }) {
  return useModelItem<DepositEntity>('deposits', id, options)
}

/**
 * Хук для получения статистики по депозитам
 */
export function useDepositStats() {
  return useModelStats('deposits')
}