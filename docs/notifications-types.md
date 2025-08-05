# Notifications Types - Документация типов уведомлений

Полное описание типов и структуры для работы с уведомлениями в админ-панели.

## Архитектура

Типы уведомлений организованы согласно принципам FSD (Feature-Sliced Design):

```
admin/src/
├── entities/notifications/          # Entity слой
│   ├── hooks/use-notifications.ts   # React Query хуки
│   ├── types.ts                     # Реэкспорт типов
│   ├── index.ts                     # Публичный API entity
│   └── README.md                    # Документация entity
├── shared/api/
│   ├── notifications.ts             # API методы
│   └── types.ts                     # Все типы приложения
└── docs/
    └── notifications-types.md       # Этот файл
```

## Базовые типы

### NotificationType
```typescript
export type NotificationType = 'info' | 'warning' | 'error' | 'success';
```

Типы уведомлений для категоризации и стилизации:
- `info` - Информационные уведомления (синий цвет)
- `warning` - Предупреждения (желтый цвет)
- `error` - Ошибки и критические события (красный цвет)
- `success` - Успешные операции (зеленый цвет)

### Notification
```typescript
export interface Notification {
  id: string;                    // Уникальный идентификатор
  title: string;                 // Заголовок уведомления
  message: string;               // Текст уведомления
  type: NotificationType;        // Тип уведомления
  isActive: boolean;             // Статус активности
  createdAt: string;             // Дата создания (ISO string)
  updatedAt: string;             // Дата обновления (ISO string)
  expiresAt?: string;            // Дата истечения (опционально)
  targetUserId?: string;         // ID целевого пользователя (опционально)
  createdBy: string;             // ID админа-создателя
}
```

## DTO (Data Transfer Objects)

### CreateNotificationData
```typescript
export interface CreateNotificationData {
  title: string;        // Обязательный заголовок
  message: string;      // Обязательный текст
  isActive?: boolean;   // Опциональный статус (по умолчанию true)
}
```

Минимальные данные для создания уведомления. Остальные поля заполняются автоматически на бэкенде.

### UpdateNotificationData
```typescript
export interface UpdateNotificationData {
  title?: string;       // Опциональное обновление заголовка
  message?: string;     // Опциональное обновление текста
  isActive?: boolean;   // Опциональное изменение статуса
}
```

Частичное обновление уведомления. Все поля опциональны.

## API Response Types

### NotificationListResponse
```typescript
export interface NotificationListResponse {
  notifications: Notification[];   // Массив уведомлений
  total: number;                   // Общее количество
  page: number;                    // Текущая страница
  limit: number;                   // Размер страницы
}
```

Ответ для списка уведомлений с пагинацией.

### NotificationResponse
```typescript
export interface NotificationResponse {
  notification: Notification;      // Объект уведомления
  message: string;                 // Сообщение от сервера
}
```

Ответ для получения одного уведомления.

### NotificationActionResponse
```typescript
export interface NotificationActionResponse {
  notification: Notification;      // Обновленный объект
  message: string;                 // Сообщение об успехе
}
```

Ответ для операций создания/обновления уведомления.

## Параметры и фильтры

### NotificationSearchParams
```typescript
export interface NotificationSearchParams {
  page?: number;                   // Номер страницы (по умолчанию 1)
  limit?: number;                  // Размер страницы (по умолчанию 10)
  search?: string;                 // Поиск по заголовку/тексту
  type?: NotificationType;         // Фильтр по типу
  isActive?: boolean;              // Фильтр по статусу активности
}
```

Параметры для поиска и фильтрации уведомлений.

## Статистика и аналитика

### NotificationStats
```typescript
export interface NotificationStats {
  total: number;                              // Общее количество
  active: number;                             // Количество активных
  inactive: number;                           // Количество неактивных
  byType: Record<NotificationType, number>;   // Количество по типам
}
```

Статистические данные для дашборда и аналитики.

## Примеры использования типов

### Создание уведомления
```typescript
const createData: CreateNotificationData = {
  title: "Обновление системы",
  message: "Система будет недоступна с 2:00 до 4:00",
  isActive: true
};
```

