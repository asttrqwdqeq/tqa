"use client"

import { use } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { 
  ArrowLeft, 
  Copy, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  DollarSign,
  Hash,
  RefreshCw,
  FileText,
  AlertCircle,
  Pencil
} from "lucide-react"
import { useDeposit, useDeleteModel, type DepositEntity } from "@/shared/hooks"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DepositDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  
  const { data: deposit, isLoading, error, refetch } = useDeposit(id, {
    enabled: !!id
  })
  const deleteMutation = useDeleteModel('deposits', {
    onSuccess: () => router.push('/dashboard/deposits')
  })

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} скопирован в буфер обмена`)
  }

  const handleGoBack = () => {
    router.push('/dashboard/deposits')
  }

  const getStatusConfig = (status: DepositEntity['status']) => {
    const configs = {
      PENDING: {
        icon: Clock,
        label: 'Ожидает подтверждения',
        className: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        bgColor: 'bg-card'
      },
      COMPLETED: {
        icon: CheckCircle,
        label: 'Успешно завершен',
        className: 'text-green-600 bg-green-50 border-green-200',
        bgColor: 'bg-card'
      },
      FAILED: {
        icon: XCircle,
        label: 'Отклонен / Ошибка',
        className: 'text-red-600 bg-red-50 border-red-200',
        bgColor: 'bg-card'
      }
    }
    return configs[status]
  }

  const getTypeLabel = (type: DepositEntity['type']) => {
    const labels: Record<DepositEntity['type'], string> = {
      DEPOSIT: 'Депозит',
      WITHDRAW: 'Вывод средств',
      QUANT: 'Квант операция',
      REFERRAL_QUANT_BONUS: 'Реферальный бонус (квант)',
      REFERRAL_DEPOSIT_BONUS: 'Реферальный бонус (депозит)',
      REACH_VIP_LEVEL_BONUS: 'Бонус за достижение VIP уровня',
      LEADERBOARD_BONUS: 'Бонус лидерборда',
      SUPPORT_BONUS: 'Бонус поддержки',
      REGISTRATION_BONUS: 'Бонус за регистрацию'
    }
    return labels[type]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })} ${currency}`
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Попробовать снова
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!deposit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Депозит не найден</h3>
              <p className="text-gray-600">Депозит с ID {id} не существует или был удален</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = getStatusConfig(deposit.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-6">
      {/* Навигация */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Детали операции</h1>
            <p className="text-muted-foreground">ID: {deposit.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/deposits/${id}/edit`)}>
            <Pencil className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (!confirm('Удалить депозит? Действие необратимо.')) return
              deleteMutation.mutate(id)
            }}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Удалить
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Обновить
          </Button>
        </div>
      </div>

      {/* Статус операции */}
      <Card className={statusConfig.bgColor}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${statusConfig.className}`}>
                <StatusIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{statusConfig.label}</h3>
                <p className="text-muted-foreground">
                  {getTypeLabel(deposit.type)}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={statusConfig.className}>
              {deposit.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Финансовая информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Сумма операции</label>
              <div className="text-2xl font-bold">
                {formatCurrency(deposit.value, deposit.currency)}
              </div>
              {deposit.equivalentValue && (
                <div className="text-sm text-muted-foreground">
                  ≈ ${deposit.equivalentValue.toLocaleString('ru-RU')} USD
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Валюта</label>
              <Badge variant="outline">{deposit.currency}</Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Тип операции</label>
              <div className="flex items-center gap-2">
                <Badge variant={deposit.type === 'DEPOSIT' ? 'default' : 'secondary'}>
                  {getTypeLabel(deposit.type)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Пользователь и кошельки */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Информация о пользователе
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">ID пользователя</label>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">{deposit.userId}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(deposit.userId, 'ID пользователя')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {deposit.user?.tgId && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Telegram ID</label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">{deposit.user.tgId}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(deposit.user!.tgId, 'Telegram ID')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {deposit.userWallet && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Кошелек пользователя</label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded break-all">{deposit.userWallet}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(deposit.userWallet!, 'Адрес кошелька')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Технические детали */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Технические детали
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">ID операции</label>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded break-all">{deposit.id}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(deposit.id, 'ID операции')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {deposit.txHash && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Хеш транзакции</label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded break-all">{deposit.txHash}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(deposit.txHash!, 'Хеш транзакции')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://tonapi.io/tx/${deposit.txHash}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {deposit.parentOperationId && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Родительская операция</label>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded break-all">{deposit.parentOperationId}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/deposits/${deposit.parentOperationId}`)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Временные метки */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Временная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Дата создания</label>
              <div className="text-sm">{formatDate(deposit.createdAt)}</div>
            </div>

            {deposit.completedAt && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Дата завершения</label>
                <div className="text-sm">{formatDate(deposit.completedAt)}</div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Время обработки</label>
              <div className="text-sm">
                {deposit.completedAt ? (
                  <>
                    {Math.round((new Date(deposit.completedAt).getTime() - new Date(deposit.createdAt).getTime()) / 1000 / 60)} минут
                  </>
                ) : (
                  <>
                    {Math.round((Date.now() - new Date(deposit.createdAt).getTime()) / 1000 / 60)} минут (в процессе)
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Дополнительные действия */}
      <Card>
        <CardHeader>
          <CardTitle>Действия</CardTitle>
          <CardDescription>
            Дополнительные операции с этим депозитом
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline"
              onClick={() => handleCopy(JSON.stringify(deposit, null, 2), 'Данные операции')}
            >
              <Copy className="w-4 h-4 mr-2" />
              Копировать JSON
            </Button>
            
            {deposit.txHash && (
              <Button 
                variant="outline"
                onClick={() => window.open(`https://tonapi.io/tx/${deposit.txHash}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Открыть в блокчейн-эксплорере
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => router.push(`/dashboard/deposits?userId=${deposit.userId}`)}
            >
              <User className="w-4 h-4 mr-2" />
              Все операции пользователя
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/users/update?id=${deposit.userId}`)}
            >
              <User className="w-4 h-4 mr-2" />
              Перейти к пользователю
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}