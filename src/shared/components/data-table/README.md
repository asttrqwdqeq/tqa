# Universal Data Table

Универсальная таблица на основе TanStack Table и shadcn/ui, которая принимает конфигурацию и отрисовывает данные с бэкенда.

## Возможности

### ✅ Реализованные функции
- 📊 **Конфигурируемые колонки** - различные типы данных
- 🔍 **Поиск и фильтрация** - по любому полю
- 📄 **Пагинация** - клиентская и серверная  
- 🎯 **Сортировка** - по любой колонке
- ✅ **Выбор строк** - single/multiple selection
- 👁️ **Управление колонками** - показать/скрыть
- ⚡ **Действия** - контекстное меню для каждой строки
- 🎨 **Стилизация** - кастомные CSS классы
- 🔄 **Состояния загрузки** - индикаторы и сообщения

### 🚀 Планируемые функции
- 📁 **Экспорт данных** - CSV, Excel, PDF
- 🔧 **Расширенные фильтры** - date ranges, multi-select
- 📱 **Адаптивность** - мобильная версия
- 🎭 **Темы** - светлая/темная тема
- 💾 **Сохранение состояния** - localStorage
- 🔍 **Глобальный поиск** - по всем колонкам

## Быстрый старт

### 1. Простейшее использование

```typescript
import { UniversalTable, columnHelpers } from '@/shared/components/data-table'

function UsersTable() {
  const { data, isLoading } = useUsers()

  const config = {
    columns: [
      columnHelpers.text("name", "Имя"),
      columnHelpers.text("email", "Email"),
      columnHelpers.date("createdAt", "Создан")
    ]
  }

  return (
    <UniversalTable
      config={config}
      data={data || []}
      isLoading={isLoading}
    />
  )
}
```

### 2. С действиями и поиском

```typescript
const config = {
  columns: [
    columnHelpers.text("name", "Имя"),
    columnHelpers.badge("status", "Статус", {
      active: "default",
      inactive: "secondary"
    }),
    columnHelpers.date("createdAt", "Создан")
  ],
  searchKey: "name",
  searchPlaceholder: "Поиск по имени...",
  actions: [
    {
      label: "Редактировать",
      icon: <Edit className="h-4 w-4" />,
      onClick: (row) => editUser(row.id),
      variant: "outline"
    },
    {
      label: "Удалить",
      icon: <Trash className="h-4 w-4" />,
      onClick: (row) => deleteUser(row.id),
      variant: "destructive"
    }
  ]
}
```

### 3. С серверной пагинацией

```typescript
function AdvancedUsersTable() {
  const { page, pageSize, paginationConfig } = useServerPagination()
  const { data, isLoading } = useUsers({ page, limit: pageSize })

  const config = {
    columns: [...],
    serverPagination: paginationConfig(data?.total || 0),
    selectable: true,
    exportable: true
  }

  return (
    <AdvancedUniversalTable
      config={config}
      data={data?.users || []}
      isLoading={isLoading}
    />
  )
}
```

## Типы колонок

### Текстовые колонки
```typescript
// Простая текстовая колонка
columnHelpers.text("name", "Имя")

// С форматированием
columnHelpers.text("phone", "Телефон", {
  format: (value) => formatPhone(value),
  width: 150
})

// Кастомная колонка
columnHelpers.custom("fullName", "ФИО", (_, row) => (
  <span>{row.firstName} {row.lastName}</span>
))
```

### Числовые колонки
```typescript
// Простая числовая колонка
columnHelpers.number("price", "Цена")

// С форматированием валюты
columnHelpers.number("amount", "Сумма", {
  format: (value) => `${value.toLocaleString('ru-RU')} ₽`,
  align: "right"
})
```

### Колонки дат
```typescript
// Стандартная дата
columnHelpers.date("createdAt", "Создано")

// Кастомный формат
columnHelpers.date("birthDate", "Дата рождения", {
  dateConfig: { 
    format: "dd.MM.yyyy",
    customFormat: "d MMMM yyyy"
  }
})
```

### Badge колонки
```typescript
// С цветовой схемой
columnHelpers.badge("status", "Статус", {
  active: "default",
  pending: "outline", 
  inactive: "secondary",
  error: "destructive"
})
```

