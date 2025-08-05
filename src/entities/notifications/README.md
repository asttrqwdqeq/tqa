# Notifications Entity

Entity для работы с уведомлениями в админ-панели.

## Структура

```
notifications/
├── hooks/
│   └── use-notifications.ts  # React Query хуки для уведомлений
├── types.ts                  # Типы TypeScript для уведомлений
├── index.ts                  # Экспорты entity
└── README.md                 # Документация
```

## Типы

### Основные интерфейсы

```typescript
// Тип уведомления
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

// Базовый интерфейс уведомления
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  targetUserId?: string;
  createdBy: string;
}

// DTO для создания
export interface CreateNotificationData {
  title: string;
  message: string;
  isActive?: boolean;
}

// DTO для обновления
export interface UpdateNotificationData {
  title?: string;
  message?: string;
  isActive?: boolean;
}
```

### Ответы API

```typescript
// Список уведомлений
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

// Одно уведомление
export interface NotificationResponse {
  notification: Notification;
  message: string;
}

// Создание/обновление
export interface NotificationActionResponse {
  notification: Notification;
  message: string;
}
```

### Параметры поиска

```typescript
export interface NotificationSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: NotificationType;
  isActive?: boolean;
}
```

### Статистика

```typescript
export interface NotificationStats {
  total: number;
  active: number;
  inactive: number;
  byType: Record<NotificationType, number>;
}
```

## Хуки

### useNotifications(params?)
Получение списка уведомлений с пагинацией и фильтрацией.

```typescript
const { data, isLoading, error } = useNotifications({
  page: 1,
  limit: 10,
  type: 'info',
  isActive: true,
});
```

### useNotification(id, enabled?)
Получение одного уведомления по ID.

```typescript
const { data: notification, isLoading } = useNotification('notification-id');
```

### useCreateNotification()
Создание нового уведомления.

```typescript
const createMutation = useCreateNotification();

const handleCreate = () => {
  createMutation.mutate({
    title: 'Новое уведомление',
    message: 'Содержание уведомления',
    isActive: true,
  });
};
```

### useUpdateNotification()
Обновление существующего уведомления.

```typescript
const updateMutation = useUpdateNotification();

const handleUpdate = (id: string) => {
  updateMutation.mutate({
    id,
    data: {
      title: 'Обновленный заголовок',
      isActive: false,
    },
  });
};
```

### useDeleteNotification()
Удаление уведомления.

```typescript
const deleteMutation = useDeleteNotification();

const handleDelete = (id: string) => {
  deleteMutation.mutate(id);
};
```

### useToggleNotificationStatus()
Переключение статуса активности уведомления.

```typescript
const toggleMutation = useToggleNotificationStatus();

const handleToggle = (id: string, isActive: boolean) => {
  toggleMutation.mutate({ id, isActive });
};
```

### useNotificationStats()
Получение статистики уведомлений.

```typescript
const { data: stats } = useNotificationStats();
// stats.total, stats.active, stats.byType...
```

### usePrefetchNotification()
Предзагрузка уведомления для оптимизации UX.

```typescript
const prefetch = usePrefetchNotification();

const handleHover = (id: string) => {
  prefetch(id);
};
```

## Кэширование

Все хуки используют React Query для кэширования и автоматического обновления данных:

- **Ключи кэша**: Используются типизированные ключи через `notificationKeys`
- **Инвалидация**: Автоматическая инвалидация связанных запросов при мутациях
- **Время жизни**: 5-10 минут для большинства запросов
- **Фоновое обновление**: При фокусе на окно

## API эндпоинты

```typescript
// Все эндпоинты требуют AdminGuard
GET    /notifications/admin           # Список уведомлений
GET    /notifications/admin/:id       # Одно уведомление
POST   /notifications                 # Создать уведомление
PUT    /notifications/admin/:id       # Обновить уведомление
DELETE /notifications/admin/:id       # Удалить уведомление
GET    /notifications/stats           # Статистика (требует реализации в бэкенде)
```

## Использование

### В компонентах

```typescript
import { 
  useNotifications, 
  useCreateNotification,
  NotificationType 
} from '@/entities/notifications';

export function NotificationsPage() {
  const { data, isLoading } = useNotifications({ 
    page: 1, 
    limit: 20 
  });
  
  const createMutation = useCreateNotification();
  
  if (isLoading) return <div>Загрузка...</div>;
  
  return (
    <div>
      {data?.notifications.map(notification => (
        <div key={notification.id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <span className={`badge badge-${notification.type}`}>
            {notification.type}
          </span>
        </div>
      ))}
    </div>
  );
}
```

### В формах

```typescript
import { useCreateNotification, CreateNotificationData } from '@/entities/notifications';

export function CreateNotificationForm() {
  const createMutation = useCreateNotification();
  
  const onSubmit = (data: CreateNotificationData) => {
    createMutation.mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* поля формы */}
    </form>
  );
}
```

## Интеграция с бэкендом

Entity ожидает, что бэкенд предоставляет эндпоинты согласно API документации в `backend/src/entities/notifications/README.md`.

### Соответствие типов

Типы в админке соответствуют DTO из бэкенда:
- `Notification` ↔ `NotificationResponseDto`
- `CreateNotificationData` ↔ `CreateNotificationDto`
- `UpdateNotificationData` ↔ `UpdateNotificationDto`
- `NotificationListResponse` ↔ `NotificationListResponseDto`

### Обработка ошибок

Все мутации имеют встроенную обработку ошибок с toast-уведомлениями и логированием в React Query DevTools.

## Тестирование

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useNotifications } from '@/entities/notifications';
import { createWrapper } from '@/test-utils';

test('should fetch notifications', async () => {
  const { result } = renderHook(
    () => useNotifications(),
    { wrapper: createWrapper() }
  );
  
  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
  
  expect(result.current.data).toBeDefined();
});
```