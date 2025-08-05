import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApiMethods, LoginCredentials, AuthUser, ApiError } from '@/shared/api/auth';

// Query keys для кеширования
export const authQueryKeys = {
  all: ['auth'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
  verification: () => [...authQueryKeys.all, 'verification'] as const,
};

// Хук для получения текущего пользователя
export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKeys.user(),
    queryFn: authApiMethods.getCurrentUser,
    enabled: false, // Не запускаем автоматически
    retry: false, // Никаких ретраев для быстроты
    staleTime: 2 * 60 * 1000, // 2 минуты (уменьшено)
    gcTime: 5 * 60 * 1000, // 5 минут (уменьшено)
    refetchOnWindowFocus: false, // Не перезапрашиваем при фокусе
    refetchOnMount: false, // Не перезапрашиваем при монтировании
  });
}

// Хук для проверки токена
export function useTokenVerification() {
  return useQuery({
    queryKey: authQueryKeys.verification(),
    queryFn: authApiMethods.verifyToken,
    enabled: false,
    retry: false,
    staleTime: 30 * 1000, // 30 секунд
  });
}

// Хук для входа в систему
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApiMethods.login(credentials),
    onSuccess: (data) => {
      // Сохраняем пользователя в кеш
      queryClient.setQueryData(authQueryKeys.user(), data.user);
      // Помечаем токен как валидный
      queryClient.setQueryData(authQueryKeys.verification(), { valid: true, user: data.user });
      console.log('Login successful:', data.message);
    },
    onError: (error: ApiError) => {
      console.error('Login error:', error);
      // Очищаем кеш при ошибке
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
    },
  });
}

// Хук для выхода из системы
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApiMethods.logout,
    onSuccess: () => {
      // Очищаем весь кеш авторизации
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
      console.log('Logout successful');
    },
    onError: (error) => {
      console.warn('Logout error:', error);
      // Все равно очищаем кеш даже при ошибке
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
    },
    onSettled: () => {
      // В любом случае очищаем кеш
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
    },
  });
}

// Хук для обновления токена
export function useRefreshToken() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApiMethods.refreshToken,
    onSuccess: (user) => {
      // Обновляем данные пользователя в кеше
      queryClient.setQueryData(authQueryKeys.user(), user);
      queryClient.setQueryData(authQueryKeys.verification(), { valid: true, user });
      console.log('Token refreshed successfully');
    },
    onError: (error: ApiError) => {
      console.error('Token refresh error:', error);
      // При ошибке обновления очищаем кеш
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
    },
  });
}

// Упрощенный хук для ручной проверки авторизации
export function useCheckAuth() {
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUser();
  
  const checkAuth = async () => {
    try {
      // Делаем только один запрос - этого достаточно для cookie-based auth
      const userData = await currentUserQuery.refetch();
      return userData.data;
    } catch (error) {
      console.error('Auth check failed:', error);
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
      return null;
    }
  };
  
  return {
    checkAuth,
    isChecking: currentUserQuery.isFetching,
  };
}