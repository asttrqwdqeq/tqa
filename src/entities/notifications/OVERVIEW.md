# Notifications Entity - Обзор

## Что создано

### 📁 Структура файлов
```
admin/src/entities/notifications/
├── hooks/
│   └── use-notifications.ts     # React Query хуки
├── examples/
│   └── notification-usage.example.tsx  # Примеры использования
├── types.ts                     # Реэкспорт типов
├── index.ts                     # Публичный API
├── README.md                    # Документация entity
└── OVERVIEW.md                  # Этот файл

admin/src/shared/api/
└── notifications.ts             # API методы

admin/src/shared/api/types.ts    # Обновлен с типами notifications

admin/docs/
└── notifications-types.md      # Полная документация типов
```

### 🔧 Основные типы

1. **NotificationType** - enum для типов уведомлений
2. **Notification** - основной интерфейс уведомления
3. **CreateNotificationData** - DTO для создания
4. **UpdateNotificationData** - DTO для обновления
5. **NotificationListResponse** - ответ API для списка
6. **NotificationSearchParams** - параметры фильтрации
7. **NotificationStats** - статистика уведомлений

### 🎣 React Query хуки

1. **useNotifications** - список уведомлений с фильтрами
2. **useNotification** - одно уведомление по ID
3. **useCreateNotification** - создание уведомления
4. **useUpdateNotification** - обновление уведомления
5. **useDeleteNotification** - удаление уведомления
6. **useToggleNotificationStatus** - переключение статуса
7. **useNotificationStats** - статистика
8. **usePrefetchNotification** - предзагрузка

### 🌐 API методы

1. **getNotifications** - GET /notifications/admin
2. **getNotification** - GET /notifications/admin/:id
3. **createNotification** - POST /notifications
4. **updateNotification** - PUT /notifications/admin/:id
5. **deleteNotification** - DELETE /notifications/admin/:id
6. **getNotificationStats** - GET /notifications/stats

## Использование

### Импорт
```typescript
import { 
  useNotifications, 
  useCreateNotification,
  type Notification,
  type NotificationType 
} from '@/entities/notifications';
```

### Базовый пример
```typescript
function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const createMutation = useCreateNotification();
  
  const handleCreate = () => {
    createMutation.mutate({
      title: 'Новое уведомление',
      message: 'Текст уведомления',
      isActive: true
    });
  };
  
  // JSX...
}
```

## Особенности

### ✅ Что работает
- Полная типизация всех операций
- React Query интеграция с кэшированием
- Автоматическая инвалидация кэша
- Toast уведомления об успехе/ошибках
- Пагинация и фильтрация
- Предзагрузка данных

### ⚠️ Ограничения бэкенда
- Тип уведомления всегда 'info' (нет в БД)
- Нет поля expiresAt (не реализовано)
- Нет поля targetUserId (не реализовано)
- Нет поля createdBy (не реализовано)
- updatedAt = createdAt (нет в БД)

### 🔮 Что можно добавить
- Компоненты UI (формы, таблицы, карточки)
- Валидацию с помощью zod/yup
- Тесты для хуков и API
- Эндпоинт для статистики на бэкенде
- Расширение схемы БД

## Архитектурные решения

### FSD принципы
- Entity слой для бизнес-логики
- Shared слой для общих типов и API
- Централизованное управление типами
- Разделение concerns между слоями

### React Query паттерны
- Типизированные ключи кэша
- Оптимистичные обновления
- Автоматическая инвалидация
- Предзагрузка для UX

### TypeScript best practices
- Строгая типизация без any
- Реэкспорт типов из одного места
- Utility types для удобства
- Type guards для валидации

## Интеграция

### С бэкендом
Все типы соответствуют DTO из бэкенда:
- `Notification` ↔ `NotificationResponseDto`
- `CreateNotificationData` ↔ `CreateNotificationDto`
- `UpdateNotificationData` ↔ `UpdateNotificationDto`

### С UI компонентами
Типы готовы для использования в любых UI библиотеках:
- shadcn/ui
- Material-UI
- Ant Design
- Chakra UI

### С формами
Совместимо с популярными библиотеками форм:
- React Hook Form
- Formik
- Final Form

## Следующие шаги

1. **Создать UI компоненты** для работы с уведомлениями
2. **Добавить страницы** в роутинг админки
3. **Реализовать эндпоинт статистики** на бэкенде
4. **Расширить схему БД** недостающими полями
5. **Добавить тесты** для всех хуков и API методов
6. **Создать Storybook** для компонентов