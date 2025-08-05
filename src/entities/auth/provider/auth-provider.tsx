"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  useCurrentUser, 
  useLogin, 
  useLogout, 
  useCheckAuth,
  useRefreshToken 
} from '../hooks/use-auth-queries';
import { AuthUser, LoginCredentials, ApiError } from '@/shared/api/auth';

// Типы для контекста
interface AuthContextType {
  // Состояние пользователя
  user: AuthUser | null;  
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Методы авторизации
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  
  // Состояния операций
  loginError: ApiError | null;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
}

// Создаем контекст
const AuthContext = createContext<AuthContextType | null>(null);

// Публичные маршруты (не требуют авторизации)
const PUBLIC_ROUTES = ['/login', '/'];

// Компонент загрузки (минималистичный для быстроты)
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
}

// AuthProvider компонент
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Состояние инициализации
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Хуки для работы с авторизацией
  const currentUserQuery = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshMutation = useRefreshToken();
  
  // Вычисляемые значения
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const user = currentUserQuery.data || null;
  const isAuthenticated = !!user;
  const isLoading = currentUserQuery.isLoading || currentUserQuery.isFetching;

  // Быстрая инициализация с таймаутом
  useEffect(() => {
    if (isInitialized) return;

    const initializeAuth = async () => {
      try {
        // Устанавливаем таймаут для быстрой инициализации
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth check timeout')), 3000)
        );
        
        // Гонка между запросом и таймаутом
        await Promise.race([
          currentUserQuery.refetch(),
          timeoutPromise
        ]);
      } catch (error) {
        console.warn('Auth initialization timed out or failed:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []); // Запускаем только один раз

  // Обработка маршрутизации после инициализации
  useEffect(() => {
    if (!isInitialized) return;

    // Небольшая задержка для избежания мерцания
    const redirectTimeout = setTimeout(() => {
      // Если пользователь авторизован и находится на публичной странице
      if (isAuthenticated && isPublicRoute) {
        router.push('/dashboard');
        return;
      }

      // Если пользователь не авторизован и находится на приватной странице  
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
        return;
      }
    }, 100);

    return () => clearTimeout(redirectTimeout);
  }, [isAuthenticated, isPublicRoute, isInitialized, router]);

  // Методы авторизации
  const login = async (credentials: LoginCredentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
      // После успешного логина перенаправляем на приватную страницу
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // После логаута перенаправляем на главную
      router.push('/');
    } catch (error) {
      // Даже при ошибке API перенаправляем на главную
      router.push('/');
      throw error;
    }
  };

  const refreshAuth = async () => {
    try {
      await refreshMutation.mutateAsync();
    } catch (error) {
      // При ошибке обновления выходим из системы
      await logout();
      throw error;
    }
  };

  // Значение контекста
  const contextValue: AuthContextType = {
    // Состояние пользователя
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    
    // Методы авторизации
    login,
    logout,
    refreshAuth,
    
    // Состояния операций
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };

  // Показываем загрузку во время инициализации
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  // Показываем загрузку во время перенаправления
  if ((isAuthenticated && isPublicRoute) || (!isAuthenticated && !isPublicRoute)) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Хук для использования контекста
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}