/**
 * Примеры быстрого использования App Settings хуков
 */

import React from 'react'
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { 
  useAppSettingsManager,
  useAppSettings,
  useUpdateAppSettings,
  formatSettingValue,
  getSettingDisplayName,
  type AppSettingsKey 
} from './index'

/**
 * Компонент для быстрого просмотра настроек
 */
export function QuickSettingsView() {
  const { data: settings, isLoading } = useAppSettings()

  if (isLoading) return <div>Загрузка...</div>
  if (!settings) return <div>Настройки не найдены</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Текущие настройки</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(settings).map(([key, value]) => {
            if (key === 'id') return null
            
            const typedKey = key as AppSettingsKey
            return (
              <div key={key} className="flex justify-between">
                <span className="text-sm">{getSettingDisplayName(typedKey)}:</span>
                <span className="font-medium">{formatSettingValue(typedKey, value)}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Компонент для быстрого редактирования отдельной настройки
 */
interface QuickSettingEditorProps {
  settingKey: AppSettingsKey
  label?: string
}

export function QuickSettingEditor({ settingKey, label }: QuickSettingEditorProps) {
  const { settings, updateSettings, isUpdating } = useAppSettingsManager()
  const [value, setValue] = React.useState<number>(0)

  React.useEffect(() => {
    if (settings?.[settingKey]) {
      setValue(settings[settingKey])
    }
  }, [settings, settingKey])

  const handleSave = async () => {
    try {
      await updateSettings({ [settingKey]: value })
      alert('Настройка обновлена!')
    } catch (error) {
      alert('Ошибка обновления')
    }
  }

  const currentValue = settings?.[settingKey]
  const hasChanges = currentValue !== undefined && currentValue !== value

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">
          {label || getSettingDisplayName(settingKey)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            step={settingKey.includes('Multiplier') ? '0.001' : '1'}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Текущее: {currentValue ? formatSettingValue(settingKey, currentValue) : 'Не задано'}
          </p>
        </div>

        <Button 
          onClick={handleSave}
          disabled={!hasChanges || isUpdating}
          className="w-full"
        >
          {isUpdating ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Компонент для быстрого сброса настроек
 */
export function QuickSettingsReset() {
  const { initializeSettings, isInitializing } = useAppSettingsManager()

  const handleReset = async () => {
    const confirmed = window.confirm(
      'Вы уверены что хотите сбросить все настройки к дефолтным значениям?'
    )
    
    if (!confirmed) return

    try {
      await initializeSettings()
      alert('Настройки сброшены к дефолтным значениям!')
    } catch (error) {
      alert('Ошибка сброса настроек')
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Опасная зона</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleReset}
          disabled={isInitializing}
          variant="destructive"
          className="w-full"
        >
          {isInitializing ? 'Сброс...' : 'Сбросить все настройки'}
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Компонент для отображения статистики изменений
 */
export function SettingsChangeTracker() {
  const { settings } = useAppSettingsManager()
  const [originalSettings, setOriginalSettings] = React.useState<typeof settings>()

  React.useEffect(() => {
    if (settings && !originalSettings) {
      setOriginalSettings(settings)
    }
  }, [settings, originalSettings])

  if (!settings || !originalSettings) {
    return <div>Загрузка статистики...</div>
  }

  const changes = Object.keys(settings).filter(key => {
    if (key === 'id') return false
    const typedKey = key as AppSettingsKey
    return Math.abs(settings[typedKey] - originalSettings[typedKey]) > 0.001
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика изменений</CardTitle>
      </CardHeader>
      <CardContent>
        {changes.length === 0 ? (
          <p className="text-muted-foreground">Настройки не изменялись</p>
        ) : (
          <div className="space-y-2">
            <p className="font-medium">Изменено настроек: {changes.length}</p>
            <ul className="text-sm space-y-1">
              {changes.map(key => {
                const typedKey = key as AppSettingsKey
                const oldValue = originalSettings[typedKey]
                const newValue = settings[typedKey]
                
                return (
                  <li key={key} className="flex justify-between">
                    <span>{getSettingDisplayName(typedKey)}:</span>
                    <span>
                      {formatSettingValue(typedKey, oldValue)} → {formatSettingValue(typedKey, newValue)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Компонент для демонстрации всех возможностей
 */
export function AppSettingsDemo() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">App Settings Demo</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <QuickSettingsView />
        <SettingsChangeTracker />
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <QuickSettingEditor 
          settingKey="registrationBonus" 
          label="Бонус регистрации" 
        />
        <QuickSettingEditor 
          settingKey="minWithdrawAmount" 
          label="Мин. вывод" 
        />
        <QuickSettingsReset />
      </div>
    </div>
  )
}