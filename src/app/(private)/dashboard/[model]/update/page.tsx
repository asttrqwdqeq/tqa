"use client"

import { use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Save, X, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useEffect } from "react"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import { Alert, AlertDescription } from "@/shared/components/ui/alert"
import { 
  useModelItem,
  useUpdateModel,
  useDeleteModel,
  useUpdateNotification,
  useUpdateUser,
  useUpdateOrder,
  useDeleteNotification,
  useDeleteUser,
  useDeleteOrder
} from "@/shared/hooks"

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
    title: "Редактировать уведомление",
    description: "Изменение существующего системного уведомления",
    icon: "📢",
    fields: [
      { key: "title", label: "Заголовок", type: "text", required: true },
      { key: "message", label: "Сообщение", type: "textarea", required: true },
      { key: "isAlert", label: "Важное уведомление", type: "checkbox" }
    ]
  },
  users: {
    title: "Редактировать пользователя",
    description: "Изменение данных существующего пользователя",
    icon: "👥",
    fields: [
      { key: "name", label: "Имя", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "role", label: "Роль", type: "select", required: true, options: [
        { value: "user", label: "Пользователь" },
        { value: "moderator", label: "Модератор" },
        { value: "admin", label: "Администратор" }
      ]},
      { key: "isActive", label: "Активен", type: "checkbox" }
    ]
  },
  appWallet: {
    title: "Edit App Wallet",
    description: "Edit existing app wallet",
    icon: "💰",
    fields: [
      { key: "id", label: "Wallet ID", type: "text", required: true }
    ]
  }
}

