import { QueryClient } from "@tanstack/react-query";

// Функция для создания нового QueryClient
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Время кэширования данных (5 минут)
        staleTime: 5 * 60 * 1000,
        // Время хранения в кэше (10 минут)
        gcTime: 10 * 60 * 1000,
        // Повторные запросы при ошибках
        retry: (failureCount, error: any) => {
          // Не повторять запросы при 4xx ошибках
          if (error?.response?.status >= 400 && error?.response?.status < 500) {
            return false;
          }
          // Максимум 3 попытки для других ошибок
          return failureCount < 3;
        },
        // Интервал между повторными запросами
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
}

// Глобальная переменная для браузера (не используется на сервере)
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // На сервере всегда создаем новый клиент
    return makeQueryClient();
  } else {
    // В браузере используем существующий или создаем новый
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}