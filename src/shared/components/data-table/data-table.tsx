"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Input } from "@/shared/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

// Типы для конфигурации таблицы
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchKeys?: string[]
  searchPlaceholder?: string
  isLoading?: boolean
  onRowClick?: (row: TData) => void
  onRowSelect?: (selectedRows: TData[]) => void
  enableRowSelection?: boolean
  enableColumnVisibility?: boolean
  enableSorting?: boolean
  enableFiltering?: boolean
  pagination?: {
    pageIndex: number
    pageSize: number
    pageCount: number
    onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void
  }
  actions?: {
    label: string
    icon?: React.ReactNode
    onClick: (row: TData) => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchKeys,
  searchPlaceholder = "Search...",
  isLoading = false,
  onRowClick,
  onRowSelect,
  enableRowSelection = false,
  enableColumnVisibility = true,
  enableSorting = true,
  enableFiltering = true,
  pagination,
  actions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Виртуальная колонка для объединенного поиска по нескольким полям
  const combinedSearchColumn = React.useMemo<ColumnDef<TData> | undefined>(() => {
    if (!searchKeys || searchKeys.length === 0) return undefined
    const COMBINED_ID = "__combined_search__"
    return {
      id: COMBINED_ID,
      enableHiding: true,
      // Пользовательская функция фильтрации: строка подходит, если ХОТЯ БЫ ОДНО поле совпало
      filterFn: (row, _columnId, filterValue) => {
        const needle = String(filterValue ?? "").toLowerCase().trim()
        if (!needle) return true
        return searchKeys.some((key) => {
          // Пытаемся получить значение через существующую колонку, иначе из оригинальной строки
          const viaColumn = row.getValue<any>(key)
          const value = viaColumn ?? (row.original as any)?.[key]
          if (value == null) return false
          return String(value).toLowerCase().includes(needle)
        })
      },
    }
  }, [searchKeys])

  // Прячем объединенную колонку из отображения
  React.useEffect(() => {
    if (combinedSearchColumn?.id) {
      setColumnVisibility((prev) => ({ ...prev, [combinedSearchColumn.id as string]: false }))
    }
  }, [combinedSearchColumn?.id])

  // Собираем итоговые колонки (оригинальные + виртуальная для поиска + действия)
  const tableColumns = React.useMemo(() => {
    const withSearch = combinedSearchColumn ? [...columns, combinedSearchColumn] : columns
    if (!actions || actions.length === 0) return withSearch

    const actionsColumn: ColumnDef<TData> = {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {actions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.onClick(row.original)}
                  className="cursor-pointer"
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }

    return [...withSearch, actionsColumn]
  }, [columns, combinedSearchColumn, actions])

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnFilters: enableFiltering ? columnFilters : undefined,
      columnVisibility: enableColumnVisibility ? columnVisibility : undefined,
      rowSelection: enableRowSelection ? rowSelection : undefined,
      pagination: pagination ? {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      } : undefined,
    },
    enableRowSelection,
    manualPagination: !!pagination,
    pageCount: pagination?.pageCount ?? -1,
  })

  // Обработка выбора строк
  React.useEffect(() => {
    if (enableRowSelection && onRowSelect) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
      onRowSelect(selectedRows)
    }
  }, [rowSelection, table, onRowSelect, enableRowSelection])

  // Обработка изменения пагинации
  React.useEffect(() => {
    if (pagination) {
      const state = table.getState().pagination
      if (state.pageIndex !== pagination.pageIndex || state.pageSize !== pagination.pageSize) {
        pagination.onPaginationChange({
          pageIndex: state.pageIndex,
          pageSize: state.pageSize,
        })
      }
    }
  }, [table.getState().pagination, pagination])

  return (
    <div className="w-full">
      {/* Панель управления */}
      <div className="flex items-center py-4">
        {/* Поиск */}
        {enableFiltering && (searchKeys?.length || searchKey) && (
          <Input
            placeholder={searchPlaceholder}
            value={(() => {
              if (searchKeys && searchKeys.length > 0) {
                return (table.getColumn("__combined_search__")?.getFilterValue() as string) ?? ""
              }
              return (table.getColumn(searchKey!)?.getFilterValue() as string) ?? ""
            })()}
            onChange={(event) => {
              const value = event.target.value
              if (searchKeys && searchKeys.length > 0) {
                table.getColumn("__combined_search__")?.setFilterValue(value)
              } else if (searchKey) {
                table.getColumn(searchKey)?.setFilterValue(value)
              }
            }}
            className="max-w-sm"
          />
        )}

        {/* Управление видимостью колонок */}
        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Таблица */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-2"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {enableSorting && header.column.getCanSort() && (
                            <div className="flex flex-col">
                              <ChevronUp
                                className={`h-3 w-3 ${
                                  header.column.getIsSorted() === "asc"
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <ChevronDown
                                className={`h-3 w-3 ${
                                  header.column.getIsSorted() === "desc"
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      <div className="flex items-center justify-end space-x-2 py-4">
        {enableRowSelection && (
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} rows selected.
          </div>
        )}
        
        {pagination ? (
          // Серверная пагинация
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Page {pagination.pageIndex + 1} of {pagination.pageCount}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.onPaginationChange({
                  pageIndex: pagination.pageIndex - 1,
                  pageSize: pagination.pageSize,
                })
              }
              disabled={pagination.pageIndex === 0}
            >
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                pagination.onPaginationChange({
                  pageIndex: pagination.pageIndex + 1,
                  pageSize: pagination.pageSize,
                })
              }
              disabled={pagination.pageIndex >= pagination.pageCount - 1}
            >
              Forward
            </Button>
          </div>
        ) : (
          // Client pagination
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Forward
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}