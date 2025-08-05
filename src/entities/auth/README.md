# Auth System

Полная система авторизации с использованием TanStack Query и Axios.

## Архитектура

```
entities/auth/
├── provider/
│   └── auth-provider.tsx    # React Context + TanStack Query
├── hooks/
│   └── use-auth-queries.ts  # Хуки для API запросов
├── index.ts                 # Экспорты модуля
└── README.md               # Документация

shared/api/
└── auth.ts                 # API методы и типы
```

## Функциональность

### ✅ Эндпоинты бэкенда
- `POST /auth/admin/login` - Вход в систему
- `POST /auth/admin/logout` - Выход из системы  
- `GET /auth/admin/me` - Получение текущего пользователя
- `POST /auth/admin/refresh` - Обновление токена
- `GET /auth/admin/verify` - Проверка токена

### ✅ Cookie-based авторизация
- **HttpOnly cookies** - токены хранятся безопасно в браузере
- **Автоматическая отправка** - cookies включаются во все запросы (`withCredentials: true`)  
- **Автоматическая проверка** авторизации при загрузке
- **Умные редиректы** - `/login` ↔ `/(private)` на основе статуса авторизации
- **Кеширование состояния** с TanStack Query
- **Безопасный logout** - cookies очищаются на сервере

### ✅ Состояния
- `isAuthenticated` - статус авторизации
- `isLoading` - загрузка
- `isInitialized` - инициализация завершена
- `user` - данные пользователя
- Состояния операций (login, logout)

## Использование

### AuthProvider
Оборачивает все приложение:

```tsx
import { AuthProvider } from "@/entities/auth";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### useAuth Hook
Основной хук для работы с авторизацией:

```tsx
import { useAuth } from "@/entities/auth";

function Component() {
  const { 
    user,           // Данные пользователя
    isAuthenticated, // Статус авторизации
    isLoading,      // Загрузка
    login,          // Метод входа
    logout,         // Метод выхода
    refreshAuth     // Обновление токена
  } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Привет, {user.username}!</p>
      ) : (
        <p>Войдите в систему</p>
      )}
    </div>
  );
}
```

### Отдельные хуки
Для продвинутого использования:

```tsx
import { 
  useCurrentUser,
  useLogin, 
  useLogout,
  useCheckAuth 
} from "@/entities/auth";

function CustomComponent() {
  const userQuery = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const { checkAuth } = useCheckAuth();
  
  // Ваша логика
}
```

## Обработка ошибок

Система автоматически обрабатывает:
- ✅ 401 ошибки (неавторизован)
- ✅ Сетевые ошибки
- ✅ Ошибки валидации
- ✅ Таймауты запросов

## Публичные маршруты

Маршруты не требующие авторизации:
- `/` - главная страница
- `/login` - страница входа

Все остальные маршруты требуют авторизации.

## Конфигурация

API URL задается через переменную окружения:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Cookie-based авторизация

### 🍪 Принцип работы
1. **Логин** → сервер устанавливает httpOnly cookie с токеном
2. **Запросы** → браузер автоматически отправляет cookie с каждым запросом  
3. **Проверка** → сервер валидирует токен из cookie
4. **Logout** → сервер удаляет/инвалидирует cookie

### ⚙️ Настройки бэкенда
Сервер должен:
```javascript
// Установка cookie при логине
res.cookie('access_token', token, {
  httpOnly: true,    // Защита от XSS
  secure: true,      // Только HTTPS в продакшене
  sameSite: 'strict', // Защита от CSRF
  maxAge: 15 * 60 * 1000 // 15 минут
});

// CORS настройки
app.use(cors({
  origin: 'http://localhost:3000', // Домен фронтенда
  credentials: true // Разрешить отправку cookies
}));
```

### 🔧 Настройки фронтенда
```typescript
// Все запросы автоматически включают cookies
const api = axios.create({
  withCredentials: true // ← Ключевая настройка
});
```

## Безопасность

- ✅ **HttpOnly cookies** - защита от XSS атак
- ✅ **SameSite=Strict** - защита от CSRF атак  
- ✅ **Secure в HTTPS** - защита от перехвата
- ✅ **Автоматическое обновление** токенов
- ✅ **Безопасный logout** - удаление cookies на сервере
- ✅ **Валидация на клиенте и сервере**