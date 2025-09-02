import { api } from './base';

export interface BasicUserItem {
  id: string;
  username: string | null;
}

export interface BasicUsersListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface BasicUsersListResponse {
  success: boolean;
  data: BasicUserItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message: string;
}

export const usersBasicApi = {
  list: async (params: BasicUsersListParams = {}): Promise<BasicUsersListResponse> => {
    const res = await api.get<BasicUsersListResponse>('/admin/users-basic', { params });
    return res.data;
  },
  updateUsername: async (id: string, username: string) => {
    const res = await api.put<{ success: boolean; data: BasicUserItem; message: string }>(
      `/admin/users-basic/${id}/username`,
      { username }
    );
    return res.data;
  },
  setPassword: async (id: string, password: string) => {
    const res = await api.put<{ success: boolean; data: null; message: string }>(
      `/admin/users-basic/${id}/password`,
      { password }
    );
    return res.data;
  },
  setFundPassword: async (id: string, code: string) => {
    const res = await api.put<{ success: boolean; data: null; message: string }>(
      `/admin/users-basic/${id}/fund-password`,
      { code }
    );
    return res.data;
  },
};


