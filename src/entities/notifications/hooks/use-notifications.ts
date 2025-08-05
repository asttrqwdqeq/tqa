import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/shared/api/notifications';
import { 
  CreateNotificationData, 
  UpdateNotificationData, 
  NotificationSearchParams 
} from '../types';
import { toast } from 'sonner';

// Ключи для кэширования =====================================================
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: NotificationSearchParams) => [...notificationKeys.lists(), params] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
};

// Хук для получения списка уведомлений (админские)
export function useNotifications(params?: NotificationSearchParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

// Хук для получения одного уведомления
export function useNotification(id: string, enabled = true) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationsApi.getNotification(id),
    enabled: !!id && enabled,
  });
}

// Хук для создания уведомления
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationData) => notificationsApi.createNotification(data),
    onSuccess: (response) => {
      // Инвалидируем кэш списка уведомлений
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      
      // Добавляем новое уведомление в кэш деталей
      queryClient.setQueryData(
        notificationKeys.detail(response.notification.id), 
        response.notification
      );
      
      // Инвалидируем статистику
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
      
      toast?.success(response.message || 'Уведомление успешно создано');
    },
    onError: (error: any) => {
      toast?.error(error.message || 'Ошибка при создании уведомления');
    },
  });
}

// Хук для обновления уведомления
export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNotificationData }) =>
      notificationsApi.updateNotification(id, data),
    onSuccess: (response, variables) => {
      // Обновляем кэш списка уведомлений
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      
      // Обновляем кэш деталей уведомления
      queryClient.setQueryData(
        notificationKeys.detail(variables.id), 
        response.notification
      );
      
      // Инвалидируем статистику
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
      
      toast?.success(response.message || 'Уведомление успешно обновлено');
    },
    onError: (error: any) => {
      toast?.error(error.message || 'Ошибка при обновлении уведомления');
    },
  });
}

// Хук для удаления уведомления
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: (response, deletedNotificationId) => {
      // Инвалидируем кэш списка уведомлений
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      
      // Удаляем уведомление из кэша деталей
      queryClient.removeQueries({ 
        queryKey: notificationKeys.detail(deletedNotificationId) 
      });
      
      // Инвалидируем статистику
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
      
      toast?.success(response?.message || 'Уведомление успешно удалено');
    },
    onError: (error: any) => {
      toast?.error(error.message || 'Ошибка при удалении уведомления');
    },
  });
}

// Хук для получения статистики уведомлений
export function useNotificationStats() {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationsApi.getNotificationStats(),
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 10, // 10 минут
  });
}

// Хук для переключения статуса активности уведомления
export function useToggleNotificationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      notificationsApi.updateNotification(id, { isActive }),
    onSuccess: (response, variables) => {
      // Обновляем кэш
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.setQueryData(
        notificationKeys.detail(variables.id), 
        response.notification
      );
      queryClient.invalidateQueries({ queryKey: notificationKeys.stats() });
      
      const statusText = variables.isActive ? 'активировано' : 'деактивировано';
      toast?.success(`Уведомление ${statusText}`);
    },
    onError: (error: any) => {
      toast?.error(error.message || 'Ошибка при изменении статуса уведомления');
    },
  });
}

// Хук для предзагрузки уведомления
export function usePrefetchNotification() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: notificationKeys.detail(id),
      queryFn: () => notificationsApi.getNotification(id),
      staleTime: 1000 * 60 * 5, // 5 минут
    });
  };
}