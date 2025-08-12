"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui"
import { Badge } from "@/shared/components/ui/badge"
import { toast } from "sonner"
import { Save, RotateCcw, Download, Upload, Settings, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { 
  useAppSettingsManager,
  formatSettingValue,
  getSettingDisplayName,
  getSettingDescription,
  validateSettingValue,
  getDefaultSettingValue,
  isDefaultValue,
  hasSettingChanged,
  getChangedSettings,
  generateChangeReport,
  exportSettings,
  importSettings,
  APP_SETTINGS_GROUPS,
  type AppSettingsKey,
  type UpdateAppSettingsRequest 
} from "@/features/app-settings"

export default function AppSettingsPage() {
  
  const { 
    settings, 
    isLoading, 
    isError, 
    error, 
    isUpdating, 
    isInitializing,
    updateSettings, 
    initializeSettings,
    refetch 
  } = useAppSettingsManager()

  const [editedSettings, setEditedSettings] = useState<Partial<UpdateAppSettingsRequest>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [activeGroup, setActiveGroup] = useState<keyof typeof APP_SETTINGS_GROUPS>('referral')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState('')

  // Синхронизируем настройки при загрузке
  useEffect(() => {
    if (settings) {
      setEditedSettings({})
      setValidationErrors({})
    }
  }, [settings])

  // Валидация при изменении
  useEffect(() => {
    const errors: Record<string, string> = {}
    
    Object.entries(editedSettings).forEach(([key, value]) => {
      if (typeof value === 'number') {
        const error = validateSettingValue(key as AppSettingsKey, value)
        if (error) {
          errors[key] = error
        }
      }
    })
    
    setValidationErrors(errors)
  }, [editedSettings])

  const handleFieldChange = (key: AppSettingsKey, value: number) => {
    setEditedSettings((prev: Partial<UpdateAppSettingsRequest>) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Fix errors before saving")
      return
    }

    if (Object.keys(editedSettings).length === 0) {
      toast.info("No changes to save")
      return
    }

    try {
      const result = await updateSettings(editedSettings)
      
      if (settings) {
        const report = generateChangeReport(settings, result.data!)
        toast.success(`Settings updated. Changed fields: ${result.updatedFields.length}`)
      }
      
      setEditedSettings({})
    } catch (err) {
      toast.error(`Error saving: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleReset = () => {
    setEditedSettings({})
    setValidationErrors({})
    toast.info("All unsaved changes cancelled")
  }

  const handleResetToDefault = async (key: AppSettingsKey) => {
    const defaultValue = getDefaultSettingValue(key)
    
    try {
      await updateSettings({ [key]: defaultValue })
      toast.success(`"${getSettingDisplayName(key)}" reset to default value`)
    } catch (err) {
      toast.error(`Reset error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleInitialize = async () => {
    try {
      await initializeSettings()
      toast.success("All settings reset to default values")
    } catch (err) {
      toast.error(`Initialization error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleExport = () => {
    if (!settings) return
    
    const exportedData = exportSettings(settings)
    navigator.clipboard.writeText(exportedData)
    toast.success("Settings copied to clipboard")
  }

  const handleImport = () => {
    const imported = importSettings(importData)
    
    if (!imported) {
      toast.error("Invalid data format")
      return
    }
    
    setEditedSettings(imported)
    setShowImportDialog(false)
    setImportData('')
    toast.success("Settings imported. Click 'Save' to apply")
  }

  const getCurrentValue = (key: AppSettingsKey): number => {
    return editedSettings[key] ?? settings?.[key] ?? 0
  }

  const getValueDisplay = (key: AppSettingsKey): string => {
    const value = getCurrentValue(key)
    return formatSettingValue(key, value)
  }

  const hasChanges = Object.keys(editedSettings).length > 0
  const changedKeys = settings ? getChangedSettings(settings, editedSettings) : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error loading settings</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Unknown error'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Repeat
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settings not found</CardTitle>
          <CardDescription>
            Application settings are not initialized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleInitialize} 
            disabled={isInitializing}
            variant="outline"
          >
            {isInitializing ? 'Initialization...' : 'Create default settings'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="w-8 h-8" />
            App Settings
          </h1>
          <p className="text-muted-foreground">
            Application settings management
          </p>
          {hasChanges && (
            <Badge variant="secondary" className="mt-2">
              Changed fields: {changedKeys.length}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowImportDialog(true)} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleInitialize} variant="destructive" size="sm" disabled={isInitializing}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {isInitializing ? 'Reset...' : 'Reset all'}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <Card>
        <CardHeader>
          <div className="flex space-x-4">
            {Object.entries(APP_SETTINGS_GROUPS).map(([key, group]) => (
              <Button
                key={key}
                onClick={() => setActiveGroup(key as keyof typeof APP_SETTINGS_GROUPS)}
                variant={activeGroup === key ? "default" : "ghost"}
                size="sm"
              >
                {group.title}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {APP_SETTINGS_GROUPS[activeGroup].fields.map((key) => {
              const currentValue = getCurrentValue(key)
              const originalValue = settings[key]
              const hasChanged = hasSettingChanged(settings, editedSettings, key)
              const isDefault = isDefaultValue(key, currentValue)
              const error = validationErrors[key]

              return (
                <Card key={key} className={`${hasChanged ? 'border-primary' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {getSettingDisplayName(key)}
                        </CardTitle>
                        {hasChanged && <Badge variant="default">Changed</Badge>}
                        {isDefault && <Badge variant="secondary">Default</Badge>}
                      </div>
                      <Button
                        onClick={() => handleResetToDefault(key)}
                        disabled={isDefault || isUpdating}
                        variant="ghost"
                        size="sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                    <CardDescription>
                      {getSettingDescription(key)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 max-w-xs">
                          <Label htmlFor={key}>Value</Label>
                          <Input
                            id={key}
                            type="number"
                            step={key.includes('Multiplier') ? '0.001' : '1'}
                            value={currentValue}
                            onChange={(e) => handleFieldChange(key, parseFloat(e.target.value) || 0)}
                            className={error ? 'border-destructive' : ''}
                          />
                          {error && (
                            <p className="text-sm text-destructive mt-1">{error}</p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <Label>Display</Label>
                          <div className="font-medium">{getValueDisplay(key)}</div>
                        </div>
                      </div>

                      {hasChanged && (
                        <div className="text-xs text-muted-foreground">
                          Was: {formatSettingValue(key, originalValue)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      {hasChanges && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                You have unsaved changes
              </p>
              <div className="flex items-center gap-2">
                <Button onClick={handleReset} variant="outline" disabled={isUpdating}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isUpdating || Object.keys(validationErrors).length > 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Import settings</CardTitle>
              <CardDescription>
                Paste JSON with settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="import-data">JSON data</Label>
                <Textarea
                  id="import-data"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-32 font-mono"
                  placeholder="{ ... }"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  onClick={() => {
                    setShowImportDialog(false)
                    setImportData('')
                  }} 
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={!importData.trim()}
                >
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}