// Универсальные хуки для работы с моделями
export * from './use-model-data'

// Типизированные хуки для конкретных моделей
export * from './use-typed-models'

// Специализированные хуки
// Реэкспорт для обратной совместимости
export { 
  useNotifications,
  useNotification, 
  useCreateNotification,
  useUpdateNotification,
  useDeleteNotification,
  useNotificationStats,
  useToggleNotificationAlert
} from './use-typed-models'