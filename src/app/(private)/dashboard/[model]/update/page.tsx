"use client"

import { use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Save, X, Trash2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@/shared/components/ui"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { 
  useModelItem,
  useUpdateModel,
  useDeleteModel,
  useUpdateNotification,
  useUpdateUser,
  useDeleteNotification,
  useDeleteUser,
} from "@/shared/hooks"
import { useUserReferrals } from "@/entities/user/hooks/use-users"
import { usersApi } from "@/shared/api/users"
import { useQueryClient } from "@tanstack/react-query"

// Типы для полей формы
interface FormField {
  key: string
  label: string
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox"
  required?: boolean
  readonly?: boolean
  defaultValue?: any
  options?: { value: string; label: string }[]
}

interface ModelConfig {
  title: string
  description: string
  icon: string
  fields: FormField[]
}

// Конфигурации форм для разных моделей (те же что и в create)
const modelConfigs: Record<string, ModelConfig> = {
  notifications: {
    title: "Edit notification",
    description: "Edit existing notification",
    icon: "📢",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "message", label: "Message", type: "textarea", required: true },
      { key: "isAlert", label: "Important notification", type: "checkbox" }
    ]
  },
  users: {
    title: "Edit user",
    description: "Edit existing user",
    icon: "👥",
    fields: [
      { key: "username", label: "Username", type: "text", required: true },
      { key: "tgId", label: "Telegram ID", type: "text", required: true },
      { key: "balance", label: "Balance", type: "number", required: true },
      { key: "vipLevelId", label: "VIP level", type: "number", required: true },
      { key: "inviterId", label: "Inviter ID", type: "text", required: false },
      { key: "appWalletId", label: "App Wallet ID", type: "text", required: true },
    ]
  },
  appWallet: {
    title: "Edit App Wallet",
    description: "Edit existing app wallet",
    icon: "💰",
    fields: [
      { key: "id", label: "Wallet ID", type: "text", required: true },
      { 
        key: "currency", 
        label: "Currency", 
        type: "select", 
        required: true,
        options: [
          { value: "TON", label: "TON" },
          { value: "USDT", label: "USDT" },
          { value: "USDC", label: "USDC" },
        ]
      }
    ]
  }
}

interface PageProps {
  params: Promise<{ model: string }>
}

// Хуки для получения правильных мутаций
function useUpdateMutation(model: string, router: any, currentId?: string) {
  const queryClient = useQueryClient()
  
  const onSuccessWithCacheInvalidation = (data: any, variables?: any) => {
    console.log(`🔄 Update success for ${model}:`, { data, variables })
    
    // Принудительно инвалидируем весь кэш для этой модели
    queryClient.invalidateQueries({ queryKey: [model] })
    
    // Дополнительно инвалидируем конкретную запись (используем id из URL если variables нет)
    const recordId = variables?.id || currentId
    if (recordId) {
      queryClient.removeQueries({ queryKey: [model, 'detail', recordId] })
      console.log(`🗑️ Removed cache for ${model} detail:`, recordId)
    }
    
    // Переходим на список
    router.push(`/dashboard/${model}`)
  }
  
  const onSuccessSimple = (data: any) => onSuccessWithCacheInvalidation(data)
  
  const universalUpdate = useUpdateModel(model, {
    onSuccess: onSuccessWithCacheInvalidation,
    showToast: true
  })
  
  const notificationUpdate = useUpdateNotification({
    onSuccess: onSuccessSimple
  })
  
  const userUpdate = useUpdateUser({
    onSuccess: onSuccessSimple
  })
  
  switch (model) {
    case 'notifications':
      return notificationUpdate
    case 'users':
      return userUpdate
    default:
      return universalUpdate
  }
}

function useDeleteMutation(model: string, router: any) {
  const universalDelete = useDeleteModel(model, {
    onSuccess: () => router.push(`/dashboard/${model}`),
    showToast: true
  })
  
  const notificationDelete = useDeleteNotification({
    onSuccess: () => router.push(`/dashboard/${model}`)
  })
  
  const userDelete = useDeleteUser({
    onSuccess: () => router.push(`/dashboard/${model}`)
  })
  
  switch (model) {  
    case 'notifications':
      return notificationDelete
    case 'users':
      return userDelete
    default:
      return universalDelete
  }
}

