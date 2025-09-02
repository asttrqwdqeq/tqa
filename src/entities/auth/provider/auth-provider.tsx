"use client";
import { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  useCurrentUser,
  useLogin,
  useLogout,
} from '../hooks/use-auth-queries';
import type { AuthUser, LoginCredentials, ApiError } from '@/shared/api/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loginError: ApiError | null;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const currentUserQuery = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    currentUserQuery.refetch().catch(() => {});
  }, []);

  // Restrict access to superadmin routes for non-super-admin roles
  useEffect(() => {
    if (!currentUserQuery.data) return;
    if (pathname?.startsWith('/superadmin') && currentUserQuery.data.role !== 'super_admin') {
      router.replace('/admin/dashboard');
    }
  }, [pathname, currentUserQuery.data, router]);

  const contextValue = useMemo<AuthContextType>(() => ({
    user: currentUserQuery.data || null,
    isAuthenticated: Boolean(currentUserQuery.data),
    isLoading: currentUserQuery.isLoading || currentUserQuery.isFetching,
    login: async (credentials: LoginCredentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    loginError: loginMutation.error as ApiError | null,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }), [currentUserQuery.data, currentUserQuery.isLoading, currentUserQuery.isFetching, loginMutation.error, loginMutation.isPending, logoutMutation.isPending, loginMutation, logoutMutation]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


