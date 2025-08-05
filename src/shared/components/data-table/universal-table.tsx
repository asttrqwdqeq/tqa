"use client"

import * as React from "react"
import { DataTable } from "./data-table"
import { generateColumns } from "./column-generator"
import { TableConfig, AdvancedTableConfig } from "./types"

// Простая универсальная таблица
interface UniversalTableProps<T> {
  config: TableConfig<T>
  data: T[]
  isLoading?: boolean
  onRowClick?: (row: T) => void
}

export function UniversalTable<T>({
  config,
  data,
  isLoading = false,
  onRowClick,
}: UniversalTableProps<T>) {
  // Генерируем колонки из конфигурации
  const columns = React.useMemo(() => {
    return generateColumns<T>(config.columns)
  }, [config.columns])

  // Фильтруем действия по показу
  const filteredActions = React.useMemo(() => {
    if (!config.actions) return undefined
    
    return config.actions.map(action => ({
      ...action,
      onClick: action.onClick,
    }))
  }, [config.actions])

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      searchKey={config.searchKey}
      searchPlaceholder={config.searchPlaceholder}
      onRowClick={onRowClick}
      enableRowSelection={config.enableRowSelection}
      enableColumnVisibility={config.enableColumnVisibility}
      actions={filteredActions}
    />
  )
}

// Расширенная универсальная таблица с серверной пагинацией
interface AdvancedUniversalTableProps<T> {
  config: AdvancedTableConfig<T>
  data: T[]
  isLoading?: boolean
}

export function AdvancedUniversalTable<T>({
  config,
  data,
  isLoading = false,
}: AdvancedUniversalTableProps<T>) {
  const [selectedRows, setSelectedRows] = React.useState<T[]>([])

  // Генерируем колонки из конфигурации
  const columns = React.useMemo(() => {
    return generateColumns<T>(config.columns)
  }, [config.columns])

  // Обработка выбора строк
  const handleRowSelect = React.useCallback((rows: T[]) => {
    setSelectedRows(rows)
    config.onSelectionChange?.(rows)
  }, [config.onSelectionChange])

  // Конфигурация серверной пагинации
  const paginationConfig = React.useMemo(() => {
    if (!config.serverPagination) return undefined

    return {
      pageIndex: config.serverPagination.page - 1, // TanStack использует 0-based индексы
      pageSize: config.serverPagination.pageSize,
      pageCount: Math.ceil(config.serverPagination.total / config.serverPagination.pageSize),
      onPaginationChange: ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
        config.serverPagination?.onPageChange(pageIndex + 1) // Конвертируем в 1-based
        if (pageSize !== config.serverPagination?.pageSize) {
          config.serverPagination?.onPageSizeChange(pageSize)
        }
      },
    }
  }, [config.serverPagination])

  // Фильтруем действия по показу
  const filteredActions = React.useMemo(() => {
    if (!config.actions) return undefined
    
    return config.actions
      .filter(action => !action.show || data.every(row => action.show!(row)))
      .map(action => ({
        ...action,
        onClick: action.onClick,
      }))
  }, [config.actions, data])

  return (
    <div className="space-y-4">
      {/* Дополнительные фильтры */}
      {config.filters && config.filters.length > 0 && (
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          {/* TODO: Реализовать компоненты фильтров */}
          <div className="text-sm text-muted-foreground">
            Фильтры будут реализованы в следующей версии
          </div>
        </div>
      )}

      {/* Информация о выбранных строках */}
      {config.selectable && selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            Выбрано: {selectedRows.length} элементов
          </span>
          <button
            onClick={() => setSelectedRows([])}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Очистить выбор
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        searchKey={config.searchKey}
        searchPlaceholder={config.searchPlaceholder || "Поиск..."}
        onRowClick={config.onRowClick}
        onRowSelect={config.selectable ? handleRowSelect : undefined}
        enableRowSelection={config.selectable}
        enableColumnVisibility={config.enableColumnVisibility !== false}
        pagination={paginationConfig}
        actions={filteredActions}
      />

      {/* Экспорт */}
      {config.exportable && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              // TODO: Реализовать экспорт
              console.log('Экспорт данных:', data)
            }}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Экспорт в CSV
          </button>
        </div>
      )}
    </div>
  )
}

// Хук для упрощения работы с серверной пагинацией
export function useServerPagination(
  initialPage = 1,
  initialPageSize = 10
) {
  const [page, setPage] = React.useState(initialPage)
  const [pageSize, setPageSize] = React.useState(initialPageSize)

  const paginationConfig = React.useCallback((total: number) => ({
    page,
    pageSize,
    total,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
  }), [page, pageSize])

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    paginationConfig,
  }
}