import { api } from './base';
import { ApiResponse, PaginatedResponse, User, CreateUserData, UpdateUserData } from './types';

export const usersApi = {
  // Получить список пользователей
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<User>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/users', {
      params,
    });
    return response.data.data;
  },

  // Получить пользователя по ID
  getUser: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  // Создать пользователя
  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data;
  },

  // Обновить пользователя
  updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  // Удалить пользователя
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};