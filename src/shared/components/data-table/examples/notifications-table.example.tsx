/**
 * Пример использования универсальной таблицы для уведомлений
 * Демонстрирует различные способы конфигурации и использования
 */

import React from 'react'
import { Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { 
  UniversalTable, 
  AdvancedUniversalTable,
  useServerPagination,
  columnHelpers,
  commonColumns,
  type TableConfig,
  type AdvancedTableConfig 
} from '@/shared/components/data-table'
import { 
  useNotifications, 
  useDeleteNotification,
  useToggleNotificationStatus,
  type Notification,
  type NotificationSearchParams 
} from '@/entities/notifications'

// =============================================================================
// Пример 1: Простая таблица с базовой конфигурацией
// =============================================================================

export function SimpleNotificationsTable() {
  const { data, isLoading } = useNotifications()
  const deleteMutation = useDeleteNotification()
  const toggleMutation = useToggleNotificationStatus()

  // Простая конфигурация таблицы
  const config: TableConfig<Notification> = {
    columns: [
      commonColumns.id(),
      columnHelpers.text("title", "Заголовок", { width: 300 }),
      columnHelpers.text("message", "Сообщение", { width: 400 }),
      columnHelpers.badge("type", "Тип", {
        info: "default",
        warning: "outline", 
        error: "destructive",
        success: "secondary"
      }),
      commonColumns.isActive(),
      commonColumns.createdAt(),
    ],
    searchKey: "title",
    searchPlaceholder: "Поиск по заголовку...",
    enableRowSelection: true,
    enableColumnVisibility: true,
    actions: [
      {
        label: "Просмотр",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row) => console.log("Просмотр:", row),
        variant: "ghost"
      },
      {
        label: "Редактировать", 
        icon: <Edit className="h-4 w-4" />,
        onClick: (row) => console.log("Редактирование:", row),
        variant: "outline"
      },
      {
        label: "Переключить статус",
        icon: <ToggleLeft className="h-4 w-4" />,
        onClick: (row) => toggleMutation.mutate({
          id: row.id,
          isActive: !row.isActive
        }),
        variant: "secondary"
      },
      {
        label: "Удалить",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row) => {
          if (confirm("Вы уверены?")) {
            deleteMutation.mutate(row.id)
          }
        },
        variant: "destructive"
      }
    ]
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Простая таблица уведомлений</h2>
      <UniversalTable
        config={config}
        data={data?.notifications || []}
        isLoading={isLoading}
        onRowClick={(row) => console.log("Клик по строке:", row)}
      />
    </div>
  )
}

// =============================================================================
// Пример 2: Расширенная таблица с серверной пагинацией
// =============================================================================

export function AdvancedNotificationsTable() {
  const { page, pageSize, paginationConfig } = useServerPagination(1, 10)
  const [filters, setFilters] = React.useState<NotificationSearchParams>({
    page,
    limit: pageSize
  })

  const { data, isLoading } = useNotifications(filters)
  const deleteMutation = useDeleteNotification()
  const toggleMutation = useToggleNotificationStatus()

  // Обновляем фильтры при изменении пагинации
  React.useEffect(() => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }))
  }, [page, pageSize])

  // Расширенная конфигурация
  const config: AdvancedTableConfig<Notification> = {
    columns: [
      // Кастомная колонка с чекбоксом для выбора
      columnHelpers.custom("select", "", () => null, { 
        width: 50,
        hideable: false,
        sortable: false
      }),
      
      commonColumns.id({ width: 100 }),
      
      // Заголовок с кастомным рендерингом
      columnHelpers.custom("title", "Заголовок", (value, row) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground truncate max-w-xs">
            {row.message}
          </div>
        </div>
      ), { width: 300 }),
      
      // Тип с цветовой кодировкой
      columnHelpers.badge("type", "Тип", {
        info: "default",
        warning: "outline", 
        error: "destructive",
        success: "secondary"
      }, { width: 100 }),
      
      // Статус с кастомными иконками
      columnHelpers.custom("isActive", "Статус", (value) => (
        <div className="flex items-center gap-2">
          {value ? (
            <ToggleRight className="h-4 w-4 text-green-600" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-gray-400" />
          )}
          <span className={value ? "text-green-700" : "text-gray-500"}>
            {value ? "Активно" : "Неактивно"}
          </span>
        </div>
      ), { width: 120, align: "center" }),
      
      // Дата создания с относительным временем
      columnHelpers.date("createdAt", "Создано", {
        width: 180,
        dateConfig: { 
          format: "custom",
          customFormat: "dd.MM.yyyy HH:mm" 
        }
      }),
      
      // Дополнительная информация
      columnHelpers.custom("info", "Дополнительно", (_, row) => (
        <div className="text-xs space-y-1">
          <div>ID: {row.id.slice(-8)}</div>
          <div>Автор: {row.createdBy}</div>
        </div>
      ), { width: 150 }),
    ],
    
    searchKey: "title",
    searchPlaceholder: "Поиск уведомлений...",
    
    // Серверная пагинация
    serverPagination: paginationConfig(data?.total || 0),
    
    // Возможности таблицы
    enableRowSelection: true,
    enableColumnVisibility: true,
    selectable: true,
    exportable: true,
    
    // Фильтры (пока не реализованы)
    filters: [
      {
        key: "type",
        type: "select",
        label: "Тип",
        options: [
          { label: "Информация", value: "info" },
          { label: "Предупреждение", value: "warning" },
          { label: "Ошибка", value: "error" },
          { label: "Успех", value: "success" },
        ]
      },
      {
        key: "isActive",
        type: "boolean",
        label: "Статус"
      }
    ],
    
    // Действия с условным показом
    actions: [
      {
        label: "Просмотр",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row) => console.log("Просмотр:", row),
        variant: "ghost",
        show: () => true // Всегда показываем
      },
      {
        label: "Активировать",
        icon: <ToggleRight className="h-4 w-4" />,
        onClick: (row) => toggleMutation.mutate({
          id: row.id,
          isActive: true
        }),
        variant: "secondary",
        show: (row) => !row.isActive // Показываем только для неактивных
      },
      {
        label: "Деактивировать",
        icon: <ToggleLeft className="h-4 w-4" />,
        onClick: (row) => toggleMutation.mutate({
          id: row.id,
          isActive: false
        }),
        variant: "outline",
        show: (row) => row.isActive // Показываем только для активных
      },
      {
        label: "Редактировать",
        icon: <Edit className="h-4 w-4" />,
        onClick: (row) => console.log("Редактирование:", row),
        variant: "outline"
      },
      {
        label: "Удалить",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row) => {
          if (confirm(`Удалить уведомление "${row.title}"?`)) {
            deleteMutation.mutate(row.id)
          }
        },
        variant: "destructive"
      }
    ],
    
    // Обработчики событий
    onRowClick: (row) => {
      console.log("Клик по строке:", row.title)
    },
    
    onSelectionChange: (selectedRows) => {
      console.log("Выбранные строки:", selectedRows.length)
    },
    
    // Кастомные сообщения
    emptyStateMessage: "Нет уведомлений для отображения",
    loadingMessage: "Загружаем уведомления..."
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Расширенная таблица уведомлений</h2>
        <div className="text-sm text-muted-foreground">
          Всего: {data?.total || 0} записей
        </div>
      </div>
      
      <AdvancedUniversalTable
        config={config}
        data={data?.notifications || []}
        isLoading={isLoading}
      />
    </div>
  )
}

