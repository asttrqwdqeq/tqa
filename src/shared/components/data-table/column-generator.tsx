import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Badge } from "@/shared/components/ui/badge"
import { ColumnConfig, ColumnType } from "./types"
import { cn } from "@/shared/lib/utils"

// Утилита для получения значения по пути (поддерживает вложенные объекты)
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Форматирование даты
function formatDate(date: string | Date, config?: { format?: string; locale?: string }): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'Неверная дата'
  }

  const formatStr = config?.format || 'dd.MM.yyyy HH:mm'
  return format(dateObj, formatStr, { locale: ru })
}

// Рендеринг badge
function renderBadge(value: any, config?: { 
  colorMap?: Record<string, "default" | "secondary" | "destructive" | "outline">
  variant?: "default" | "secondary" | "destructive" | "outline"
}) {
  const variant = config?.colorMap?.[value] || config?.variant || "default"
  return <Badge variant={variant}>{value}</Badge>
}

// Рендеринг boolean значения
function renderBoolean(value: boolean, config?: {
  trueLabel?: string
  falseLabel?: string
  trueVariant?: "default" | "secondary" | "destructive" | "outline"
  falseVariant?: "default" | "secondary" | "destructive" | "outline"
}) {
  const label = value 
    ? (config?.trueLabel || 'Да')
    : (config?.falseLabel || 'Нет')
  
  const variant = value 
    ? (config?.trueVariant || 'default')
    : (config?.falseVariant || 'secondary')
  
  return <Badge variant={variant}>{label}</Badge>
}

// Основная функция для генерации колонки
function generateColumn<T>(config: ColumnConfig): ColumnDef<T> {
  const accessor = config.accessor || config.key
  
  return {
    id: config.key,
    accessorKey: accessor,
    header: ({ column }) => {
      return (
        <div 
          className={cn(
            "font-medium",
            config.align === "center" && "text-center",
            config.align === "right" && "text-right",
            config.headerClassName
          )}
        >
          {config.label}
        </div>
      )
    },
    cell: ({ row }) => {
      const value = getNestedValue(row.original, accessor)
      
      // Кастомный рендерер имеет приоритет
      if (config.render) {
        return (
          <div className={cn(
            config.align === "center" && "text-center",
            config.align === "right" && "text-right",
            config.cellClassName
          )}>
            {config.render(value, row.original)}
          </div>
        )
      }
      
      // Обработка null/undefined значений
      if (value == null) {
        return (
          <div className={cn(
            "text-muted-foreground",
            config.align === "center" && "text-center",
            config.align === "right" && "text-right",
            config.cellClassName
          )}>
            —
          </div>
        )
      }
      
      let renderedValue: React.ReactNode = value
      
      // Рендеринг по типу
      switch (config.type) {
        case "text":
          renderedValue = config.format ? config.format(value) : String(value)
          break
          
        case "number":
          renderedValue = config.format 
            ? config.format(value) 
            : typeof value === 'number' 
              ? value.toLocaleString('ru-RU')
              : String(value)
          break
          
        case "date":
          renderedValue = formatDate(value, {
            format: config.dateConfig?.customFormat || config.dateConfig?.format
          })
          break
          
        case "boolean":
          renderedValue = renderBoolean(Boolean(value), config.booleanConfig)
          break
          
        case "badge":
          renderedValue = renderBadge(value, config.badgeConfig)
          break
          
        case "avatar":
          // TODO: Реализовать avatar компонент
          renderedValue = (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
              {String(value).charAt(0).toUpperCase()}
            </div>
          )
          break
          
        case "custom":
          renderedValue = config.format ? config.format(value) : String(value)
          break
          
        default:
          renderedValue = String(value)
      }
      
      return (
        <div className={cn(
          config.align === "center" && "text-center",
          config.align === "right" && "text-right",
          config.cellClassName
        )}>
          {renderedValue}
        </div>
      )
    },
    enableSorting: config.sortable !== false,
    enableHiding: config.hideable !== false,
    size: typeof config.width === 'number' ? config.width : undefined,
  }
}

// Генерация всех колонок из конфигурации
export function generateColumns<T>(configs: ColumnConfig[]): ColumnDef<T>[] {
  return configs.map(config => generateColumn<T>(config))
}

// Хелперы для быстрого создания колонок
export const columnHelpers = {
  // Текстовая колонка
  text: (key: string, label: string, options?: Partial<ColumnConfig>): ColumnConfig => ({
    key,
    label,
    type: "text",
    ...options,
  }),
  
  // Числовая колонка
  number: (key: string, label: string, options?: Partial<ColumnConfig>): ColumnConfig => ({
    key,
    label,
    type: "number",
    align: "right",
    ...options,
  }),
  
  // Колонка даты
  date: (key: string, label: string, options?: Partial<ColumnConfig>): ColumnConfig => ({
    key,
    label,
    type: "date",
    ...options,
  }),
  
  // Boolean колонка с badge
  boolean: (key: string, label: string, options?: Partial<ColumnConfig>): ColumnConfig => ({
    key,
    label,
    type: "boolean",
    align: "center",
    ...options,
  }),
  
  // Badge колонка
  badge: (key: string, label: string, colorMap?: Record<string, any>, options?: Partial<ColumnConfig>): ColumnConfig => ({
    key,
    label,
    type: "badge",
    align: "center",
    badgeConfig: { colorMap },
    ...options,
  }),
  
  // Кастомная колонка
  custom: (
    key: string, 
    label: string, 
    render: (value: any, row: any) => React.ReactNode,
    options?: Partial<ColumnConfig>
  ): ColumnConfig => ({
    key,
    label,
    type: "custom",
    render,
    ...options,
  }),
}

// Предустановленные конфигурации для часто используемых колонок
export const commonColumns = {
  // ID колонка
  id: (options?: Partial<ColumnConfig>): ColumnConfig => 
    columnHelpers.text("id", "ID", { 
      width: 80,
      align: "center",
      ...options 
    }),
  
  // Заголовок/название
  title: (key = "title", options?: Partial<ColumnConfig>): ColumnConfig =>
    columnHelpers.text(key, "Заголовок", options),
  
  // Статус с badge
  status: (colorMap?: Record<string, any>, options?: Partial<ColumnConfig>): ColumnConfig =>
    columnHelpers.badge("status", "Статус", colorMap, {
      width: 120,
      ...options
    }),
  
  // Активность
  isActive: (options?: Partial<ColumnConfig>): ColumnConfig =>
    columnHelpers.boolean("isActive", "Активно", {
      booleanConfig: {
        trueLabel: "Активно",
        falseLabel: "Неактивно",
        trueVariant: "default",
        falseVariant: "secondary"
      },
      width: 100,
      ...options
    }),
  
  // Дата создания
  createdAt: (options?: Partial<ColumnConfig>): ColumnConfig =>
    columnHelpers.date("createdAt", "Создано", {
      width: 180,
      ...options
    }),
  
  // Дата обновления
  updatedAt: (options?: Partial<ColumnConfig>): ColumnConfig =>
    columnHelpers.date("updatedAt", "Обновлено", {
      width: 180,
      ...options
    }),
}