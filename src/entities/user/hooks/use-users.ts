import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/shared/api/users';
import { CreateUserData, UpdateUserData } from '@/shared/api/types';
import { toast } from 'sonner'; // Если используете sonner для уведомлений

// Ключи для кэширования
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: any) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Хук для получения списка пользователей
export function useUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getUsers(params),
    // Рефетчить данные при фокусе на окно
    refetchOnWindowFocus: true,
    // Интервал автообновления (опционально)
    // refetchInterval: 30000, // 30 секунд
  });
}

// Хук для получения одного пользователя
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getUser(id),
    enabled: !!id && enabled,
  });
}

// Хук для создания пользователя
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => usersApi.createUser(data),
    onSuccess: (newUser) => {
      // Инвалидируем кэш списка пользователей
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Добавляем нового пользователя в кэш деталей
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
      
      toast?.success('Пользователь успешно создан');
    },
    onError: (error: any) => {
      toast?.error(error.message || 'Ошибка при создании пользователя');
    },
  });
}

// Хук для обновления пользователя
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      usersApi.updateUser(id, data),
    onSuccess: (updatedUser, variables) => {
      // Обновляем кэш списка пользователей
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Обновляем кэш деталей пользователя
      queryClient.setQueryData(userKeys.detail(variables.id), updatedUser);
      
      toast?.success('Пользователь успешно обновлен');
    },
    onError: (error: any) => {
      toast?.error(error.message || 'Ошибка при обновлении пользователя');
    },
  });
}

// Хук для удаления пользователя
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: (_, deletedUserId) => {
      // Инвалидируем кэш списка пользователей
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Удаляем пользователя из кэша деталей
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedUserId) });
      
      toast?.success('Пользователь успешно удален');
    },
    onError: (error: any) => {
      toast?.error(error.message || 'Ошибка при удалении пользователя');
    },
  });
}

// Хук для префетчинга пользователя (предзагрузка)
export function usePrefetchUser() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: userKeys.detail(id),
      queryFn: () => usersApi.getUser(id),
      // Время актуальности предзагруженных данных
      staleTime: 1000 * 60 * 5, // 5 минут
    });
  };
}