### Boolean колонки
```typescript
columnHelpers.boolean("isActive", "Активен", {
  booleanConfig: {
    trueLabel: "Да",
    falseLabel: "Нет",
    trueVariant: "default",
    falseVariant: "secondary"
  }
})
```

## Предустановленные колонки

```typescript
import { commonColumns } from '@/shared/components/data-table'

const config = {
  columns: [
    commonColumns.id(),              // ID колонка
    commonColumns.title(),           // Заголовок
    commonColumns.status(),          // Статус с badge
    commonColumns.isActive(),        // Активность
    commonColumns.createdAt(),       // Дата создания
    commonColumns.updatedAt(),       // Дата обновления
  ]
}
```

## Конфигурация действий

```typescript
const actions = [
  {
    label: "Просмотр",
    icon: <Eye className="h-4 w-4" />,
    onClick: (row) => viewItem(row),
    variant: "ghost"
  },
  {
    label: "Редактировать",
    icon: <Edit className="h-4 w-4" />,
    onClick: (row) => editItem(row),
    variant: "outline",
    show: (row) => row.canEdit // Условный показ
  },
  {
    label: "Удалить",
    icon: <Trash className="h-4 w-4" />,
    onClick: (row) => {
      if (confirm("Удалить?")) {
        deleteItem(row.id)
      }
    },
    variant: "destructive"
  }
]
```

## Серверная пагинация

### Хук useServerPagination
```typescript
function MyTable() {
  // Инициализация пагинации
  const { 
    page, 
    pageSize, 
    setPage, 
    setPageSize, 
    paginationConfig 
  } = useServerPagination(1, 10)

  // Запрос данных с пагинацией
  const { data, isLoading } = useMyData({ page, limit: pageSize })

  const config = {
    columns: [...],
    serverPagination: paginationConfig(data?.total || 0)
  }

  return <AdvancedUniversalTable config={config} data={data?.items || []} />
}
```

### Ручное управление пагинацией
```typescript
const [page, setPage] = useState(1)
const [pageSize, setPageSize] = useState(10)

const paginationConfig = {
  page,
  pageSize, 
  total: data?.total || 0,
  onPageChange: setPage,
  onPageSizeChange: setPageSize
}
```

## Стилизация

### CSS классы для колонок
```typescript
const config = {
  columns: [
    columnHelpers.text("name", "Имя", {
      cellClassName: "font-medium text-blue-600",
      headerClassName: "bg-blue-50",
      align: "center",
      width: 200
    })
  ]
}
```

### Кастомные стили
```typescript
// В CSS или Tailwind
.custom-table-cell {
  @apply bg-gradient-to-r from-blue-50 to-purple-50 font-semibold;
}

// В конфигурации
cellClassName: "custom-table-cell"
```

## Обработка событий

```typescript
const config = {
  // Клик по строке
  onRowClick: (row) => {
    router.push(`/items/${row.id}`)
  },
  
  // Выбор строк
  onSelectionChange: (selectedRows) => {
    setSelected(selectedRows)
    console.log(`Выбрано: ${selectedRows.length}`)
  }
}
```

## Состояния и сообщения

```typescript
const config = {
  emptyStateMessage: "Нет данных для отображения",
  loadingMessage: "Загружаем данные...",
}

// В компоненте
<UniversalTable
  config={config}
  data={data}
  isLoading={isLoading}
/>
```

## Примеры для разных сущностей

### Таблица пользователей
```typescript
const usersConfig = {
  columns: [
    commonColumns.id(),
    columnHelpers.text("name", "Имя"),
    columnHelpers.text("email", "Email"),
    columnHelpers.badge("role", "Роль", {
      admin: "default",
      user: "secondary",
      moderator: "outline"
    }),
    commonColumns.isActive(),
    commonColumns.createdAt()
  ],
  searchKey: "name",
  actions: [
    { label: "Профиль", onClick: (row) => openProfile(row.id) },
    { label: "Заблокировать", onClick: (row) => blockUser(row.id) }
  ]
}
```

