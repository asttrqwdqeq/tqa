# Auth Feature

Модуль авторизации построен по принципам FSD архитектуры.

## Структура

```
features/auth/
├── login/
│   ├── index.ts          # Экспорты модуля
│   ├── login-page.tsx    # Соединитель виджета и логики  
│   └── use-login.ts      # Хук с бизнес-логикой
```

## Функциональность

- ✅ Отправка данных на `/auth/admin/login`
- ✅ Автоматический редирект на `/(private)` после успешного входа
- ✅ Обработка ошибок и состояний загрузки
- ✅ Поддержка httpOnly cookies

## Использование

### LoginPage
Готовый компонент страницы с формой логина:

```tsx
import { LoginPage } from "@/features/auth/login";

export default function Login() {
  return <LoginPage />;
}
```

### useLogin Hook
Хук для использования в собственных компонентах:

```tsx
import { useLogin } from "@/features/auth/login";

function CustomLogin() {
  const loginMutation = useLogin();
  
  const handleLogin = (credentials) => {
    loginMutation.mutate(credentials);
    // После успешного логина автоматически произойдет редирект на /(private)
  };

  return (
    // Ваша собственная форма
  );
}
```

## Поведение после логина

При успешной авторизации пользователь автоматически перенаправляется на приватную страницу `/(private)` с помощью `window.location.href`.

## Widget

Форма логина находится в `widgets/login-form` и может использоваться независимо с передачей логики через пропсы.