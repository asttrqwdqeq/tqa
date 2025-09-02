// Базовые типы для API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Типы для авторизации (по данным бэкенда)
export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  message: string;
}

export interface RefreshResponse {
  user: AuthUser;
}

// ============================================================================
// ТИПЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ (обновлено под новый бэкенд)
// ============================================================================

export interface VipLevel {
  id: number;
  quantAmount: number;
  quantMultiplier: number;
  dailyProfit: string;
}

export interface UserReference {
  id: string;
  username?: string;
  tgId: string;
}

export interface UserAdditionalData {
  region?: string;
  ipAddress?: string;
  lastLoginAt?: string;
}

export interface UserStats {
  referralsCount: number;
  operationsCount: number;
}

export interface User {
  id: string;
  tgId: string;
  username?: string;
  balance: number;
  createdAt: string;
  updatedAt?: string;
  lastActivityAt?: string;
  vipLevel?: VipLevel;
  inviter?: UserReference;
  stats: UserStats;
  additionalData?: UserAdditionalData;
  withdrawComissionStatus?: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'id' | 'username' | 'balance' | 'createdAt' | 'lastActivityAt';
  sortOrder?: 'asc' | 'desc';
  status?: 'all' | 'active' | 'inactive';
  minBalance?: number;
  maxBalance?: number;
}

export interface UpdateUserData {
  username?: string;
  balance?: number;
  vipLevelId?: number;
  isBlocked?: boolean;
  inviterId?: string | null;
}

export interface DeleteUserData {
  deleteOperations?: boolean;
  reason?: string;
}

export interface UserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  pagination: UserPagination;
  message: string;
}

export interface UserResponse {
  success: boolean;
  data: User | null;
  message: string;
}

// Упрощенный тип пользователя для списков
export interface SimpleUser {
  id: string;
  username?: string;
  tgId: string;
  createdAt: string;
}

export interface SimpleUserListResponse {
  success: boolean;
  data: SimpleUser[];
  pagination: UserPagination;
  message: string;
}

// Типы для модераторских операций
export interface UpdateUserUsernameData {
  username: string;
  reason?: string;
}

export interface UpdateUserTgIdData {
  tgId: string;
  reason?: string;
}

export interface UserStatsData {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersWithOperations: number;
  usersWithoutOperations: number;
  balanceStats: {
    total: number;
    average: number;
  };
  activityRate: string;
  operationsRate: string;
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStatsData;
  message: string;
}

// ============================================================================
// ТИПЫ ДЛЯ РЕФЕРРАЛОВ ПОЛЬЗОВАТЕЛЯ (админ)
// ============================================================================

export type ReferralStatus = 'active' | 'inactive' | 'notActivated';

export interface AdminReferral {
  id: string;
  tgId: string;
  username: string | null;
  balance: number;
  vipLevel: number;
  operationsCount: number;
  lastActivityAt: string | null;
  createdAt: string;
  wave: 1 | 2 | 3;
  status: ReferralStatus;
}

export interface AdminReferralsList {
  referrals: AdminReferral[];
  total: number;
  count: number;
  limit: number;
  offset: number;
}

// ============================================================================
// ТИПЫ ДЛЯ УВЕДОМЛЕНИЙ
// ============================================================================

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

// Базовый тип уведомления
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  targetUserId?: string;
  createdBy: string;
}

// DTO для создания уведомления
export interface CreateNotificationData {
  title: string;
  message: string;
  isActive?: boolean;
}

// DTO для обновления уведомления
export interface UpdateNotificationData {
  title?: string;
  message?: string;
  isActive?: boolean;
}

// Ответ API для списка уведомлений
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

// Ответ API для одного уведомления
export interface NotificationResponse {
  notification: Notification;
  message: string;
}

// Ответ API для создания/обновления уведомления
export interface NotificationActionResponse {
  notification: Notification;
  message: string;
}

// Параметры для поиска уведомлений
export interface NotificationSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: NotificationType;
  isActive?: boolean;
}

// Статистика уведомлений (для дашборда)
export interface NotificationStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<NotificationType, number>;
}

// ============================================================================
// ТИПЫ ДЛЯ АДМИНОВ
// ============================================================================

export interface Admin {
  id: string;
  username: string;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminData {
  username: string;
  password: string;
  isSuperAdmin?: boolean;
}

export interface UpdateAdminData {
  password?: string;
  isSuperAdmin?: boolean;
}

export interface AdminListResponse {
  success: boolean;
  data: Admin[];
  message?: string;
}

export interface AdminResponse {
  success: boolean;
  data: Admin | null;
  message: string;
}