### Таблица заказов
```typescript
const ordersConfig = {
  columns: [
    columnHelpers.text("orderNumber", "№ заказа"),
    columnHelpers.text("customerName", "Клиент"),
    columnHelpers.number("total", "Сумма", {
      format: (value) => `${value} ₽`,
      align: "right"
    }),
    columnHelpers.badge("status", "Статус", {
      pending: "outline",
      paid: "default", 
      shipped: "secondary",
      delivered: "default",
      cancelled: "destructive"
    }),
    columnHelpers.date("createdAt", "Создан")
  ],
  actions: [
    { label: "Детали", onClick: (row) => viewOrder(row.id) },
    { 
      label: "Отменить", 
      onClick: (row) => cancelOrder(row.id),
      show: (row) => row.status === 'pending'
    }
  ]
}
```

### Таблица товаров
```typescript
const productsConfig = {
  columns: [
    columnHelpers.custom("image", "Фото", (value) => (
      <img src={value} className="w-10 h-10 rounded object-cover" />
    ), { width: 80 }),
    columnHelpers.text("name", "Название"),
    columnHelpers.text("category", "Категория"),
    columnHelpers.number("price", "Цена", {
      format: (value) => `${value.toLocaleString()} ₽`
    }),
    columnHelpers.number("stock", "Остаток"),
    commonColumns.isActive()
  ]
}
```

## API Reference

### UniversalTable Props
```typescript
interface UniversalTableProps<T> {
  config: TableConfig<T>
  data: T[]
  isLoading?: boolean
  onRowClick?: (row: T) => void
}
```

### AdvancedUniversalTable Props  
```typescript
interface AdvancedUniversalTableProps<T> {
  config: AdvancedTableConfig<T>
  data: T[]
  isLoading?: boolean
}
```

### TableConfig
```typescript
interface TableConfig<T> {
  columns: ColumnConfig[]
  searchKey?: string
  searchPlaceholder?: string
  defaultSort?: { key: string; direction: "asc" | "desc" }
  pageSize?: number
  enableRowSelection?: boolean
  enableColumnVisibility?: boolean
  actions?: ActionConfig<T>[]
}
```

### ColumnConfig
```typescript
interface ColumnConfig {
  key: string
  label: string
  type: "text" | "number" | "date" | "boolean" | "badge" | "custom"
  accessor?: string
  width?: number | string
  align?: "left" | "center" | "right"
  sortable?: boolean
  hideable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  format?: (value: any) => string
  cellClassName?: string
  headerClassName?: string
  // Конфигурации для специфичных типов
  badgeConfig?: BadgeConfig
  booleanConfig?: BooleanConfig
  dateConfig?: DateConfig
}
```

## Troubleshooting

### Частые проблемы

1. **Данные не отображаются**
   - Проверьте `accessor` в конфигурации колонок
   - Убедитесь что `data` не `null` или `undefined`

2. **Поиск не работает**
   - Убедитесь что `searchKey` соответствует полю в данных
   - Проверьте что поле содержит строковые значения

3. **Сортировка не работает**
   - Установите `sortable: true` в конфигурации колонки
   - Для кастомных колонок реализуйте свою логику сортировки

4. **Пагинация не обновляется**
   - Для серверной пагинации передавайте корректный `total`
   - Проверьте обработчики `onPageChange`

### Performance Tips

1. **Мемоизация конфигурации**
   ```typescript
   const config = useMemo(() => ({
     columns: [...]
   }), [dependencies])
   ```

2. **Виртуализация для больших списков**
   ```typescript
   // Для таблиц с 1000+ строк используйте пагинацию
   const config = { pageSize: 50 }
   ```

3. **Ленивая загрузка действий**
   ```typescript
   const actions = useMemo(() => [
     { label: "Edit", onClick: editHandler }
   ], [editHandler])
   ```

## Расширение функциональности

### Кастомные типы колонок
```typescript
// Добавьте новый тип в types.ts
export type ColumnType = "text" | "number" | "rating" // новый тип

// Реализуйте рендеринг в column-generator.tsx
case "rating":
  renderedValue = <StarRating value={value} readonly />
  break
```

### Кастомные компоненты
```typescript
// Создайте свой wrapper
function MyCustomTable<T>(props: MyTableProps<T>) {
  const config = useMyTableConfig(props)
  return <UniversalTable config={config} {...props} />
}
```