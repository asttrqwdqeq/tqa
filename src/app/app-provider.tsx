"use client";
import { ThemeProvider } from "next-themes";
import { getQueryClient } from "@/shared/config/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/entities/auth";
import { useState } from "react";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  // Создаем QueryClient только один раз при инициализации компонента
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system">
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
      {/* DevTools только в development режиме */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}