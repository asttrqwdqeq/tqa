# TanStack Query + Next.js Setup

Это руководство показывает, как правильно настроить TanStack Query для работы с Next.js.

## 🔧 Настройка

### 1. QueryClient Configuration (`shared/config/query-client.ts`)

- **Безопасность**: Создается новый QueryClient для каждого SSR запроса
- **Производительность**: В браузере переиспользуется один экземпляр
- **Кэширование**: Настроено время жизни данных и стратегии повторных запросов

### 2. Provider Setup (`app/app-provider.tsx`)

- **SSR Safe**: Правильная инициализация без гидратационных ошибок
- **DevTools**: Автоматически включаются в development режиме
- **Интеграция**: Совместимость с другими провайдерами (Theme, Auth)

## 📚 Структура API

```
src/shared/api/
├── base.ts          # Базовая конфигурация axios
├── types.ts         # TypeScript типы
├── users.ts         # API методы для пользователей
└── README.md        # Эта документация
```

## 🎯 Использование Hooks

### Query (Чтение данных)
```tsx
const { data, isLoading, error } = useUsers({
  page: 1,
  limit: 10,
  search: "john"
});
```

### Mutation (Изменение данных)
```tsx
const createUser = useCreateUser();

const handleSubmit = (data) => {
  createUser.mutate(data, {
    onSuccess: () => {
      // Автоматически обновляется кэш
      router.push('/users');
    }
  });
};
```

## 🚀 Лучшие практики

### 1. Ключи запросов (Query Keys)
```tsx
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: any) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

### 2. Оптимистичные обновления
```tsx
const updateUser = useMutation({
  mutationFn: updateUserApi,
  onMutate: async (newData) => {
    // Отменяем текущие запросы
    await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });
    
    // Сохраняем предыдущее значение
    const previousUser = queryClient.getQueryData(userKeys.detail(id));
    
    // Устанавливаем новые данные
    queryClient.setQueryData(userKeys.detail(id), newData);
    
    return { previousUser };
  },
  onError: (err, newData, context) => {
    // Откатываем изменения при ошибке
    if (context?.previousUser) {
      queryClient.setQueryData(userKeys.detail(id), context.previousUser);
    }
  },
  onSettled: () => {
    // Обновляем данные с сервера
    queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
  },
});
```

### 3. Предзагрузка данных
```tsx
const prefetchUser = usePrefetchUser();

// При наведении на ссылку
<Link 
  href={`/users/${user.id}`}
  onMouseEnter={() => prefetchUser(user.id)}
>
  {user.name}
</Link>
```

### 4. Условные запросы
```tsx
const { data } = useUser(userId, {
  enabled: !!userId && isAuthenticated
});
```

## 🔄 Стратегии кэширования

### staleTime vs gcTime
- **staleTime**: Время актуальности данных (не делать запросы)
- **gcTime**: Время хранения в памяти после неиспользования

```tsx
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000,    // 5 минут - данные актуальны
  gcTime: 10 * 60 * 1000,      // 10 минут - хранить в памяти
});
```

## 🎛️ DevTools

В development режиме автоматически включены React Query DevTools:
- Просмотр всех запросов и их состояний
- Инспекция кэша
- Ручное управление запросами

## ⚡ Производительность

### Рефетчинг
```tsx
const { data } = useUsers({}, {
  refetchOnWindowFocus: true,    // При фокусе на окно
  refetchOnMount: true,          // При монтировании
  refetchInterval: 30000,        // Каждые 30 секунд
});
```

### Пагинация
```tsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['users', 'infinite'],
  queryFn: ({ pageParam = 1 }) => fetchUsers({ page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

## 🔒 Безопасность

- Токены автоматически добавляются в заголовки
- При 401 ошибке происходит автоматический редирект на логин
- Sensitive данные не кэшируются на стороне сервера

## 🐛 Обработка ошибок

- Автоматические повторные попытки с экспоненциальной задержкой
- Умная обработка 4xx ошибок (без повторов)
- Toast уведомления для пользователя
- Детальная информация об ошибках в DevTools