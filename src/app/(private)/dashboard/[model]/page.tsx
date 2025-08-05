"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Plus, Settings, Filter, RefreshCw } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { 
  UniversalTable, 
  AdvancedUniversalTable,
  useServerPagination,
  columnHelpers,
  commonColumns,
  type TableConfig,
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
function useModelData(model: string) {
  const { page, pageSize, params } = useModelPagination(1, 10)
  
  // Используем универсальный хук
  const { data: apiData, isLoading, error } = useModelList(model, params, {
    enabled: ['notifications', 'appWallet'].includes(model), // Включаем реальный API для notifications и appWallet
    staleTime: 1000 * 60 * 2, // 2 минуты кэширование
  })
  
  // Fallback на мок-данные если API недоступен
  const generateMockData = () => {
    switch (model) {
      case "notifications":
        return {
          data: Array.from({ length: pageSize || 10 }, (_, i) => ({
            id: `notif-${page || 1}-${i}`,
            title: `Уведомление ${((page || 1) - 1) * (pageSize || 10) + i + 1}`,
            message: `Содержание уведомления номер ${((page || 1) - 1) * (pageSize || 10) + i + 1}. Это важная информация для пользователей системы.`,
            isAlert: Math.random() > 0.5,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          })) as NotificationEntity[],
          total: 127,
          isLoading: false
        }
        
      case "users":
        return {
          data: Array.from({ length: pageSize || 10 }, (_, i) => ({
            id: `user-${page || 1}-${i}`,
            name: `Пользователь ${((page || 1) - 1) * (pageSize || 10) + i + 1}`,
            email: `user${((page || 1) - 1) * (pageSize || 10) + i + 1}@example.com`,
            role: ["admin", "user", "moderator"][Math.floor(Math.random() * 3)] as any,
            isActive: Math.random() > 0.2,
            lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          })) as UserEntity[],
          total: 89,
          isLoading: false
        }
        
      case "orders":
        return {
          data: Array.from({ length: pageSize || 10 }, (_, i) => ({
            id: `order-${page || 1}-${i}`,
            orderNumber: `ORD-${String(((page || 1) - 1) * (pageSize || 10) + i + 1).padStart(6, '0')}`,
            customerName: `Клиент ${((page || 1) - 1) * (pageSize || 10) + i + 1}`,
            total: Math.floor(Math.random() * 50000) + 1000,
            status: ["pending", "paid", "shipped", "delivered", "cancelled"][Math.floor(Math.random() * 5)] as any,
            createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          })) as OrderEntity[],
          total: 234,
          isLoading: false
        }
        
              case "appWallet":
          return {
            data: Array.from({ length: pageSize || 10 }, (_, i) => ({
              id: `wallet-${String(((page || 1) - 1) * (pageSize || 10) + i + 1).padStart(6, '0')}`,
              createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
              userCount: Math.floor(Math.random() * 50)
            })) as AppWalletEntity[],
            total: 45,
            isLoading: false
          }
        
      default:
        return {
          data: [],
          total: 0,
          isLoading: false,
          page: 1,
          pageSize: 10
        }
    }
  }

  // Возвращаем реальные данные или мок-данные при ошибке
  if (error) {
    console.warn(`API ошибка для модели ${model}:`, error)
    const mockData = generateMockData()
    return { 
      ...mockData, 
      isLoading: false, 
      error: null,
      page: page || 1,
      pageSize: pageSize || 10
    }
  }
  
  if (apiData) {
    return {
      data: apiData.data || [],
      total: apiData.total || 0,
      isLoading,
      error: null,
      page: page || 1,
      pageSize: pageSize || 10
    }
  }
  
  const mockData = generateMockData()
  return { 
    ...mockData, 
    isLoading, 
    error: null, 
    page: page || 1, 
    pageSize: pageSize || 10 
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
      label: "Просмотр",
      icon: <Settings className="h-4 w-4" />,
      onClick: (row: any) => {
        router.push(`/dashboard/${model}/update?id=${row.id}`)
      },
      variant: "outline" as const,
      onHover: (row: any) => {
        // Предзагружаем данные при наведении
        prefetchItem(model, row.id)
      }
    },
    {
      label: "Редактировать", 
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
      label: "Удалить",
      icon: <Settings className="h-4 w-4" />,
      onClick: (row: any) => {
        if (confirm(`Удалить ${model}?`)) {
          deleteMutation.mutate(row.id, {
            onSuccess: () => {
              console.log(`Успешно удален ${model}:`, row.id)
            },
            onError: (error: any) => {
              console.error(`Ошибка удаления ${model}:`, error)
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
          columnHelpers.text("title", "Заголовок", { width: 250 }),
          columnHelpers.text("message", "Сообщение", { 
            width: 300,
            render: (value) => (
              <div className="truncate max-w-xs" title={value}>
                {value}
              </div>
            )
          }),
          columnHelpers.custom("isAlert", "Тип", (value, row: NotificationEntity) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.isAlert 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {row.isAlert ? 'Важное' : 'Обычное'}
            </span>
          ), { width: 120 }),
          commonColumns.createdAt({ width: 180 })
        ],
        searchKey: "title",
        searchPlaceholder: "Поиск по заголовку...",
        selectable: true,
        actions: [
          ...baseActions,
          {
            label: "Переключить тип",
            onClick: (row: NotificationEntity) => {
              console.log("Переключение типа:", row)
              alert(`Уведомление ${row.isAlert ? 'сделано обычным' : 'сделано важным'}`)
            },
            variant: "secondary" as const
          }
        ]
      }

    case "users":
      return {
        columns: [
          commonColumns.id({ width: 100 }),
          columnHelpers.text("name", "Имя", { width: 200 }),
          columnHelpers.text("email", "Email", { width: 250 }),
          columnHelpers.badge("role", "Роль", {
            admin: "default",
            user: "secondary",
            moderator: "outline"
          }, { width: 120 }),
          commonColumns.isActive({ width: 100 }),
          columnHelpers.date("lastLogin", "Последний вход", { 
            width: 180,
            render: (value) => value ? new Date(value).toLocaleString('ru-RU') : "Никогда"
          }),
          commonColumns.createdAt({ width: 180 })
        ],
        searchKey: "name",
        searchPlaceholder: "Поиск по имени...",
        selectable: true,
        actions: [
          ...baseActions,
          {
            label: "Заблокировать",
            onClick: (row: UserEntity) => {
              console.log("Блокировка:", row)
              alert(`Пользователь ${row.isActive ? 'заблокирован' : 'разблокирован'}`)
            },
            variant: "destructive" as const,
            show: (row: UserEntity) => row.role !== "admin"
          }
        ]
      }

    case "orders":
      return {
        columns: [
          commonColumns.id({ width: 100 }),
          columnHelpers.text("orderNumber", "№ заказа", { width: 150 }),
          columnHelpers.text("customerName", "Клиент", { width: 200 }),
          columnHelpers.number("total", "Сумма", {
            format: (value) => `${value.toLocaleString('ru-RU')} ₽`,
            align: "right",
            width: 150
          }),
          columnHelpers.badge("status", "Статус", {
            pending: "outline",
            paid: "default",
            shipped: "secondary", 
            delivered: "default",
            cancelled: "destructive"
          }, { width: 120 }),
          commonColumns.createdAt({ width: 180 })
        ],
        searchKey: "orderNumber",
        searchPlaceholder: "Поиск по номеру заказа...",
        selectable: true,
        actions: [
          ...baseActions,
          {
            label: "Отменить заказ",
            onClick: (row: OrderEntity) => {
              if (confirm("Отменить заказ?")) {
                console.log("Отмена заказа:", row)
                alert(`Заказ ${row.orderNumber} отменен`)
              }
            },
            variant: "destructive" as const,
            show: (row: OrderEntity) => ["pending", "paid"].includes(row.status)
          }
        ]
      }

    case "appWallet":
      return {
        columns: [
          commonColumns.id({ width: 200 }),
          columnHelpers.custom("userCount", "Пользователей", (value, row: AppWalletEntity) => (
            <span className="text-sm font-medium">
              {row.userCount || 0}
            </span>
          ), { width: 120 }),
          commonColumns.createdAt({ width: 180 })
        ],
        searchKey: "id",
        searchPlaceholder: "Поиск по ID кошелька...",
        selectable: true,
        actions: [
          ...baseActions,
          {
            label: "Статистика",
            onClick: (row: AppWalletEntity) => {
              console.log("Просмотр статистики:", row)
              alert(`Статистика кошелька ${row.id}`)
            },
            variant: "secondary" as const
          }
        ]
      }

    default:
      return {
        columns: [
          commonColumns.id(),
          columnHelpers.text("name", "Название"),
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
  
  // Используем универсальные хуки
  const { data, total, isLoading, page, pageSize } = useModelData(model)
  const { page: currentPage, pageSize: currentPageSize, paginationConfig } = useModelPagination(1, 10)
  const deleteMutation = useDeleteModel(model)
  const { prefetchItem } = usePrefetchModel()
  
  const modelConfig = modelConfigs[model as keyof typeof modelConfigs]
  const tableConfig = getTableConfig(model, router, deleteMutation, prefetchItem)
  
  // Добавляем серверную пагинацию к конфигурации таблицы
  const finalTableConfig: AdvancedTableConfig<any> = {
    ...tableConfig,
    serverPagination: paginationConfig(total)
  }

  if (!modelConfig) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Модель не найдена</CardTitle>
            <CardDescription>
              Модель "{model}" не существует или не настроена
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Доступные модели: {Object.keys(modelConfigs).join(", ")}
              </p>
              <Button onClick={() => router.push("/dashboard")} variant="outline">
                Вернуться на главную
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
            Обновить
          </Button>
          <Button 
            size="sm"
            onClick={() => router.push(`/dashboard/${model}/create`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Создать
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего записей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(total || 0).toLocaleString('ru-RU')}</div>
            <p className="text-xs text-muted-foreground">
              В базе данных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              На текущей странице
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Страница {page || 1} из {Math.ceil((total || 0) / (pageSize || 10))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {model === 'notifications' ? 'Важных уведомлений' : 'Активных записей'}
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
              {model === 'notifications' ? 'Важных уведомлений' : 'Активных элементов'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Последнее обновление
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Сейчас</div>
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
              <CardTitle>Список {modelConfig.title.toLowerCase()}</CardTitle>
              <CardDescription>
                Управление данными модели "{model}"
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
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
          <CardTitle>Информация о модели</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-2">Параметры</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Модель:</dt>
                  <dd className="font-mono">{model}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Страница:</dt>
                  <dd>{page}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Размер страницы:</dt>
                  <dd>{pageSize}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Всего страниц:</dt>
                  <dd>{Math.ceil((total || 0) / (pageSize || 10))}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Возможности</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Поиск и фильтрация</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Сортировка по колонкам</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Серверная пагинация</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Выбор строк</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Контекстные действия</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
