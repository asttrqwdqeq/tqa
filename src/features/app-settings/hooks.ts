import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosApi } from '@/shared/config/axios';
import { 
  AppSettings, 
  AppSettingsResponse, 
  UpdateAppSettingsRequest, 
  UpdateAppSettingsResponse,
  AppSettingsSchemaResponse,
  AppSettingsValueResponse 
} from './types';
import { useCallback } from 'react';

// API endpoints
const ENDPOINTS = {
  GET: '/app-settings/admin',
  UPDATE: '/app-settings/admin',
  INITIALIZE: '/app-settings/admin/initialize',
  SCHEMA: '/app-settings/admin/schema',
  VALUE: (key: string) => `/app-settings/admin/value/${key}`,
};

// Query keys
const APP_SETTINGS_KEYS = {
  all: ['app-settings'] as const,
  get: () => [...APP_SETTINGS_KEYS.all, 'get'] as const,
  schema: () => [...APP_SETTINGS_KEYS.all, 'schema'] as const,
  value: (key: string) => [...APP_SETTINGS_KEYS.all, 'value', key] as const,
};

/**
 * Хук для получения настроек приложения
 */
export function useAppSettings() {
  return useQuery({
    queryKey: APP_SETTINGS_KEYS.get(),
    queryFn: async (): Promise<AppSettings> => {
      const response = await axiosApi.get<AppSettingsResponse>(ENDPOINTS.GET);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch app settings');
      }
      
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 2,
  });
}

/**
 * Хук для получения схемы настроек
 */
export function useAppSettingsSchema() {
  return useQuery({
    queryKey: APP_SETTINGS_KEYS.schema(),
    queryFn: async () => {
      const response = await axiosApi.get<AppSettingsSchemaResponse>(ENDPOINTS.SCHEMA);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch app settings schema');
      }
      
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 минут (схема редко меняется)
  });
}

/**
 * Хук для получения конкретного значения настройки
 */
export function useAppSettingValue(key: string) {
  return useQuery({
    queryKey: APP_SETTINGS_KEYS.value(key),
    queryFn: async () => {
      const response = await axiosApi.get<AppSettingsValueResponse>(
        ENDPOINTS.VALUE(key)
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || `Failed to fetch setting value: ${key}`);
      }
      
      return response.data;
    },
    enabled: !!key,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

/**
 * Хук для обновления настроек приложения
 */
export function useUpdateAppSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateAppSettingsRequest): Promise<UpdateAppSettingsResponse> => {
      const response = await axiosApi.put<UpdateAppSettingsResponse>(
        ENDPOINTS.UPDATE,
        updateData
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update app settings');
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Обновляем кеш с новыми данными
      if (data.data) {
        queryClient.setQueryData(APP_SETTINGS_KEYS.get(), data.data);
        
        // Инвалидируем связанные запросы
        queryClient.invalidateQueries({ 
          queryKey: APP_SETTINGS_KEYS.all,
          type: 'all'
        });
      }
    },
  });
}

/**
 * Хук для инициализации настроек дефолтными значениями
 */
export function useInitializeAppSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<AppSettingsResponse> => {
      const response = await axiosApi.post<AppSettingsResponse>(
        ENDPOINTS.INITIALIZE
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to initialize app settings');
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Обновляем кеш с новыми данными
      if (data.data) {
        queryClient.setQueryData(APP_SETTINGS_KEYS.get(), data.data);
        
        // Инвалидируем все запросы настроек
        queryClient.invalidateQueries({ 
          queryKey: APP_SETTINGS_KEYS.all 
        });
      }
    },
  });
}

/**
 * Хук для сброса конкретной настройки к дефолтному значению
 */
export function useResetAppSetting() {
  const updateMutation = useUpdateAppSettings();

  return useCallback(
    async (key: keyof UpdateAppSettingsRequest, defaultValue: number) => {
      return updateMutation.mutateAsync({ [key]: defaultValue });
    },
    [updateMutation]
  );
}

/**
 * Комбинированный хук для управления состоянием App Settings
 */
export function useAppSettingsManager() {
  const appSettings = useAppSettings();
  const updateSettings = useUpdateAppSettings();
  const initializeSettings = useInitializeAppSettings();
  const schema = useAppSettingsSchema();

  const isLoading = appSettings.isLoading || updateSettings.isPending || initializeSettings.isPending;
  const isError = appSettings.isError || updateSettings.isError || initializeSettings.isError;
  const error = appSettings.error || updateSettings.error || initializeSettings.error;

  return {
    // Data
    settings: appSettings.data,
    schema: schema.data,
    
    // States
    isLoading,
    isError,
    error,
    isUpdating: updateSettings.isPending,
    isInitializing: initializeSettings.isPending,
    
    // Actions
    updateSettings: updateSettings.mutateAsync,
    initializeSettings: initializeSettings.mutateAsync,
    
    // Utils
    refetch: appSettings.refetch,
    reset: () => {
      appSettings.refetch();
      updateSettings.reset();
      initializeSettings.reset();
    },
  };
}

/**
 * Хук для работы с отдельными полями настроек
 */
export function useAppSettingsField<K extends keyof AppSettings>(fieldName: K) {
  const { settings, updateSettings, isUpdating } = useAppSettingsManager();
  
  const currentValue = settings?.[fieldName];
  
  const updateField = useCallback(
    async (newValue: AppSettings[K]) => {
      if (fieldName === 'id') {
        throw new Error('Cannot update id field');
      }
      
      return updateSettings({
        [fieldName]: newValue,
      } as UpdateAppSettingsRequest);
    },
    [fieldName, updateSettings]
  );

  return {
    value: currentValue,
    updateValue: updateField,
    isUpdating,
    fieldName,
  };
}

/**
 * Хук для валидации значений настроек
 */
export function useAppSettingsValidation() {
  const { schema } = useAppSettingsManager();

  const validateField = useCallback(
    (fieldName: keyof UpdateAppSettingsRequest, value: number): string | null => {
      const fieldSchema = schema?.schema?.[fieldName];
      
      if (!fieldSchema) {
        return 'Unknown field';
      }

      // Базовая валидация на основе схемы
      if (fieldSchema.validation.includes('min: 0') && value < 0) {
        return 'Value must be non-negative';
      }
      
      if (fieldSchema.validation.includes('positive') && value <= 0) {
        return 'Value must be positive';
      }

      return null;
    },
    [schema]
  );

  const validateSettings = useCallback(
    (settings: Partial<UpdateAppSettingsRequest>): Record<string, string> => {
      const errors: Record<string, string> = {};

      Object.entries(settings).forEach(([key, value]) => {
        if (typeof value === 'number') {
          const error = validateField(key as keyof UpdateAppSettingsRequest, value);
          if (error) {
            errors[key] = error;
          }
        }
      });

      return errors;
    },
    [validateField]
  );

  return {
    validateField,
    validateSettings,
    schema: schema?.schema,
  };
}