// =============================================================================
// Пример 3: Минимальная конфигурация для быстрого старта
// =============================================================================

export function MinimalNotificationsTable() {
  const { data, isLoading } = useNotifications({ limit: 5 })

  const config: TableConfig<Notification> = {
    columns: [
      columnHelpers.text("title", "Заголовок"),
      columnHelpers.badge("type", "Тип"),
      commonColumns.isActive(),
      commonColumns.createdAt()
    ]
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Минимальная таблица</h2>
      <UniversalTable
        config={config}
        data={data?.notifications || []}
        isLoading={isLoading}
      />
    </div>
  )
}

// =============================================================================
// Пример 4: Таблица только для чтения с кастомными колонками
// =============================================================================

export function ReadOnlyNotificationsTable() {
  const { data, isLoading } = useNotifications()

  const config: TableConfig<Notification> = {
    columns: [
      // Объединенная колонка заголовка и сообщения
      columnHelpers.custom("content", "Содержание", (_, row) => (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{row.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {row.message}
          </p>
        </div>
      ), { width: 400 }),
      
      // Метаданные
      columnHelpers.custom("meta", "Информация", (_, row) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              row.type === 'error' ? 'bg-red-500' :
              row.type === 'warning' ? 'bg-yellow-500' :
              row.type === 'success' ? 'bg-green-500' :
              'bg-blue-500'
            }`} />
            <span className="capitalize">{row.type}</span>
          </div>
          <div className={`${row.isActive ? 'text-green-600' : 'text-gray-500'}`}>
            {row.isActive ? '● Активно' : '○ Неактивно'}
          </div>
          <div className="text-muted-foreground">
            {new Date(row.createdAt).toLocaleDateString('ru-RU')}
          </div>
        </div>
      ), { width: 150 }),
      
      // Автор и даты
      columnHelpers.custom("timeline", "Временная линия", (_, row) => (
        <div className="text-xs space-y-1">
          <div>
            <span className="text-muted-foreground">Автор:</span>
            <span className="ml-1 font-medium">{row.createdBy}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Создано:</span>
            <span className="ml-1">{new Date(row.createdAt).toLocaleString('ru-RU')}</span>
          </div>
          {row.updatedAt !== row.createdAt && (
            <div>
              <span className="text-muted-foreground">Изменено:</span>
              <span className="ml-1">{new Date(row.updatedAt).toLocaleString('ru-RU')}</span>
            </div>
          )}
        </div>
      ), { width: 200 })
    ],
    
    searchKey: "title",
    enableRowSelection: false,
    enableColumnVisibility: false
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Таблица только для чтения</h2>
      <UniversalTable
        config={config}
        data={data?.notifications || []}
        isLoading={isLoading}
      />
    </div>
  )
}

// =============================================================================
// Пример 5: Компактная таблица для дашборда
// =============================================================================

export function DashboardNotificationsTable() {
  const { data, isLoading } = useNotifications({ limit: 3, isActive: true })

  const config: TableConfig<Notification> = {
    columns: [
      columnHelpers.custom("summary", "Последние уведомления", (_, row) => (
        <div className="flex items-start gap-3 py-1">
          <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
            row.type === 'error' ? 'bg-red-500' :
            row.type === 'warning' ? 'bg-yellow-500' :
            row.type === 'success' ? 'bg-green-500' :
            'bg-blue-500'
          }`} />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{row.title}</div>
            <div className="text-xs text-muted-foreground truncate">
              {row.message}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(row.createdAt).toLocaleString('ru-RU')}
            </div>
          </div>
        </div>
      ))
    ],
    
    enableRowSelection: false,
    enableColumnVisibility: false,
    
    actions: [
      {
        label: "Подробнее",
        onClick: (row) => console.log("Подробнее:", row),
        variant: "ghost"
      }
    ]
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Недавние уведомления</h3>
      <UniversalTable
        config={config}
        data={data?.notifications || []}
        isLoading={isLoading}
      />
    </div>
  )
}