import axios from 'axios';

// Создаем отдельный axios instance для auth
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true, // Для httpOnly cookies
  timeout: 5000, // Уменьшили таймаут для быстрой проверки
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для обработки ответов и 401 ошибок
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // При 401 ошибке cookie автоматически станут недействительными
    if (error.response?.status === 401) {
      console.warn('Authentication expired, cookies invalidated');
      // Можно добавить редирект на страницу логина, но это лучше делать в компонентах
    }
    return Promise.reject(error);
  }
);

// Типы для API
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
  // Токен не возвращается, сохраняется в httpOnly cookie автоматически
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

// API методы
export const authApiMethods = {
  // Вход в систему
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await authApi.post<LoginResponse>('/auth/admin/login', credentials);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Ошибка входа в систему',
        statusCode: error.response?.status || 500,
      } as ApiError;
    }
  },

  // Выход из системы
  logout: async (): Promise<void> => {
    try {
      await authApi.post('/auth/admin/logout');
    } catch (error: any) {
      // Логаут должен работать даже при ошибках сервера
      console.warn('Logout API error:', error);
    }
  },

  // Получение текущего пользователя
  getCurrentUser: async (): Promise<AuthUser> => {
    try {
      const response = await authApi.get<{ user: AuthUser }>('/auth/admin/me');
      return response.data.user;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Ошибка получения данных пользователя',
        statusCode: error.response?.status || 500,
      } as ApiError;
    }
  },

  // Обновление токена
  refreshToken: async (): Promise<AuthUser> => {
    try {
      const response = await authApi.post<{ user: AuthUser }>('/auth/admin/refresh');
      return response.data.user;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Ошибка обновления токена',
        statusCode: error.response?.status || 500,
      } as ApiError;
    }
  },

  // Проверка токена
  verifyToken: async (): Promise<{ valid: boolean; user?: AuthUser }> => {
    try {
      const response = await authApi.get<{ user: AuthUser }>('/auth/admin/verify');
      return { valid: true, user: response.data.user };
    } catch (error: any) {
      return { valid: false };
    }
  },
};

export { authApi };