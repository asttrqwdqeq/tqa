"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Plus, Settings, Filter, RefreshCw } from "lucide-react"

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
  notifications: {
    title: "Notifications",
    description: "Manage system notifications",
    icon: "📢",
    color: "blue"
  },
  users: {
    title: "Users", 
    description: "Manage system users",
    icon: "👥",
    color: "green"
  },
  appWallet: {
    title: "App Wallet",
    description: "Manage app wallet",
    icon: "💰", 
    color: "blue"
  }
} as const

// Типы для данных
interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

interface NotificationEntity extends BaseEntity {
  title: string
  message: string
  isAlert: boolean
}

interface UserEntity extends BaseEntity {
  name: string
  email: string
  role: "admin" | "user" | "moderator"
  isActive: boolean
  lastLogin?: string
}

interface OrderEntity extends BaseEntity {
  orderNumber: string
  customerName: string
  total: number
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled"
}

interface AppWalletEntity extends BaseEntity {
  userCount?: number
}

import { 
  useModelList, 
  useDeleteModel,
  useModelPagination,
  usePrefetchModel 
} from '@/shared/hooks'

// Хук для получения данных модели с использованием универсального API
function useModelData(model: string, paginationParams: { page: number; limit: number }) {
  // Используем универсальный хук
  const { data: apiData, isLoading, error } = useModelList(model, paginationParams, {
    enabled: ['notifications', 'appWallet', 'users'].includes(model), // Включаем реальный API для notifications и appWallet
    staleTime: 1000 * 60 * 2, // 2 минуты кэширование
  })
  
  if (error) {
    console.warn(`API ошибка для модели ${model}:`, error)
    return { 
      isLoading: false, 
      error: null,
      data: [],
      total: 0
    }
  }
  
  if (apiData) {
    console.log(`📊 Data for ${model}:`, apiData) // Debug logging
    return {
      data: apiData.data || [],
      total: apiData.total || 0,
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
  deleteMutation: any,
  prefetchItem: any
): AdvancedTableConfig<any> { 
  const baseActions = [
    {
      label: "View",
      icon: <Settings className="h-4 w-4" />,
      onClick: (row: any) => {
        router.push(`/dashboard/${model}/update?id=${row.id}`)
      },
      variant: "outline" as const,
      onHover: (row: any) => {
        prefetchItem(model, row.id)
      }
    },
    {
      label: "Edit", 
      icon: <Settings className="h-4 w-4" />,
      onClick: (row: any) => {
        router.push(`/dashboard/${model}/update?id=${row.id}`)
      },
      variant: "default" as const,
      onHover: (row: any) => {
        prefetchItem(model, row.id)
      }
    },
    {
      label: "Delete",
      icon: <Settings className="h-4 w-4" />,
      onClick: (row: any) => {
        if (confirm(`Delete ${model}?`)) {
          deleteMutation.mutate(row.id, {
            onSuccess: () => {
              console.log(`Successfully deleted ${model}:`, row.id)
            },
            onError: (error: any) => {
              console.error(`Error deleting ${model}:`, error)
            }
          })
        } 
      },
      variant: "destructive" as const,
      disabled: (row: any) => deleteMutation.isPending
    }
  ]

  switch (model) {
    case "notifications":
      return {
        columns: [
          commonColumns.id({ width: 100 }),
          columnHelpers.text("title", "Title", { width: 250 }),
          columnHelpers.text("message", "Message", { 
            width: 300,
            render: (value) => (
              <div className="truncate max-w-xs" title={value}>
                {value}
              </div>
            )
          }),
          columnHelpers.custom("isAlert", "Type", (value, row: NotificationEntity) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.isAlert 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {row.isAlert ? 'Important' : 'Normal'}
            </span>
          ), { width: 120 }),
          commonColumns.createdAt({ width: 180 })
        ],
        searchKey: "title",
        searchPlaceholder: "Search by title...",
        selectable: true,
        actions: [
          ...baseActions,
          {
            label: "Toggle type",
            onClick: (row: NotificationEntity) => {
              console.log("Toggle type:", row)
              alert(`Notification ${row.isAlert ? 'made normal' : 'made important'}`)
            },
            variant: "secondary" as const
          }
        ]
      }

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
          columnHelpers.custom("balance", "Balance", (value: number) => (
            <span className={`font-semibold ${value > 0 ? 'text-green-600' : 'text-gray-500'}`}>
              ${value?.toFixed(2) || '0.00'}
            </span>
          ), { width: 120 }),
          columnHelpers.custom("vipLevel", "VIP Level", (value: any) => {
            if (!value) return <span className="text-gray-400 text-sm">No VIP</span>
            return (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Level {value.id}
              </span>
            )
          }, { width: 120 }),
          columnHelpers.custom("stats", "Referrals", (value: any, row: any) => (
            <span className="font-medium text-blue-600">
              {row.stats?.referralsCount || 0}
            </span>
          ), { width: 100 }),
          columnHelpers.custom("stats", "Operations", (value: any, row: any) => (
            <span className="font-medium text-orange-600">
              {row.stats?.operationsCount || 0}
            </span>
          ), { width: 100 }),
          columnHelpers.date("lastActivityAt", "Last Activity", { 
            width: 150,
            render: (value: string | undefined) => {
              if (!value) return <span className="text-gray-400">Never</span>
              const date = new Date(value)
              const isRecent = Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days
              return (
                <span className={isRecent ? 'text-green-600' : 'text-gray-500'}>
                  {date.toLocaleDateString()}
                </span>
              )
            }
          }),
          commonColumns.createdAt({ width: 150 })
        ],
        searchKey: "username",
        searchPlaceholder: "Search by username or Telegram ID...",
        selectable: true,
        actions: [
          ...baseActions,
          {
            label: "Balance",
            icon: <Settings className="h-4 w-4" />,
            onClick: (row: any) => {
              const newBalance = prompt(`Enter new balance for ${row.username || row.tgId}:`, row.balance?.toString() || '0')
              if (newBalance && !isNaN(parseFloat(newBalance))) {
                console.log('Update balance for user:', row.id, parseFloat(newBalance))
                alert(`Balance will be updated to $${parseFloat(newBalance)}`)
              }
            },
            variant: "outline" as const
          }
        ]
      }

    case "appWallet":
      return {
        columns: [
          commonColumns.id({ width: 200 }),
          columnHelpers.custom("userCount", "Users", (value, row: AppWalletEntity) => (
            <span className="text-sm font-medium">
              {row.userCount || 0}
            </span>
          ), { width: 120 }),
          commonColumns.createdAt({ width: 180 })
        ],
        searchKey: "id",
        searchPlaceholder: "Search by ID...",
        selectable: true,
        actions: [
          ...baseActions,
          {
            label: "Statistics",
            onClick: (row: AppWalletEntity) => {
              console.log("View statistics:", row)
              alert(`Statistics of wallet ${row.id}`)
            },
            variant: "secondary" as const
          }
        ]
      }

    default:
      return {
        columns: [
          commonColumns.id(),
          columnHelpers.text("name", "Name"),
          commonColumns.createdAt()
        ],
        searchKey: "name",
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
  
  // Используем универсальные хуки с правильными параметрами пагинации
  const { data, total, isLoading } = useModelData(model, paginationParams)
  const deleteMutation = useDeleteModel(model)
  const { prefetchItem } = usePrefetchModel()
  
  const modelConfig = modelConfigs[model as keyof typeof modelConfigs]
  const tableConfig = getTableConfig(model, router, deleteMutation, prefetchItem)
  
  // Добавляем серверную пагинацию к конфигурации таблицы
  const finalTableConfig: AdvancedTableConfig<any> = {
    ...tableConfig,
    serverPagination: paginationConfig(total || 0)
  }

  if (!modelConfig) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Model not found or not configured</CardTitle>
            <CardDescription>
              {`Model "${model}" not found or not configured`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Available models: {Object.keys(modelConfigs).join(", ")}
              </p>
              <Button onClick={() => router.push("/dashboard")} variant="outline">
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
            {model}
          </Badge>
          <Button onClick={() => router.refresh()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm"
            onClick={() => router.push(`/dashboard/${model}/create`)}
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
              {model === 'notifications' ? 'Important notifications' : 'Active records'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {model === 'notifications' 
                ? data?.filter((item: any) => item.isAlert === true).length || 0
                : data?.filter((item: any) => item.isActive !== false).length || 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {model === 'notifications' ? 'Important notifications' : 'Active elements'}
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
              {new Date().toLocaleString('ru-RU')}
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
                {`Management of data model "${model}"`}
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
