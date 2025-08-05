import { 
  AppSettings, 
  UpdateAppSettingsRequest, 
  APP_SETTINGS_VALIDATION, 
  APP_SETTINGS_DESCRIPTIONS,
  APP_SETTINGS_GROUPS,
  DEFAULT_APP_SETTINGS,
  AppSettingsKey 
} from './types';

/**
 * Форматирование значения настройки для отображения
 */
export function formatSettingValue(key: AppSettingsKey, value: number): string {
  // Множители отображаются как проценты
  if (key.includes('Multiplier')) {
    return `${(value * 100).toFixed(1)}%`;
  }
  
  // Денежные значения
  if (key.includes('Bonus') || key.includes('Limit') || key.includes('Amount')) {
    return `$${value.toFixed(2)}`;
  }
  
  return value.toString();
}

/**
 * Получение человекочитаемого названия настройки
 */
export function getSettingDisplayName(key: AppSettingsKey): string {
  const names: Record<AppSettingsKey, string> = {
    quantBonusMultiplierFirstWave: 'Бонус рефералов 1-й волны',
    quantBonusMultiplierSecondWave: 'Бонус рефералов 2-й волны', 
    quantBonusMultiplierThirdWave: 'Бонус рефералов 3-й волны',
    registrationBonus: 'Бонус регистрации',
    depositBonusFixed: 'Бонус за депозит',
    depositTriggerLimit: 'Мин. депозит для бонуса',
    minWithdrawAmount: 'Мин. сумма вывода',
  };
  
  return names[key] || key;
}

/**
 * Получение описания настройки
 */
export function getSettingDescription(key: AppSettingsKey): string {
  return APP_SETTINGS_DESCRIPTIONS[key];
}

/**
 * Валидация значения настройки
 */
export function validateSettingValue(key: AppSettingsKey, value: number): string | null {
  const validation = APP_SETTINGS_VALIDATION[key];
  
  if (!validation) {
    return 'Unknown setting';
  }
  
  if (value < validation.min) {
    return `Минимальное значение: ${validation.min}`;
  }
  
  if (value > validation.max) {
    return `Максимальное значение: ${validation.max}`;
  }
  
  return null;
}

/**
 * Проверка изменилась ли настройка
 */
export function hasSettingChanged(
  original: AppSettings | undefined,
  current: Partial<UpdateAppSettingsRequest>,
  key: AppSettingsKey
): boolean {
  if (!original || current[key] === undefined) {
    return false;
  }
  
  return original[key] !== current[key];
}

/**
 * Получение всех измененных настроек
 */
export function getChangedSettings(
  original: AppSettings | undefined,
  current: Partial<UpdateAppSettingsRequest>
): AppSettingsKey[] {
  if (!original) {
    return [];
  }
  
  return Object.keys(current).filter(key => 
    hasSettingChanged(original, current, key as AppSettingsKey)
  ) as AppSettingsKey[];
}

/**
 * Расчет процента изменения настройки
 */
export function calculateSettingChangePercent(
  originalValue: number,
  newValue: number
): number {
  if (originalValue === 0) {
    return newValue === 0 ? 0 : 100;
  }
  
  return ((newValue - originalValue) / originalValue) * 100;
}

/**
 * Сброс настройки к дефолтному значению
 */
export function getDefaultSettingValue(key: AppSettingsKey): number {
  return DEFAULT_APP_SETTINGS[key];
}

/**
 * Проверка является ли значение дефолтным
 */
export function isDefaultValue(key: AppSettingsKey, value: number): boolean {
  return Math.abs(value - DEFAULT_APP_SETTINGS[key]) < 0.001; // Float comparison
}

/**
 * Группировка настроек по категориям
 */
export function groupSettingsByCategory(settings: AppSettings | undefined) {
  if (!settings) {
    return {};
  }
  
  const grouped: Record<string, Array<{ key: AppSettingsKey; value: number }>> = {};
  
  Object.entries(APP_SETTINGS_GROUPS).forEach(([groupKey, group]) => {
    grouped[groupKey] = group.fields.map(field => ({
      key: field,
      value: settings[field],
    }));
  });
  
  return grouped;
}

/**
 * Получение цвета индикатора для настройки
 */
export function getSettingIndicatorColor(
  key: AppSettingsKey,
  value: number
): 'green' | 'yellow' | 'red' | 'gray' {
  const validation = APP_SETTINGS_VALIDATION[key];
  const defaultValue = DEFAULT_APP_SETTINGS[key];
  
  // Если значение дефолтное
  if (isDefaultValue(key, value)) {
    return 'gray';
  }
  
  // Если значение в пределах нормы
  const midPoint = (validation.min + validation.max) / 2;
  const isNearDefault = Math.abs(value - defaultValue) / defaultValue < 0.2; // ±20%
  
  if (isNearDefault) {
    return 'green';
  }
  
  // Если значение близко к границам
  const nearMin = Math.abs(value - validation.min) / (validation.max - validation.min) < 0.1;
  const nearMax = Math.abs(value - validation.max) / (validation.max - validation.min) < 0.1;
  
  if (nearMin || nearMax) {
    return 'red';
  }
  
  return 'yellow';
}

/**
 * Экспорт настроек в JSON
 */
export function exportSettings(settings: AppSettings): string {
  return JSON.stringify(settings, null, 2);
}

/**
 * Импорт настроек из JSON
 */
export function importSettings(jsonString: string): UpdateAppSettingsRequest | null {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Валидируем что это правильный объект настроек
    const validKeys = Object.keys(DEFAULT_APP_SETTINGS);
    const importKeys = Object.keys(parsed).filter(key => validKeys.includes(key));
    
    if (importKeys.length === 0) {
      return null;
    }
    
    const result: UpdateAppSettingsRequest = {};
    
    importKeys.forEach(key => {
      const typedKey = key as AppSettingsKey;
      const value = parsed[key];
      
      if (typeof value === 'number' && !isNaN(value)) {
        result[typedKey] = value;
      }
    });
    
    return result;
    
  } catch (error) {
    console.error('Failed to import settings:', error);
    return null;
  }
}

/**
 * Генерация отчета об изменениях
 */
export function generateChangeReport(
  original: AppSettings,
  updated: AppSettings
): string {
  const changes: string[] = [];
  
  Object.keys(DEFAULT_APP_SETTINGS).forEach(key => {
    const typedKey = key as AppSettingsKey;
    const oldValue = original[typedKey];
    const newValue = updated[typedKey];
    
    if (Math.abs(oldValue - newValue) > 0.001) {
      const changePercent = calculateSettingChangePercent(oldValue, newValue);
      const displayName = getSettingDisplayName(typedKey);
      
      changes.push(
        `${displayName}: ${formatSettingValue(typedKey, oldValue)} → ${formatSettingValue(typedKey, newValue)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%)`
      );
    }
  });
  
  return changes.length > 0 
    ? `Изменения настроек:\n${changes.join('\n')}`
    : 'Настройки не изменились';
}