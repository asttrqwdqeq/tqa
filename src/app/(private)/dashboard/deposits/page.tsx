"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/shared/components/ui/dropdown-menu"
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  RefreshCw, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Calendar,
  Pencil
} from "lucide-react"
import { 
  useDeposits, 
  useDepositStats,
  type DepositEntity,
  type DepositSearchParams 
} from "@/shared/hooks"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

export default function DepositsPage() {
  const router = useRouter()
  
  // Простое состояние - все параметры в одном объекте
  const [params, setParams] = useState<DepositSearchParams>({
    page: 1,
    limit: 20,
    sortOrder: 'desc'
  })

  // Временное состояние для поиска (для немедленного отображения в инпуте)
  const [searchInput, setSearchInput] = useState('')

  // Основные данные
  const { data: deposits, isLoading, error, refetch } = useDeposits(params)
  
  // Статистика
  const { data: stats } = useDepositStats()

  // Обработчики изменения параметров
  const updateParams = (updates: Partial<DepositSearchParams>) => {
    setParams(current => ({
      ...current,
      ...updates,
      page: updates.page || (updates === current ? current.page : 1) // Сброс страницы при изменении фильтров
    }))
  }

  const handleSearch = () => {
    updateParams({ search: searchInput || undefined })
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleViewDeposit = (id: string) => {
    router.push(`/dashboard/deposits/${id}`)
  }

  const handleEditDeposit = (id: string) => {
    router.push(`/dashboard/deposits/${id}/edit`)
  }

  const handleExport = () => {
    toast.success("Экспорт начат")
  }

  // Утилиты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusBadge = (status: DepositEntity['status']) => {
    const variants = {
      PENDING: { variant: "outline" as const, icon: Clock, className: "text-yellow-600 border-yellow-200" },
      COMPLETED: { variant: "outline" as const, icon: CheckCircle, className: "text-green-600 border-green-200" },
      FAILED: { variant: "outline" as const, icon: XCircle, className: "text-red-600 border-red-200" }
    }
    
    const config = variants[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'PENDING' ? 'Ожидает' : status === 'COMPLETED' ? 'Завершен' : 'Отклонен'}
      </Badge>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-600 mb-4">Не удалось загрузить данные</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Депозиты пользователей</h1>
          <p className="text-muted-foreground">
            Управление депозитами пользователей системы
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Статистические карточки */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего депозитов</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDeposits || 0}</div>
            <p className="text-xs text-muted-foreground">
              За все время
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общая сумма</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalAmount?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Средняя: ${stats?.avgAmount?.toFixed(2) || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидают</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.totalPending || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Требуют обработки
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Завершено</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.totalCompleted || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Успешных операций
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Поиск */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ID, пользователю..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-9"
              />
            </div>

            {/* Статус */}
            <select
              value={params.status || ''}
              onChange={(e) => updateParams({ status: e.target.value as DepositEntity['status'] || undefined })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Все статусы</option>
              <option value="PENDING">Ожидает</option>
              <option value="COMPLETED">Завершен</option>
              <option value="FAILED">Отклонен</option>
            </select>

            {/* Валюта */}
            <select
              value={params.currency || ''}
              onChange={(e) => updateParams({ currency: e.target.value as DepositEntity['currency'] || undefined })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Все валюты</option>
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
              <option value="TON">TON</option>
            </select>
          </div>
          
          {/* Кнопка поиска для мобильных устройств */}
          <div className="mt-4 md:hidden">
            <Button onClick={handleSearch} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Найти
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Таблица депозитов */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Список депозитов</CardTitle>
              <CardDescription>
                Найдено {deposits?.total || 0} депозитов
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => updateParams({ sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc' })}
              >
                {params.sortOrder === 'asc' ? '↑' : '↓'} Сортировка
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : deposits?.data.length === 0 ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Депозиты не найдены</h3>
              <p className="text-gray-600">Попробуйте изменить фильтры поиска</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Валюта</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата создания</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits?.data.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell className="font-mono text-sm">
                        {deposit.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {deposit.user?.tgId || 'Неизвестно'}
                          </div>
                          {deposit.userWallet && (
                            <div className="text-sm text-muted-foreground font-mono">
                              {deposit.userWallet.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {deposit.value.toLocaleString()}
                        </div>
                        {deposit.equivalentValue && (
                          <div className="text-sm text-muted-foreground">
                            ≈ ${deposit.equivalentValue.toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {deposit.currency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(deposit.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(deposit.createdAt)}
                        </div>
                        {deposit.completedAt && (
                          <div className="text-xs text-muted-foreground">
                            Завершен: {formatDate(deposit.completedAt)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDeposit(deposit.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditDeposit(deposit.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Редактировать
                            </DropdownMenuItem>
                            {deposit.txHash && (
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(deposit.txHash!)}>
                                <Calendar className="mr-2 h-4 w-4" />
                                Копировать TX
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Пагинация */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Показано {((params.page || 1) - 1) * (params.limit || 20) + 1}-
                  {Math.min((params.page || 1) * (params.limit || 20), deposits?.total || 0)} из {deposits?.total || 0}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(params.page || 1) <= 1}
                    onClick={() => updateParams({ page: (params.page || 1) - 1 })}
                  >
                    Предыдущая
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Страница</span>
                    <Badge variant="outline">{params.page || 1}</Badge>
                    <span className="text-sm">из {Math.ceil((deposits?.total || 0) / (params.limit || 20))}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(deposits?.total || 0) <= (params.page || 1) * (params.limit || 20)}
                    onClick={() => updateParams({ page: (params.page || 1) + 1 })}
                  >
                    Следующая
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}