"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"


import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Wallet,
  Calendar,
  Hash,
  DollarSign,
  RefreshCw,
  Check,
  X,
  Copy
} from "lucide-react"
import { 
  useWithdraw,
  useApproveWithdraw,
  useRejectWithdraw,
  type WithdrawEntity
} from "@/shared/hooks/use-withdraws"
import { toast } from "sonner"

export default function WithdrawDetailPage() {
  const params = useParams()
  const router = useRouter()
  const withdrawId = params.id as string

  const [txHashInput, setTxHashInput] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  // Получаем данные вывода
  const { data: withdraw, isLoading, error, refetch } = useWithdraw(withdrawId)

  // Мутации для действий
  const approveWithdraw = useApproveWithdraw()
  const rejectWithdraw = useRejectWithdraw()

  const handleApprove = async () => {
    try {
      await approveWithdraw.mutateAsync({ 
        id: withdrawId, 
        txHash: txHashInput || undefined 
      })
      toast.success("Вывод подтвержден")
      setTxHashInput('')
    } catch (error) {
      toast.error("Ошибка при подтверждении вывода")
    }
  }

  const handleReject = async () => {
    try {
      await rejectWithdraw.mutateAsync({ 
        id: withdrawId, 
        reason: rejectionReason || undefined 
      })
      toast.success("Вывод отклонен, средства возвращены пользователю")
      setRejectionReason('')
    } catch (error) {
      toast.error("Ошибка при отклонении вывода")
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Скопировано в буфер обмена")
  }

  // Утилиты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusBadge = (status: WithdrawEntity['status']) => {
    const variants: Record<string, { variant: "outline", icon: any, className: string, label: string }> = {
      PENDING: { variant: "outline" as const, icon: Clock, className: "text-yellow-600 border-yellow-200", label: "Ожидает обработки" },
      COMPLETED: { variant: "outline" as const, icon: CheckCircle, className: "text-green-600 border-green-200", label: "Завершен" },
      FAILED: { variant: "outline" as const, icon: XCircle, className: "text-red-600 border-red-200", label: "Отклонен" }
    }
    
    const config = variants[status]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-4 h-4 mr-2" />
        {config.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error || !withdraw) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-600 mb-4">Не удалось загрузить данные о выводе</p>
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
      {/* Заголовок с навигацией */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Детали вывода</h1>
          <p className="text-muted-foreground">
            ID: {withdraw.id}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Статус и действия */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Статус операции
                    {getStatusBadge(withdraw.status)}
                  </CardTitle>
                  <CardDescription>
                    Текущее состояние заявки на вывод средств
                  </CardDescription>
                </div>
                {withdraw.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                      disabled={approveWithdraw.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {approveWithdraw.isPending ? 'Подтверждение...' : 'Подтвердить'}
                    </Button>

                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={handleReject}
                      disabled={rejectWithdraw.isPending}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {rejectWithdraw.isPending ? 'Отклонение...' : 'Отклонить'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Детали операции */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Детали операции
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                    <Hash className="w-4 h-4" />
                    ID операции
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {withdraw.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(withdraw.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Валюта</div>
                  <Badge variant="outline" className="font-medium">
                    {withdraw.currency}
                  </Badge>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Сумма</div>
                  <div className="text-2xl font-bold">
                    {withdraw.value.toLocaleString()}
                  </div>
                  {withdraw.equivalentValue && (
                    <div className="text-sm text-muted-foreground">
                      ≈ ${withdraw.equivalentValue.toLocaleString()}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    Дата создания
                  </div>
                  <div>{formatDate(withdraw.createdAt)}</div>
                </div>

                {withdraw.completedAt && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Дата завершения</div>
                    <div>{formatDate(withdraw.completedAt)}</div>
                  </div>
                )}

                {withdraw.txHash && (
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Hash транзакции</div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                        {withdraw.txHash}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(withdraw.txHash!)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель с информацией о пользователе */}
        <div className="space-y-6">
          {/* Информация о пользователе */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Пользователь
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {withdraw.user ? (
                <>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Telegram ID</div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{withdraw.user.tgId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(withdraw.user!.tgId)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border-t my-4"></div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Текущий баланс</div>
                    <div className="text-lg font-semibold">
                      ${withdraw.user.balance?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">ID пользователя</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                        {withdraw.user.id}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(withdraw.user!.id)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Информация о пользователе недоступна
                </div>
              )}
            </CardContent>
          </Card>

          {/* Информация о кошельке */}
          {withdraw.wallet && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Кошелек
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Адрес</div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                      {withdraw.wallet.address}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(withdraw.wallet!.address)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Валюта кошелька</div>
                  <Badge variant="outline">
                    {withdraw.wallet.currency}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}