### Обновление уведомления
```typescript
const updateData: UpdateNotificationData = {
  title: "Обновленный заголовок",
  isActive: false
};
```

### Фильтрация уведомлений
```typescript
const searchParams: NotificationSearchParams = {
  page: 1,
  limit: 20,
  type: 'warning',
  isActive: true,
  search: 'система'
};
```

### Обработка ответа API
```typescript
const handleResponse = (response: NotificationActionResponse) => {
  console.log(response.message);           // "Notification created successfully"
  console.log(response.notification.id);   // "cm5abc123def456"
  console.log(response.notification.type); // "info"
};
```

## Type Guards

Полезные функции для проверки типов:

```typescript
// Проверка типа уведомления
export function isNotificationType(value: string): value is NotificationType {
  return ['info', 'warning', 'error', 'success'].includes(value);
}

// Проверка активности уведомления
export function isActiveNotification(notification: Notification): boolean {
  return notification.isActive;
}

// Проверка истечения срока
export function isExpiredNotification(notification: Notification): boolean {
  if (!notification.expiresAt) return false;
  return new Date(notification.expiresAt) < new Date();
}
```

## Utility Types

Дополнительные типы для удобства:

```typescript
// Только поля для отображения
export type NotificationDisplay = Pick<Notification, 'id' | 'title' | 'message' | 'type' | 'isActive'>;

// Только поля для редактирования
export type NotificationEditable = Pick<Notification, 'title' | 'message' | 'isActive'>;

// Обязательные поля при создании
export type NotificationRequired = Required<CreateNotificationData>;

// Статистика по одному типу
export type TypeStats = {
  type: NotificationType;
  count: number;
  percentage: number;
};
```

## Валидация

Примеры схем валидации (используя zod):

```typescript
import { z } from 'zod';

export const NotificationTypeSchema = z.enum(['info', 'warning', 'error', 'success']);

export const CreateNotificationSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').max(100, 'Слишком длинный заголовок'),
  message: z.string().min(1, 'Сообщение обязательно').max(500, 'Слишком длинное сообщение'),
  isActive: z.boolean().optional().default(true),
});

export const NotificationSearchSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  type: NotificationTypeSchema.optional(),
  isActive: z.boolean().optional(),
});
```

## Связь с бэкендом

Соответствие типов фронтенда и бэкенда:

| Frontend Type | Backend DTO | Описание |
|---------------|-------------|----------|
| `Notification` | `NotificationResponseDto` | Полный объект уведомления |
| `CreateNotificationData` | `CreateNotificationDto` | Данные для создания |
| `UpdateNotificationData` | `UpdateNotificationDto` | Данные для обновления |
| `NotificationListResponse` | `NotificationListResponseDto` | Список с пагинацией |

## Ограничения текущей реализации

1. **Тип уведомления**: В текущей схеме БД нет поля `type`, всегда возвращается 'info'
2. **Срок действия**: Поле `expiresAt` не хранится в БД, всегда `undefined`
3. **Персонализация**: Поле `targetUserId` не реализовано, всегда `undefined`
4. **Автор**: Поле `createdBy` не хранится в БД, всегда 'system'
5. **Обновление**: Поле `updatedAt` равно `createdAt` в текущей реализации

## Планы развития

1. **Расширение схемы БД**: Добавить недостающие поля
2. **Персонализация**: Реализовать уведомления для конкретных пользователей
3. **Шаблоны**: Добавить систему шаблонов уведомлений
4. **Планировщик**: Отложенная отправка уведомлений
5. **Каналы**: Различные способы доставки (email, push, SMS)

## Best Practices

1. **Именование**: Используйте описательные названия типов
2. **Опциональность**: Делайте поля опциональными только при необходимости
3. **Валидация**: Всегда валидируйте данные на фронтенде и бэкенде
4. **Обработка ошибок**: Предусматривайте обработку всех возможных ошибок
5. **Типизация**: Избегайте `any`, используйте строгую типизацию
6. **Документация**: Комментируйте сложные типы и их назначение