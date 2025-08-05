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

// Типы для пользователей (пример)
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: string;
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