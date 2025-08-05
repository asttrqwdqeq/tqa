// Provider
export { AuthProvider, useAuth } from './provider/auth-provider';

// Hooks
export {
  useCurrentUser,
  useLogin,
  useLogout,
  useCheckAuth,
  useRefreshToken,
  useTokenVerification,
  authQueryKeys
} from './hooks/use-auth-queries';

// Types (re-export from shared/api)
export type { AuthUser, LoginCredentials, ApiError } from '@/shared/api/auth';  