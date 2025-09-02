"use client"

import { use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plus, Settings, Filter, RefreshCw, Edit, User } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { 
  AdvancedUniversalTable,
  columnHelpers,
  commonColumns,
  type AdvancedTableConfig 
} from "@/shared/components/data-table"

// Конфигурации таблиц для разных моделей
const modelConfigs = {
  users: {
    title: "Users", 
    description: "Manage system users",
    icon: "👥",
    color: "green"
  },
} as const

// Типы для данных
interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

import { 
  useModelPagination,
} from '@/shared/hooks'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/shared/api/users'

// Хук для получения данных пользователей через basic API
function useBasicUsersData(paginationParams: { page: number; limit: number }, status?: string) {
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['simpleUsers', paginationParams, status],
    queryFn: () => usersApi.getSimpleUsers({
      page: paginationParams.page,
      limit: paginationParams.limit,
      status: status === 'active' ? 'active' : undefined
    }),
    staleTime: 1000 * 60 * 2, // 2 минуты кэширование
  })
  
  if (error) {
    console.warn('API error for users:', error)
    return { 
      isLoading: false, 
      error: null,
      data: [],
      total: 0
    }
  }
  
  if (apiData) {
    console.log('📊 Users data:', apiData)
    
    return {
      data: apiData.data || [],
      total: apiData.pagination?.total || 0,
      isLoading,
      error: null
    }
  }
  
  return { 
    isLoading, 
    error: null, 
    data: [],
    total: 0
  }
}

// Генератор конфигураций таблиц для разных моделей
function getTableConfig(
  model: string, 
  router: any,
  total: number,
  paginationConfig: any
): AdvancedTableConfig<any> {
  const baseActions = [
    {
      label: "Edit",
      icon: <Settings className="h-4 w-4" />,
      onClick: (row: any) => router.push(`/admin/dashboard/${model}/update?id=${row.id}`),
      variant: "default" as const
    }
  ]

  switch (model) {
    case "users":
      return {
        columns: [
          columnHelpers.text("tgId", "Telegram ID", { 
            width: 150,
            render: (value: string) => (
              <span className="font-mono text-sm px-2 py-1 rounded">
                {value}
              </span>
            )
          }),
          columnHelpers.text("username", "Username", { 
            width: 200,
            render: (value: string | undefined, row: any) => (
              <span className="font-medium">
                {value || <span className="text-gray-400 italic">No username</span>}
              </span>
            )
          }),
          commonColumns.createdAt({ width: 150 })
        ],
        searchKeys: ["id", "tgId", "username"],
        searchPlaceholder: "Search by ID, Telegram ID or Username...",
        selectable: true,
        serverPagination: paginationConfig(total),
        onRowClick: (row: any) => router.push(`/admin/dashboard/${model}/update?id=${row.id}`),
        actions: [
          ...baseActions,
        ]
      }
    default:
      return {
        columns: [commonColumns.id({ width: 200 })],
        searchKeys: ["id"],
        selectable: false,
        actions: baseActions
      }
  }
}

interface PageProps {
  params: Promise<{ model: string }>
}

export default function ModelPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const { model } = resolvedParams
  const router = useRouter()
  
  // Единый хук для пагинации
  const { page, pageSize, paginationConfig, params: paginationParams } = useModelPagination(1, 10)

  // Поддержка фильтра по активным через query-параметр
  const searchParams = useSearchParams()
  const statusParam = searchParams.get('status')

  // Загружаем пользователей через basic API
  const { data, total, isLoading, error } = useBasicUsersData(paginationParams, statusParam || undefined)
  
  // Для admin-дешборда оставляем только модель users
  const safeModel = 'users'
  const modelConfig = modelConfigs[safeModel]
  
  // Получаем конфигурацию таблицы
  const finalTableConfig = getTableConfig(safeModel, router, total || 0, paginationConfig)

  if (!modelConfig) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Model not found or not configured</CardTitle>
            <CardDescription>
              {`Model "${safeModel}" not found or not configured`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Available models: {Object.keys(modelConfigs).join(", ")}
              </p>
              <Button onClick={() => router.push("/admin/dashboard")} variant="outline">
                Return to main page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{modelConfig.icon}</span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {modelConfig.title}
              </h1>
              <p className="text-muted-foreground">
                {modelConfig.description}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {safeModel}
          </Badge>
          <Button onClick={() => router.refresh()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm"
            onClick={() => router.push(`/admin/dashboard/${safeModel}/create`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(total || 0).toLocaleString('ru-RU')}</div>
            <p className="text-xs text-muted-foreground">
              In database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              On current page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Page {page} of {Math.ceil((total || 0) / pageSize)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.filter((item: any) => item.isActive !== false).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active elements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Last update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Now</div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleString('en-US')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Основная таблица */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>List of {modelConfig.title.toLowerCase()}</CardTitle>
              <CardDescription>
                {`Management of data model "${safeModel}"`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdvancedUniversalTable
            config={finalTableConfig}
            data={data || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Дополнительная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Information about model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-2">Parameters</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Model:</dt>
                  <dd className="font-mono">{model}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Page:</dt>
                  <dd>{page}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Page size:</dt>
                  <dd>{pageSize}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total pages:</dt>
                  <dd>{Math.ceil((total || 0) / pageSize)}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Capabilities</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Search and filtering</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sorting by columns</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Server pagination</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Row selection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Contextual actions</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


