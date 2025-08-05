import axios from 'axios';

// Общий axios instance для всех API запросов
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
  withCredentials: true, // Важно: для отправки httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request - cookies may be expired');
      // 401 ошибки обрабатываются в AuthProvider через TanStack Query
    }
    
    // Логируем другие ошибки
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status, error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;