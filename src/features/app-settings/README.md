# App Settings Feature (Admin Panel)

Модуль для управления настройками приложения через админскую панель.

## 📁 Структура

```
app-settings/
├── types.ts              # TypeScript типы
├── hooks.ts              # React Query хуки
├── utils.ts              # Утилиты для форматирования и валидации
├── index.ts              # Экспорты
└── README.md             # Документация
```

## 🎯 Назначение

Модуль предоставляет интерфейс для администраторов для:
- Просмотра всех настроек приложения
- Редактирования настроек в режиме реального времени
- Валидации изменений
- Экспорта/импорта настроек
- Сброса к дефолтным значениям

## 🔗 API Integration

Подключается к backend эндпоинтам:
- `GET /app-settings/admin` - получение настроек
- `PUT /app-settings/admin` - обновление настроек
- `POST /app-settings/admin/initialize` - инициализация дефолтными значениями
- `GET /app-settings/admin/schema` - получение схемы настроек

## 🚀 Использование

### Основной компонент

Страница управления настройками находится по адресу: `/dashboard/app-settings`

### Хуки

```typescript
import { 
  useAppSettingsManager,
  useAppSettings,
  useUpdateAppSettings,
  useInitializeAppSettings 
} from '@/features/app-settings'

// Основной хук
const { 
  settings, 
  isLoading, 
  updateSettings, 
  initializeSettings 
} = useAppSettingsManager()

// Отдельные хуки
const { data: settings } = useAppSettings()
const updateMutation = useUpdateAppSettings()
const initializeMutation = useInitializeAppSettings()
```

### Утилиты

```typescript
import { 
  formatSettingValue,
  getSettingDisplayName,
  validateSettingValue,
  exportSettings,
  importSettings 
} from '@/features/app-settings'

// Форматирование значений
formatSettingValue('registrationBonus', 5) // '$5.00'
formatSettingValue('quantBonusMultiplierFirstWave', 0.12) // '12.0%'

// Названия настроек
getSettingDisplayName('registrationBonus') // 'Бонус регистрации'

// Валидация
validateSettingValue('registrationBonus', -5) // 'Минимальное значение: 0'

// Экспорт/импорт
const json = exportSettings(settings)
const imported = importSettings(jsonString)
```

## 📊 Группировка настроек

Настройки разделены на категории:

### 1. Реферальные бонусы
- `quantBonusMultiplierFirstWave` - Бонус рефералов 1-й волны (%)
- `quantBonusMultiplierSecondWave` - Бонус рефералов 2-й волны (%)
- `quantBonusMultiplierThirdWave` - Бонус рефералов 3-й волны (%)

### 2. Бонусы
- `registrationBonus` - Бонус регистрации ($)
- `depositBonusFixed` - Бонус за депозит ($)

### 3. Лимиты
- `depositTriggerLimit` - Мин. депозит для бонуса ($)
- `minWithdrawAmount` - Мин. сумма вывода ($)

## 🎛️ Валидация

Каждая настройка имеет ограничения:

```typescript
const APP_SETTINGS_VALIDATION = {
  quantBonusMultiplierFirstWave: { min: 0, max: 1 },      // 0-100%
  quantBonusMultiplierSecondWave: { min: 0, max: 1 },     // 0-100%
  quantBonusMultiplierThirdWave: { min: 0, max: 1 },      // 0-100%
  registrationBonus: { min: 0, max: 1000 },               // $0-1000
  depositBonusFixed: { min: 0, max: 10000 },              // $0-10000
  depositTriggerLimit: { min: 1, max: 100000 },           // $1-100000
  minWithdrawAmount: { min: 1, max: 10000 },              // $1-10000
}
```

## 🔄 Состояния

Компонент обрабатывает различные состояния:

- **Loading** - Загрузка настроек
- **Error** - Ошибка загрузки
- **Empty** - Настройки не найдены
- **Editing** - Режим редактирования
- **Saving** - Сохранение изменений
- **Success** - Успешное сохранение

## 🎨 UI Компоненты

Использует shadcn/ui компоненты:
- `Card` - Основные контейнеры
- `Button` - Кнопки действий
- `Input` - Поля ввода
- `Label` - Подписи
- `Badge` - Индикаторы состояния
- `toast` - Уведомления

## 🔒 Безопасность

- Все запросы требуют административную авторизацию
- Валидация на клиенте и сервере
- Логирование всех изменений
- Подтверждение критических действий

## 📝 Примеры

### Быстрое обновление настройки

```typescript
const updateMutation = useUpdateAppSettings()

const handleQuickUpdate = async () => {
  try {
    await updateMutation.mutateAsync({
      registrationBonus: 10
    })
    toast({ title: "Настройка обновлена" })
  } catch (error) {
    toast({ title: "Ошибка", variant: "destructive" })
  }
}
```

### Массовое обновление

```typescript
const handleBulkUpdate = async () => {
  const updates = {
    registrationBonus: 10,
    depositBonusFixed: 25,
    minWithdrawAmount: 50
  }
  
  await updateMutation.mutateAsync(updates)
}
```

### Сброс к дефолтным значениям

```typescript
const initializeMutation = useInitializeAppSettings()

const handleReset = async () => {
  if (confirm('Сбросить все настройки?')) {
    await initializeMutation.mutateAsync()
  }
}
```

## 🚀 Доступ

Страница доступна по адресу: `/dashboard/app-settings`

Ссылка добавлена на главную страницу dashboard с иконкой ⚙️ и названием "App Settings".

## ⚡ Performance

- Кеширование данных на 5 минут
- Оптимистичные обновления
- Дебоунс для поиска
- Ленивая валидация

## 🔧 Конфигурация

Настройки берутся из переменных окружения:
- `NEXT_PUBLIC_API_URL` - URL backend API

## 📱 Responsive

Интерфейс адаптивен и работает на:
- Desktop (1200px+)
- Tablet (768px-1199px)  
- Mobile (до 767px)