// Мок-функция для получения данных записи
function getMockData(model: string, id: string) {
  switch (model) {
    case "notifications":
      return {
        id,
        title: `Уведомление ${id}`,
        message: `Содержание уведомления с ID ${id}. Это важная информация для пользователей системы.`,
        isAlert: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    case "users":
      return {
        id,
        name: `Пользователь ${id}`,
        email: `user${id}@example.com`,
        role: "user",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    case "orders":
      return {
        id,
        orderNumber: `ORD-${id.padStart(6, '0')}`,
        customerName: `Клиент ${id}`,
        total: 15000,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    case "appWallet":
      return {
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    default:
      return null
  }
}

interface PageProps {
  params: Promise<{ model: string }>
}

// Хуки для получения правильных мутаций
function useUpdateMutation(model: string, router: any) {
  const universalUpdate = useUpdateModel(model, {
    onSuccess: () => router.push(`/dashboard/${model}`),
    showToast: true
  })
  
  const notificationUpdate = useUpdateNotification({
    onSuccess: () => router.push(`/dashboard/${model}`)
  })
  
  const userUpdate = useUpdateUser({
    onSuccess: () => router.push(`/dashboard/${model}`)
  })
  
  const orderUpdate = useUpdateOrder({
    onSuccess: () => router.push(`/dashboard/${model}`)
  })
  
  switch (model) {
    case 'notifications':
      return notificationUpdate
    case 'users':
      return userUpdate
    case 'orders':
      return orderUpdate
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
  
  const orderDelete = useDeleteOrder({
    onSuccess: () => router.push(`/dashboard/${model}`)
  })
  
  switch (model) {
    case 'notifications':
      return notificationDelete
    case 'users':
      return userDelete
    case 'orders':
      return orderDelete
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
  
  const modelConfig = modelConfigs[model]
  
  // Используем универсальные хуки
  const { data: apiData, isLoading   } = useModelItem(model, id || '', {
    enabled: !!id
  })
  const updateMutation = useUpdateMutation(model, router)
  const deleteMutation = useDeleteMutation(model, router)
  
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm()
  
  // Заполняем форму данными при загрузке
  useEffect(() => {
    if (apiData) {
      reset(apiData)
    }
  }, [apiData, reset])
  
  // Fallback на мок-данные
  const data = apiData || (id ? getMockData(model, id) : null)

  if (!modelConfig) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Модель не найдена</CardTitle>
            <CardDescription>
              {`Модель "${model}" не существует или не настроена`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Вернуться на главную
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
            <CardTitle className="text-red-600">ID не указан</CardTitle>
            <CardDescription>
              Для редактирования необходимо указать ID записи
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/dashboard/${model}`)} variant="outline">
              К списку {model}
            </Button>
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
            <CardTitle className="text-red-600">Запись не найдена</CardTitle>
            <CardDescription>
              {`Запись с ID "${id}" не существует`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push(`/dashboard/${model}`)} variant="outline">
              К списку {model}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onSubmit = (formData: any) => {
    if (!id) return
    
    // Преобразуем данные в правильный формат
    const transformedData = transformFormData(model, formData)
    
    console.log("Обновление записи:", { id, ...transformedData })
    updateMutation.mutate({ id, data: transformedData })
  }

  const handleDelete = () => {
    if (!id) return
    
    if (confirm(`Вы уверены, что хотите удалить эту запись?`)) {
      console.log("Удаление записи:", id)
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
      case 'orders':
        return {
          ...data,
          total: parseFloat(data.total) || 0
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
              Назад
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
          {`Вы редактируете запись "${model}" с ID "${id}".`}
          {`Изменения будут сохранены только после нажатия кнопки "Сохранить".`}
        </AlertDescription>
      </Alert>

      {/* Форма редактирования */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
          <CardDescription>
            {`Измените необходимые поля и нажмите "Сохранить" для применения изменений`}
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
                      {field.readonly && <span className="text-muted-foreground ml-1">(только чтение)</span>}
                    </Label>
                    
                    {(field.type === "text" || field.type === "email") && (
                      <Input
                        id={field.key}
                        type={field.type}
                        placeholder={`Введите ${field.label.toLowerCase()}`}
                        readOnly={field.readonly}
                        {...register(field.key, { required: field.required })}
                      />
                    )}
                    
                    {field.type === "number" && (
                      <Input
                        id={field.key}
                        type="number"
                        placeholder={`Введите ${field.label.toLowerCase()}`}
                        step="0.01"
                        readOnly={field.readonly}
                        {...register(field.key, { 
                          required: field.required,
                          valueAsNumber: true 
                        })}
                      />
                    )}
                    
                    {field.type === "textarea" && (
                      <textarea
                        id={field.key}
                        placeholder={`Введите ${field.label.toLowerCase()}`}
                        readOnly={field.readonly}
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...register(field.key, { required: field.required })}
                      />
                    )}
                    
                    {field.type === "select" && field.options && (
                      <select
                        id={field.key}
                        disabled={field.readonly}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...register(field.key, { required: field.required })}
                      >
                        <option value="">Выберите {field.label.toLowerCase()}</option>
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
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
                {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push(`/dashboard/${model}`)}
                disabled={updateMutation.isPending || deleteMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Отмена
              </Button>
              
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleDelete}
                className="ml-auto"
                disabled={deleteMutation.isPending || updateMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Метаданные записи */}
      <Card>
        <CardHeader>
          <CardTitle>Метаданные</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-2">Информация о записи</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ID:</dt>
                  <dd className="font-mono">{data.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Создано:</dt>
                  <dd>{new Date(data.createdAt).toLocaleString('ru-RU')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Обновлено:</dt>
                  <dd>{data.updatedAt ? new Date(data.updatedAt).toLocaleString('ru-RU') : 'Не указано'}</dd>
                </div>
                {(data as any).createdBy && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Создал:</dt>
                    <dd>{(data as any).createdBy}</dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Действия</h4>
              <div className="space-y-2 text-sm">
                <button 
                  onClick={() => navigator.clipboard.writeText(data.id)}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  📋 Скопировать ID
                </button>
                <button 
                  onClick={() => window.print()}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  🖨️ Печать
                </button>
                <button 
                  onClick={() => console.log("История изменений")}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  📜 История изменений
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
