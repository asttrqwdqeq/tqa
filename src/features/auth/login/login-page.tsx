"use client";
import { LoginForm, LoginFormData } from "@/widgets/login-form/login-form";
import { useLogin } from "@/entities/auth";
import { useRouter } from "next/navigation";

export function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();

  const handleLogin = async (data: LoginFormData) => {
    try {
      const res = await loginMutation.mutateAsync(data);
      const role = res?.user?.role;
      const next = role === 'super_admin' ? '/superadmin/dashboard' : '/admin/dashboard';
      await router.push(next);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      isLoading={loginMutation.isPending}
      error={(loginMutation.error as any)?.message || null}
    />
  );
}