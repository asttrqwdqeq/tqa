import { api } from './base';
import { 
  ApiResponse,
  CreateNotificationData,
  UpdateNotificationData,
  NotificationListResponse,
  NotificationResponse,
  NotificationActionResponse,
  NotificationSearchParams,
  NotificationStats,
  Notification
} from './types';

export const notificationsApi = {
  // Получить список уведомлений (админские)
  getNotifications: async (params?: NotificationSearchParams): Promise<NotificationListResponse> => {
    const response = await api.get<ApiResponse<NotificationListResponse>>('/notifications/admin', {
      params,
    });
    return response.data.data;
  },

  // Получить уведомление по ID
  getNotification: async (id: string): Promise<Notification> => {
    const response = await api.get<NotificationResponse>(`/notifications/admin/${id}`);
    return response.data.notification;
  },

  // Создать уведомление
  createNotification: async (data: CreateNotificationData): Promise<NotificationActionResponse> => {
    const response = await api.post<NotificationActionResponse>('/notifications', data);
    return response.data;
  },

  // Обновить уведомление
  updateNotification: async (id: string, data: UpdateNotificationData): Promise<NotificationActionResponse> => {
    const response = await api.put<NotificationActionResponse>(`/notifications/admin/${id}`, data);
    return response.data;
  },

  // Удалить уведомление
  deleteNotification: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/notifications/admin/${id}`);
    return response.data;
  },

  // Получить статистику уведомлений (дополнительный эндпоинт)
  getNotificationStats: async (): Promise<NotificationStats> => {
    // Этот эндпоинт нужно будет добавить в бэкенд
    const response = await api.get<ApiResponse<NotificationStats>>('/notifications/stats');
    return response.data.data;
  },
};