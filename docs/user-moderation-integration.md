# User Moderation Integration

## Overview
Интеграция админки с новыми эндпоинтами для модерации пользователей.

## Новые компоненты

### 1. UserModerationDialog
**Файл**: `admin/src/shared/components/user-moderation-dialog.tsx`

Модальное окно для изменения username и tgId пользователей.

**Функции**:
- Изменение username пользователя
- Изменение Telegram ID пользователя
- Ввод причины изменения
- Валидация данных
- Обработка ошибок

**Использование**:
```tsx
<UserModerationDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  userId="user123"
  currentUsername="old_username"
  currentTgId="123456789"
  type="username" // или "tgId"
  onSuccess={() => console.log('Success!')}
/>
```

### 2. UserSelector
**Файл**: `admin/src/shared/components/user-selector.tsx`

Компонент для выбора пользователя из упрощенного списка.

**Функции**:
- Поиск пользователей по ID, username или tgId
- Отображение упрощенной информации о пользователе
- Кэширование результатов
- Автокомплит

**Использование**:
```tsx
<UserSelector
  value={selectedUserId}
  onValueChange={(userId, user) => setSelectedUser(user)}
  placeholder="Select user..."
/>
```

## Новые страницы

### User Moderation Page (Супер-админка)
**Файл**: `admin/src/app/(private)/superadmin/dashboard/user-moderation/page.tsx`

Главная страница для модерации пользователей в супер-админке.

**Функции**:
- Выбор пользователя через UserSelector
- Отображение информации о выбранном пользователе
- Кнопки для изменения username и tgId
- Обработка URL параметров для прямого перехода
- Руководящие принципы модерации

**URL параметры**:
- `?userId=123&action=username` - открыть диалог изменения username
- `?userId=123&action=tgid` - открыть диалог изменения tgId

### User Moderation Page (Обычная админка)
**Файл**: `admin/src/app/(private)/admin/dashboard/user-moderation/page.tsx`

Главная страница для модерации пользователей в обычной админке.

**Функции**:
- Выбор пользователя через UserSelector
- Отображение информации о выбранном пользователе
- Кнопки для изменения username и tgId
- Обработка URL параметров для прямого перехода
- Руководящие принципы модерации

**URL параметры**:
- `?userId=123&action=username` - открыть диалог изменения username
- `?userId=123&action=tgid` - открыть диалог изменения tgId

## Обновленные API функции

### usersApi.getSimpleUsers()
Получение упрощенного списка пользователей.

```typescript
const users = await usersApi.getSimpleUsers({
  search: "user",
  limit: 50,
  page: 1
})
```

### usersApi.updateUserUsername()
Изменение username пользователя.

```typescript
await usersApi.updateUserUsername("user123", {
  username: "new_username",
  reason: "User requested change"
})
```

### usersApi.updateUserTgId()
Изменение Telegram ID пользователя.

```typescript
await usersApi.updateUserTgId("user123", {
  tgId: "987654321",
  reason: "User changed Telegram account"
})
```

## Интеграция с существующими страницами

### Супер-админка
#### Обновленная страница пользователей
В `admin/src/app/(private)/superadmin/dashboard/[model]/page.tsx` добавлены новые действия:

- **Edit Username** - переход на страницу модерации с параметром `action=username`
- **Edit Telegram ID** - переход на страницу модерации с параметром `action=tgid`

#### Обновленная главная страница дашборда
В `admin/src/app/(private)/superadmin/dashboard/page.tsx` добавлена кнопка "Moderate" для пользователей.

### Обычная админка
#### Обновленная страница пользователей
В `admin/src/app/(private)/admin/dashboard/[model]/page.tsx` добавлены новые действия:

- **Edit Username** - переход на страницу модерации с параметром `action=username`
- **Edit Telegram ID** - переход на страницу модерации с параметром `action=tgid`

#### Обновленная главная страница дашборда
В `admin/src/app/(private)/admin/dashboard/page.tsx` добавлена кнопка "Moderate" для пользователей.

## Новые типы

### SimpleUser
```typescript
interface SimpleUser {
  id: string;
  username?: string;
  tgId: string;
}
```

### UpdateUserUsernameData
```typescript
interface UpdateUserUsernameData {
  username: string;
  reason?: string;
}
```

### UpdateUserTgIdData
```typescript
interface UpdateUserTgIdData {
  tgId: string;
  reason?: string;
}
```

## Безопасность

- Все операции требуют авторизации админа
- Все изменения логируются с ID админа и причиной
- Проверка уникальности Telegram ID
- Валидация входных данных

## Навигация

### Супер-админка (`/superadmin/dashboard/`)
1. **Главная страница дашборда** → Кнопка "Moderate" в секции Users
2. **Страница пользователей** → Действия "Edit Username" или "Edit Telegram ID"
3. **Прямые ссылки** → `/superadmin/dashboard/user-moderation?userId=123&action=username`

### Обычная админка (`/admin/dashboard/`)
1. **Главная страница дашборда** → Кнопка "Moderate" в секции Users
2. **Страница пользователей** → Действия "Edit Username" или "Edit Telegram ID"
3. **Прямые ссылки** → `/admin/dashboard/user-moderation?userId=123&action=username`

## Обработка ошибок

- Валидация на фронтенде
- Отображение ошибок через toast уведомления
- Обработка сетевых ошибок
- Логирование ошибок в консоль

## Кэширование

- TanStack Query для кэширования списка пользователей
- staleTime: 5 минут
- Автоматическая инвалидация при изменениях
