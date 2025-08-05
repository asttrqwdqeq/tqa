# Data Table - Обзор компонента

## 🎯 Что это?

Универсальная таблица на основе **TanStack Table** и **shadcn/ui**, которая принимает конфигурацию и автоматически отрисовывает данные с бэкенда.

## 📁 Структура файлов

```
data-table/
├── data-table.tsx              # Базовый компонент TanStack Table
├── universal-table.tsx         # Универсальная таблица с конфигурацией
├── column-generator.tsx        # Генератор колонок по типам
├── types.ts                    # TypeScript типы
├── index.ts                    # Экспорты
├── examples/                   # Примеры использования
│   └── notifications-table.example.tsx
├── README.md                   # Полная документация
└── OVERVIEW.md                 # Этот файл
```

## 🚀 Быстрый старт

### 1. Простейший пример
```typescript
import { UniversalTable, columnHelpers } from '@/shared/components/data-table'

const config = {
  columns: [
    columnHelpers.text("name", "Имя"),
    columnHelpers.badge("status", "Статус"),
    columnHelpers.date("createdAt", "Создано")
  ]
}

<UniversalTable config={config} data={data} isLoading={loading} />
```

### 2. С действиями и поиском
```typescript
const config = {
  columns: [...],
  searchKey: "name",
  actions: [
    { label: "Редактировать", onClick: (row) => edit(row.id) },
    { label: "Удалить", onClick: (row) => delete(row.id) }
  ]
}
```

### 3. С серверной пагинацией
```typescript
const { page, pageSize, paginationConfig } = useServerPagination()
const { data } = useMyData({ page, limit: pageSize })

const config = {
  columns: [...],
  serverPagination: paginationConfig(data?.total || 0)
}

<AdvancedUniversalTable config={config} data={data?.items || []} />
```

## 🔧 Основные компоненты

### DataTable
Базовый компонент с полным контролем над конфигурацией TanStack Table.

### UniversalTable  
Упрощенная таблица, принимающая конфигурацию и автоматически настраивающая колонки.

### AdvancedUniversalTable
Расширенная таблица с серверной пагинацией, фильтрами и дополнительными возможностями.

## 📊 Типы колонок

| Тип | Описание | Пример |
|-----|----------|--------|
| `text` | Простой текст | Имя, описание |
| `number` | Числа с форматированием | Цена, количество |
| `date` | Даты с локализацией | Создано, обновлено |
| `boolean` | Да/Нет с badge | Активен, опубликован |
| `badge` | Цветные метки | Статус, категория |
| `custom` | Кастомный рендеринг | Сложные компоненты |

## 🎨 Предустановленные колонки

```typescript
import { commonColumns } from '@/shared/components/data-table'

commonColumns.id()          // ID колонка
commonColumns.title()       // Заголовок  
commonColumns.status()      // Статус с badge
commonColumns.isActive()    // Активность
commonColumns.createdAt()   // Дата создания
commonColumns.updatedAt()   // Дата обновления
```

## 🛠️ Утилиты

```typescript
import { columnHelpers } from '@/shared/components/data-table'

columnHelpers.text(key, label, options)
columnHelpers.number(key, label, options)  
columnHelpers.date(key, label, options)
columnHelpers.boolean(key, label, options)
columnHelpers.badge(key, label, colorMap, options)
columnHelpers.custom(key, label, renderFn, options)
```

## ✨ Возможности

### ✅ Реализовано
- 📋 Конфигурируемые колонки разных типов
- 🔍 Поиск и фильтрация  
- 📄 Клиентская и серверная пагинация
- 🔀 Сортировка по колонкам
- ✅ Выбор строк (single/multiple)
- 👁️ Управление видимостью колонок
- ⚡ Контекстные действия
- 🎨 Кастомная стилизация
- 🔄 Состояния загрузки

### 🚧 В разработке
- 📁 Экспорт данных (CSV, Excel)
- 🔧 Расширенные фильтры
- 📱 Адаптивная версия
- 💾 Сохранение состояния
- 🎭 Темизация

## 🎯 Примеры использования

### Таблица уведомлений
```typescript
const config = {
  columns: [
    commonColumns.id(),
    columnHelpers.text("title", "Заголовок"),
    columnHelpers.badge("type", "Тип", {
      info: "default", warning: "outline", 
      error: "destructive", success: "secondary"
    }),
    commonColumns.isActive(),
    commonColumns.createdAt()
  ],
  searchKey: "title",
  actions: [
    { label: "Редактировать", onClick: (row) => edit(row) },
    { label: "Удалить", onClick: (row) => delete(row.id) }
  ]
}
```

### Таблица пользователей
```typescript
const config = {
  columns: [
    columnHelpers.text("name", "Имя"),
    columnHelpers.text("email", "Email"),
    columnHelpers.badge("role", "Роль"),
    columnHelpers.boolean("isActive", "Активен"),
    columnHelpers.date("lastLogin", "Последний вход")
  ]
}
```

### Таблица заказов
```typescript
const config = {
  columns: [
    columnHelpers.text("orderNumber", "№ заказа"),
    columnHelpers.number("total", "Сумма", {
      format: (value) => `${value} ₽`,
      align: "right"
    }),
    columnHelpers.badge("status", "Статус", statusColors),
    columnHelpers.date("createdAt", "Создан")
  ]
}
```

## 🔗 Интеграция с данными

### React Query
```typescript
function MyTable() {
  const { data, isLoading } = useMyData()
  
  return (
    <UniversalTable
      config={config}
      data={data?.items || []}
      isLoading={isLoading}
    />
  )
}
```

### Серверная пагинация
```typescript
function MyTable() {
  const { page, pageSize, paginationConfig } = useServerPagination()
  const { data, isLoading } = useMyData({ page, limit: pageSize })
  
  const config = {
    columns: [...],
    serverPagination: paginationConfig(data?.total || 0)
  }
  
  return <AdvancedUniversalTable config={config} data={data?.items || []} />
}
```

## 📚 Дополнительные ресурсы

- **README.md** - Полная документация с примерами
- **examples/** - Готовые примеры для разных сущностей  
- **types.ts** - Все TypeScript интерфейсы
- **TanStack Table Docs** - https://tanstack.com/table

## 🎨 Архитектура

```
┌─────────────────┐
│   TableConfig   │ Конфигурация колонок и настроек
├─────────────────┤
│ ColumnGenerator │ Преобразует конфиг в TanStack колонки  
├─────────────────┤
│ UniversalTable  │ Обертка над DataTable с конфигурацией
├─────────────────┤
│   DataTable     │ Базовый TanStack Table компонент
├─────────────────┤
│   shadcn/ui     │ UI компоненты (Table, Button, etc.)
└─────────────────┘
```

## 🚀 Следующие шаги

1. **Изучите примеры** в `examples/notifications-table.example.tsx`
2. **Прочитайте полную документацию** в `README.md`
3. **Создайте свою таблицу** используя `columnHelpers`
4. **Настройте серверную пагинацию** с помощью `useServerPagination`
5. **Добавьте действия** для интерактивности

---

**Готово к использованию!** 🎉

Универсальная таблица полностью настроена и готова для создания любых таблиц в админ-панели.