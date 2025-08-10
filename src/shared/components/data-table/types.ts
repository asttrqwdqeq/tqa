import { ColumnDef, Row } from "@tanstack/react-table"

// Базовые типы для колонок
export interface BaseColumnConfig {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  hideable?: boolean
  width?: number | string
  align?: "left" | "center" | "right"
}

// Типы данных в колонках
export type ColumnType = 
  | "text" 
  | "number" 
  | "date" 
  | "boolean" 
  | "badge" 
  | "avatar" 
  | "custom"

// Конфигурация для badge колонки
export interface BadgeConfig {
  variant?: "default" | "secondary" | "destructive" | "outline"
  colorMap?: Record<string, "default" | "secondary" | "destructive" | "outline">
}

// Конфигурация для avatar колонки  
export interface AvatarConfig {
  src?: string
  fallback?: string
  size?: "sm" | "md" | "lg"
}

// Конфигурация для boolean колонки
export interface BooleanConfig {
  trueLabel?: string
  falseLabel?: string
  trueVariant?: "default" | "secondary" | "destructive" | "outline"
  falseVariant?: "default" | "secondary" | "destructive" | "outline"
}

// Конфигурация для date колонки
export interface DateConfig {
  format?: "short" | "medium" | "long" | "relative" | "custom"
  customFormat?: string
  locale?: string
}

// Расширенная конфигурация колонки
export interface ColumnConfig extends BaseColumnConfig {
  type: ColumnType
  accessor?: string // Путь к данным (поддерживает вложенные объекты)
  
  // Конфигурации для разных типов
  badgeConfig?: BadgeConfig
  avatarConfig?: AvatarConfig
  booleanConfig?: BooleanConfig
  dateConfig?: DateConfig
  
  // Кастомный рендерер
  render?: (value: any, row: any) => React.ReactNode
  
  // Функция форматирования значения
  format?: (value: any) => string

  // Кастомная функция фильтрации для колонки
  filterFn?: (row: Row<any>, columnId: string, filterValue: unknown) => boolean
  
  // CSS классы
  cellClassName?: string
  headerClassName?: string
}

// Конфигурация для быстрого создания таблиц
export interface TableConfig<T = any> {
  columns: ColumnConfig[]
  searchKey?: string
  searchKeys?: string[]
  searchPlaceholder?: string
  defaultSort?: {
    key: string
    direction: "asc" | "desc"
  }
  pageSize?: number
  enableRowSelection?: boolean
  enableColumnVisibility?: boolean
  actions?: {
    label: string
    icon?: React.ReactNode
    onClick: (row: T) => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    show?: (row: T) => boolean
  }[]
}

// Типы для серверной пагинации
export interface ServerPaginationConfig {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

// Типы для фильтрации
export interface FilterConfig {
  key: string
  type: "text" | "select" | "date" | "boolean"
  label: string
  options?: { label: string; value: string }[]
  placeholder?: string
}

// Полная конфигурация таблицы с расширенными возможностями
export interface AdvancedTableConfig<T = any> extends TableConfig<T> {
  serverPagination?: ServerPaginationConfig
  filters?: FilterConfig[]
  exportable?: boolean
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
  onRowClick?: (row: T) => void
  emptyStateMessage?: string
  loadingMessage?: string
}