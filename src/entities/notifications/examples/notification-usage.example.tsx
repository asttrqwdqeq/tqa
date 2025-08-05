/**
 * Примеры использования типов уведомлений в компонентах
 * Этот файл служит справочником и не используется в production
 */

import React from 'react';
import { 
  useNotifications, 
  useCreateNotification,
  useUpdateNotification,
  useDeleteNotification,
  useToggleNotificationStatus,
  type Notification,
  type CreateNotificationData,
  type NotificationType,
  type NotificationSearchParams
} from '@/entities/notifications';

// ============================================================================
// Пример 1: Простой список уведомлений
// ============================================================================

export function NotificationsList() {
  const { data, isLoading, error } = useNotifications({
    page: 1,
    limit: 10,
    isActive: true
  });

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <div className="notifications-list">
      <h2>Уведомления ({data?.total})</h2>
      {data?.notifications.map((notification: Notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

// ============================================================================
// Пример 2: Карточка уведомления с типизированными пропсами
// ============================================================================

interface NotificationCardProps {
  notification: Notification;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function NotificationCard({ notification, onEdit, onDelete }: NotificationCardProps) {
  const toggleMutation = useToggleNotificationStatus();

  // Типизированная функция для получения цвета по типу
  const getTypeColor = (type: NotificationType): string => {
    const colors: Record<NotificationType, string> = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      success: 'bg-green-100 text-green-800',
    };
    return colors[type];
  };

  const handleToggleStatus = () => {
    toggleMutation.mutate({
      id: notification.id,
      isActive: !notification.isActive
    });
  };

  return (
    <div className="notification-card border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold">{notification.title}</h3>
          <p className="text-gray-600 mt-1">{notification.message}</p>
          
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(notification.type)}`}>
              {notification.type}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              notification.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {notification.isActive ? 'Активно' : 'Неактивно'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleToggleStatus}
            disabled={toggleMutation.isPending}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {notification.isActive ? 'Деактивировать' : 'Активировать'}
          </button>
          
          {onEdit && (
            <button
              onClick={() => onEdit(notification.id)}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Редактировать
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(notification.id)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Удалить
            </button>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        Создано: {new Date(notification.createdAt).toLocaleString()}
        {notification.createdBy && ` | Автор: ${notification.createdBy}`}
      </div>
    </div>
  );
}

// ============================================================================
// Пример 3: Форма создания уведомления с типизацией
// ============================================================================

interface NotificationFormData extends CreateNotificationData {
  // Можно расширить локальными полями формы
  priority?: 'low' | 'medium' | 'high';
}

export function CreateNotificationForm() {
  const createMutation = useCreateNotification();
  const [formData, setFormData] = React.useState<NotificationFormData>({
    title: '',
    message: '',
    isActive: true,
    priority: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Типизированные данные для отправки
    const submitData: CreateNotificationData = {
      title: formData.title,
      message: formData.message,
      isActive: formData.isActive,
    };

    createMutation.mutate(submitData, {
      onSuccess: () => {
        setFormData({
          title: '',
          message: '',
          isActive: true,
          priority: 'medium'
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Заголовок
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Сообщение
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="rounded border-gray-300"
        />
        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
          Активно
        </label>
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {createMutation.isPending ? 'Создание...' : 'Создать уведомление'}
      </button>
    </form>
  );
}

// ============================================================================
// Пример 4: Фильтры с типизированными параметрами
// ============================================================================

interface NotificationFiltersProps {
  onFiltersChange: (filters: NotificationSearchParams) => void;
  currentFilters: NotificationSearchParams;
}

export function NotificationFilters({ onFiltersChange, currentFilters }: NotificationFiltersProps) {
  const notificationTypes: NotificationType[] = ['info', 'warning', 'error', 'success'];

  const handleTypeChange = (type: NotificationType | '') => {
    onFiltersChange({
      ...currentFilters,
      type: type || undefined,
      page: 1 // Сброс на первую страницу при изменении фильтров
    });
  };

  const handleStatusChange = (status: string) => {
    const isActive = status === 'active' ? true : status === 'inactive' ? false : undefined;
    onFiltersChange({
      ...currentFilters,
      isActive,
      page: 1
    });
  };

  return (
    <div className="filters-panel bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Поиск
          </label>
          <input
            type="text"
            value={currentFilters.search || ''}
            onChange={(e) => onFiltersChange({
              ...currentFilters,
              search: e.target.value || undefined,
              page: 1
            })}
            placeholder="Поиск по заголовку или тексту..."
            className="w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Тип
          </label>
          <select
            value={currentFilters.type || ''}
            onChange={(e) => handleTypeChange(e.target.value as NotificationType | '')}
            className="w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Все типы</option>
            {notificationTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Статус
          </label>
          <select
            value={
              currentFilters.isActive === true ? 'active' : 
              currentFilters.isActive === false ? 'inactive' : 'all'
            }
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="all">Все</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Пример 5: Хук для управления состоянием фильтров
// ============================================================================

export function useNotificationFilters() {
  const [filters, setFilters] = React.useState<NotificationSearchParams>({
    page: 1,
    limit: 10,
    search: undefined,
    type: undefined,
    isActive: undefined,
  });

  const updateFilters = React.useCallback((newFilters: Partial<NotificationSearchParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      search: undefined,
      type: undefined,
      isActive: undefined,
    });
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters,
    setFilters,
  };
}

// ============================================================================
// Пример 6: Type Guards и утилиты
// ============================================================================

export const NotificationUtils = {
  // Проверка типа уведомления
  isNotificationType(value: string): value is NotificationType {
    return ['info', 'warning', 'error', 'success'].includes(value);
  },

  // Форматирование даты
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('ru-RU');
  },

  // Получение иконки по типу
  getTypeIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      info: '📄',
      warning: '⚠️',
      error: '❌',
      success: '✅',
    };
    return icons[type];
  },

  // Проверка активности
  isActive(notification: Notification): boolean {
    return notification.isActive;
  },

  // Фильтрация по типу
  filterByType(notifications: Notification[], type?: NotificationType): Notification[] {
    if (!type) return notifications;
    return notifications.filter(n => n.type === type);
  },

  // Сортировка по дате
  sortByDate(notifications: Notification[], direction: 'asc' | 'desc' = 'desc'): Notification[] {
    return [...notifications].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return direction === 'desc' ? dateB - dateA : dateA - dateB;
    });
  },
};