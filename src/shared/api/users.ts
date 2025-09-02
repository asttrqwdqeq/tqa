import { api } from './base';
import { 
  User, 
  UserListQuery, 
  UpdateUserData, 
  DeleteUserData,
  UserListResponse,
  UserResponse,
  UserStatsResponse,
  AdminReferralsList,
  SimpleUserListResponse,
  UpdateUserUsernameData,
  UpdateUserTgIdData,
} from './types';

export const usersApi = {
  // Получить список пользователей
  getUsers: async (params?: UserListQuery): Promise<UserListResponse> => {
    const response = await api.get<UserListResponse>('/admin/users', {
      params,
    });
    return response.data;
  },

  // Получить статистику пользователей
  getUsersStats: async (params?: { period?: string }): Promise<UserStatsResponse> => {
    const response = await api.get<UserStatsResponse>('/admin/users/stats', {
      params,
    });
    return response.data;
  },

  // Получить пользователя по ID
  getUser: async (id: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/admin/users/${id}`);
    return response.data;
  },

  // Обновить пользователя
  updateUser: async (id: string, data: UpdateUserData): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/admin/users/${id}`, data);
    return response.data;
  },

  // Удалить пользователя (только для супер-админов)
  deleteUser: async (id: string, options?: DeleteUserData): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      data: options,
    });
    return response.data;
  },

  // Заблокировать/разблокировать пользователя
  toggleUserBlock: async (id: string, blocked: boolean): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/admin/users/${id}/block`, {
      blocked,
    });
    return response.data;
  },

  // Изменить баланс пользователя
  updateUserBalance: async (id: string, balance: number, reason?: string): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/admin/users/${id}/balance`, {
      balance,
      reason,
    });
    return response.data;
  },

  // Изменить VIP уровень пользователя
  updateUserVipLevel: async (id: string, vipLevelId: number, reason?: string): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/admin/users/${id}/vip`, {
      vipLevelId,
      reason,
    });
    return response.data;
  },

  // Получить операции пользователя
  getUserOperations: async (id: string, params?: { limit?: number; offset?: number; type?: string; status?: string }) => {
    const response = await api.get(`/admin/users/${id}/operations`, { params });
    return response.data;
  },

  // Получить рефералов пользователя
  getUserReferrals: async (
    id: string,
    params?: { limit?: number; offset?: number; wave?: string; status?: string; search?: string }
  ): Promise<{ success: boolean; data: AdminReferralsList; message: string }> => {
    const response = await api.get<{ success: boolean; data: AdminReferralsList; message: string }>(
      `/admin/users/${id}/referrals`,
      { params }
    );
    return response.data;
  },

  // ===== НОВЫЕ МОДЕРАТОРСКИЕ ЭНДПОИНТЫ =====

  // Получить упрощенный список пользователей
  getSimpleUsers: async (params?: UserListQuery): Promise<SimpleUserListResponse> => {
    const response = await api.get<SimpleUserListResponse>('/admin/users/simple', {
      params,
    });
    return response.data;
  },

  // Изменить username пользователя
  updateUserUsername: async (id: string, data: UpdateUserUsernameData): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/admin/users/${id}/username`, data);
    return response.data;
  },

  // Изменить tgId пользователя
  updateUserTgId: async (id: string, data: UpdateUserTgIdData): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/admin/users/${id}/tgid`, data);
    return response.data;
  },
};