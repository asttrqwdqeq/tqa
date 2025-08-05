"use client";
import { LoginForm, LoginFormData } from "@/widgets/login-form/login-form";
import { useAuth } from "@/entities/auth/provider/auth-provider";

export function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error) {
      // Ошибка уже обработана в контексте
      console.error('Login failed:', error);
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      isLoading={isLoggingIn}
      error={loginError?.message || null}
    />
  );
}