export default function UpdateModelPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const { model } = resolvedParams
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const queryClient = useQueryClient()
  
  const modelConfig = modelConfigs[model]
  
  // Принудительно инвалидируем кэш при входе на страницу редактирования
  useEffect(() => {
    if (id && model) {
      console.log(`🔄 Force invalidating cache for ${model}:${id}`)
      queryClient.invalidateQueries({ queryKey: [model, 'detail', id] })
    }
  }, [id, model, queryClient])
  
  // Используем универсальные хуки с принудительным обновлением данных
  const { data: apiData, isLoading } = useModelItem(model, id || '', {
    enabled: !!id,
    staleTime: 0, // Данные всегда считаются устаревшими - перезагружаем при каждом обновлении
  })
  const updateMutation = useUpdateMutation(model, router, id || undefined)
  const deleteMutation = useDeleteMutation(model, router)
  
  const { register, handleSubmit, formState: { isSubmitting }, reset, control } = useForm()
  
  // Простая загрузка данных в форму при каждом обновлении
  useEffect(() => {
    console.log('📊 Form effect triggered:', { 
      hasApiData: !!apiData, 
      hasModelConfig: !!modelConfig, 
      isLoading,
      id,
      model 
    })
    
    if (apiData && modelConfig && !isLoading) {
      // Извлекаем только те поля, которые определены в конфигурации
      const formData: any = {}
      const dataRecord = apiData as any
      
      modelConfig.fields.forEach(field => {
        if (dataRecord[field.key] !== undefined) {
          formData[field.key] = dataRecord[field.key]
        }
      })
      
      console.log(`🔄 Loading form data for ${model}:${id}:`, formData)
      console.log('📦 Raw API data:', apiData)
      reset(formData)
    } else {
      console.log('⏳ Waiting for data...')
    }
  }, [apiData, modelConfig, isLoading, reset, id, model])
  
  // Fallback на мок-данные
  const data = apiData

  if (!modelConfig) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Model not found</CardTitle>
            <CardDescription>
              {`Model "${model}" not found or not configured`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!id) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">ID not specified</CardTitle>
            <CardDescription>
              For editing, you need to specify the record ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/dashboard/${model}`)} variant="outline">
              Back to {model} list
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Показываем индикатор загрузки
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Loading record data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Record not found</CardTitle>
            <CardDescription>
              {`Record with ID "${id}" not found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/dashboard/${model}`)} variant="outline">
              Back to {model} list
            </Button>
          </CardContent>
        </Card> 
      </div>
    )
  }

  const onSubmit = (formData: any) => {
    if (!id || !modelConfig) return
    
    // Извлекаем только те поля, которые определены в конфигурации
    const filteredData: any = {}
    modelConfig.fields.forEach(field => {
      if (formData[field.key] !== undefined) {
        filteredData[field.key] = formData[field.key]
      }
    })
    
    // Преобразуем данные в правильный формат
    const transformedData = transformFormData(model, filteredData)
    
    console.log("📤 Updating record with filtered data:", { id, data: transformedData })
    updateMutation.mutate({ id, data: transformedData })
  }

  const handleDelete = () => {
    if (!id) return
    
    if (confirm(`Are you sure you want to delete this record?`)) {
      console.log("Deleting record:", id)
      deleteMutation.mutate(id)
    }
  }
  
  // Функция для преобразования данных формы (та же что и в create)
  const transformFormData = (model: string, data: any) => {
    // Преобразуем checkbox значения
    Object.keys(data).forEach(key => {
      if (data[key] === 'on') {
        data[key] = true
      } else if (data[key] === '') {
        data[key] = false
      }
    })
    
    // Специфичные преобразования для разных моделей
    switch (model) {
      case 'users':
        return {
          ...data,
          inviterId: (data.inviterId === '' || data.inviterId === false) ? null : data.inviterId,
        }
      case 'appWallet':
        return {
          ...data,
          id: data.id || id
        }
      default:
        return data
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/dashboard/${model}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
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
          <Badge variant="secondary">
            ID: {id}
          </Badge>
        </div>
      </div>

      {/* Информация о записи */}
      <Alert>
        <AlertDescription>
          {`You are editing the record "${model}" with ID "${id}".`}
          {`Changes will be saved only after clicking the "Save" button.`}
        </AlertDescription>
      </Alert>

      {/* Форма редактирования */}
      <Card>
        <CardHeader>
          <CardTitle>Main information</CardTitle>
          <CardDescription>
            {`Change the necessary fields and click "Save" to apply changes`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {modelConfig.fields.map((field) => {
                return (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                      {field.readonly && <span className="text-muted-foreground ml-1">(readonly)</span>}
                    </Label>
                    
                    {(field.type === "text" || field.type === "email") && (
                      <Input
                        id={field.key}
                        type={field.type}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        readOnly={field.readonly}
                        {...register(field.key, { required: field.required })}
                      />
                    )}
                    
                    {field.type === "number" && (
                      <Input
                        id={field.key}
                        type="number"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        step="0.01"
                        readOnly={field.readonly}
                        {...register(field.key, { 
                          required: field.required,
                          valueAsNumber: true 
                        })}
                      />
                    )}
                    
                    {field.type === "textarea" && (
                      <Textarea
                        id={field.key}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        readOnly={field.readonly}
                        {...register(field.key, { required: field.required })}
                      />
                    )}
                    
                    {field.type === "select" && field.options && (
                      <Controller
                        name={field.key}
                        control={control}
                        rules={{ required: field.required }}
                        defaultValue={field.defaultValue || ''}
                        render={({ field: controllerField }) => (
                          <Select
                            key={String(controllerField.value ?? field.defaultValue ?? '')}
                            value={(controllerField.value ?? (field.defaultValue ?? '')) as string}
                            onValueChange={controllerField.onChange}
                            disabled={field.readonly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            )) || []}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                    
                    {field.type === "checkbox" && (
                      <div className="flex items-center space-x-2">
                        <input
                          id={field.key}
                          type="checkbox"
                          disabled={field.readonly}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                          {...register(field.key)}
                        />
                        <label htmlFor={field.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {field.label}
                        </label>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <Button 
                type="submit" 
                className="min-w-32"
                disabled={updateMutation.isPending || isSubmitting || isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push(`/dashboard/${model}`)}
                disabled={updateMutation.isPending || deleteMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>


              {model === 'users' && (data as any)?.inviterId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/dashboard/users/update?id=${(data as any).inviterId}`)}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                >
                  Go to inviter
                </Button>
              )}

              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDelete}
                className="ml-auto"
                disabled={deleteMutation.isPending || updateMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Метаданные записи */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-2">Record information</h4>
              <dl className="space-y-1 text-sm">  
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ID:</dt>
                  <dd className="font-mono">{data.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Created:</dt>
                  <dd>{new Date(data.createdAt).toLocaleString('ru-RU')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Updated:</dt>
                  <dd>{data.updatedAt ? new Date(data.updatedAt).toLocaleString('ru-RU') : 'Not specified'}</dd>
                </div>
                {(data as any).createdBy && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Created by:</dt>
                    <dd>{(data as any).createdBy}</dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Actions</h4>
              <div className="space-y-2 text-sm">
                <button 
                  onClick={() => navigator.clipboard.writeText(data.id)}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  📋 Copy ID
                </button>
                <button 
                  onClick={() => window.print()}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  🖨️ Print
                </button>
                <button 
                  onClick={() => console.log("Change history")}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  📜 Change history
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {model === 'users' && id && (
        <Card>
          <CardHeader>
            <CardTitle>Referrals</CardTitle>
            <CardDescription>User's latest referrals with search</CardDescription>
          </CardHeader>
          <CardContent>
            <UserReferralsTable userId={id} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function UserReferralsTable({ userId }: { userId: string }) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch all pages (client-side search only)
  useEffect(() => {
    let canceled = false;
    async function loadAll() {
      setLoading(true);
      setError(null);
      try {
        const limit = 100; // backend hard cap
        let offset = 0;
        let total = Infinity;
        const combined: any[] = [];

        while (!canceled && combined.length < total) {
          const res = await usersApi.getUserReferrals(userId, { limit, offset });
          if (!res.success) break;
          const { referrals, total: t, count } = res.data;
          total = t;
          combined.push(...referrals);
          if (count < limit) break;
          offset += limit;
        }

        if (!canceled) {
          setAll(combined);
        }
      } catch (e: any) {
        if (!canceled) setError(e?.message || 'Failed to load referrals');
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    loadAll();
    return () => {
      canceled = true;
    };
  }, [userId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter((r: any) =>
      r.id.toLowerCase().includes(q) ||
      r.tgId.toLowerCase().includes(q) ||
      (r.username ? r.username.toLowerCase().includes(q) : false)
    );
  }, [all, search]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="max-w-sm">
          <Input
            placeholder="Search by id, tgId, username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" /> Loading referrals…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="max-w-sm">
          <Input
            placeholder="Search by id, tgId, username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (!all || all.length === 0) {
    return (
      <div className="space-y-3">
        <div className="max-w-sm">
          <Input
            placeholder="Search by id, tgId, username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">No referrals</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-x-auto">
      <div className="max-w-sm">
        <Input
          placeholder="Search by id, tgId, username"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="py-2 pr-3">ID</th>
            <th className="py-2 pr-3">TG</th>
            <th className="py-2 pr-3">Username</th>
            <th className="py-2 pr-3">Balance</th>
            <th className="py-2 pr-3">VIP</th>
            <th className="py-2 pr-3">Operations</th>
            <th className="py-2 pr-3">Wave</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">Registered</th>
            <th className="py-2 pr-3">Last activity</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r: any) => (
            <tr
              key={r.id}
              className="border-t hover:bg-muted/40 cursor-pointer"
              onClick={() => window.location.assign(`/dashboard/users/update?id=${r.id}`)}
            >
              <td className="py-2 pr-3 font-mono text-xs">{r.id}</td>
              <td className="py-2 pr-3">{r.tgId}</td>
              <td className="py-2 pr-3">{r.username || '-'}</td>
              <td className="py-2 pr-3">{r.balance}</td>
              <td className="py-2 pr-3">{r.vipLevel}</td>
              <td className="py-2 pr-3">{r.operationsCount}</td>
              <td className="py-2 pr-3">{r.wave}</td>
              <td className="py-2 pr-3 capitalize">{r.status}</td>
              <td className="py-2 pr-3">{new Date(r.createdAt).toLocaleString('en-US')}</td>
              <td className="py-2 pr-3">{r.lastActivityAt ? new Date(r.lastActivityAt).toLocaleString('en-US') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
