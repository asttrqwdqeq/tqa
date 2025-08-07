"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import { useCreateModel } from "@/shared/hooks"

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

// Конфигурации форм для разных моделей
const modelConfigs: Record<string, ModelConfig> = {
  notifications: {
    title: "Create notification",
    description: "Create new system notification",
    icon: "📢",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "message", label: "Message", type: "textarea", required: true },
      { key: "isAlert", label: "Important notification", type: "checkbox", defaultValue: false }
    ]
  },
  users: {
    title: "Create user",
    description: "Add new user to the system",
    icon: "👥",
    fields: [
      { key: "username", label: "Username", type: "text", required: true },
      { key: "tgId", label: "Telegram ID", type: "number", required: true },
      { key: "balance", label: "Balance", type: "number", required: true },
      { key: "inviterId", label: "Inviter ID", type: "text", required: false },
    ]
  },
  appWallet: {
    title: "Create App Wallet",
    description: "Create new app wallet in the system",
    icon: "💰",
    fields: [
      { key: "id", label: "Wallet ID", type: "text", required: true }
    ]
  }
}

interface PageProps {
  params: Promise<{ model: string }>
}



export default function CreateModelPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const { model } = resolvedParams
  const router = useRouter()
  
  const modelConfig = modelConfigs[model]
  const createMutation = useCreateModel(model, {
    onSuccess: () => router.push(`/dashboard/${model}`),
  })
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  if (!modelConfig) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Model not found</CardTitle>
            <CardDescription>
              {`Model "${model}" does not exist or is not configured`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Return to main page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const onSubmit = (data: any) => {
    // Преобразуем данные в правильный формат для каждой модели
    const transformedData = transformFormData(model, data)
    
    console.log("Creating record:", transformedData)
    createMutation.mutate(transformedData)
  }
  
  // Функция для преобразования данных формы
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
      case 'users':
        return {
          ...data,
          password: data.password || 'defaultPassword123' // В реальном приложении генерировать пароль
        }
      case 'appWallet':
        return {
          ...data,
          id: data.id || `wallet_${Date.now()}`
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
        
        <Badge variant="outline" className="capitalize">
          {model}
        </Badge>
      </div>

      {/* Форма создания */}
      <Card>
        <CardHeader>
          <CardTitle>Main information</CardTitle>
          <CardDescription>
            Fill in all required fields to create a new record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {modelConfig.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
                  {(field.type === "text" || field.type === "email") && (
                    <Input
                      id={field.key}
                      type={field.type}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      {...register(field.key, { required: field.required })}
                    />
                  )}
                  
                  {field.type === "number" && (
                    <Input
                      id={field.key}
                      type="number"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      step="0.01"
                      {...register(field.key, { 
                        required: field.required,
                        valueAsNumber: true 
                      })}
                    />
                  )}
                  
                  {field.type === "textarea" && (
                    <textarea
                      id={field.key}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...register(field.key, { required: field.required })}
                    />
                  )}
                  
                  {field.type === "select" && field.options && (
                    <select
                      id={field.key}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...register(field.key, { required: field.required })}
                    >
                      <option value="">Select {field.label.toLowerCase()}</option>
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
                        defaultChecked={field.defaultValue}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2"
                        {...register(field.key)}
                      />
                      <label htmlFor={field.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {field.label}
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Кнопки действий */}
            <div className="flex items-center gap-4 pt-6 border-t">
              <Button 
                type="submit" 
                className="min-w-32"
                disabled={createMutation.isPending || isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push(`/dashboard/${model}`)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              
              <div className="ml-auto text-sm text-muted-foreground">
                * Required fields
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Справочная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Creating record:</strong> {`After filling in all required fields, click "Create" to save the new record in the database.`}
            </p>
            <p>
              <strong>Validation:</strong> {`All fields are checked for correctness. Make sure the entered information meets the requirements.`}
            </p>
            <p>
              <strong>Cancel:</strong> {`You can cancel the creation of a record at any time by clicking the "Cancel" or "Back" button.`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
