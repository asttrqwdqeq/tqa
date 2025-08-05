/**
 * TypeScript типы для App Settings (админка)
 */

export interface AppSettings {
  id: string;
  quantBonusMultiplierFirstWave: number;
  quantBonusMultiplierSecondWave: number;
  quantBonusMultiplierThirdWave: number;
  registrationBonus: number;
  depositBonusFixed: number;
  depositTriggerLimit: number;
  minWithdrawAmount: number;
}

export interface UpdateAppSettingsRequest {
  quantBonusMultiplierFirstWave?: number;
  quantBonusMultiplierSecondWave?: number;
  quantBonusMultiplierThirdWave?: number;
  registrationBonus?: number;
  depositBonusFixed?: number;
  depositTriggerLimit?: number;
  minWithdrawAmount?: number;
}

export interface AppSettingsResponse {
  success: boolean;
  data: AppSettings | null;
  message?: string;
}

export interface UpdateAppSettingsResponse extends AppSettingsResponse {
  updatedFields: string[];
}

export interface AppSettingsSchemaField {
  type: 'number';
  description: string;
  default: number;
  validation: string;
}

export interface AppSettingsSchemaResponse {
  success: boolean;
  schema: Record<keyof Omit<AppSettings, 'id'>, AppSettingsSchemaField>;
  message: string;
}

export interface AppSettingsValueResponse {
  success: boolean;
  key: string;
  value: number;
  message: string;
}

// Константы дефолтных значений
export const DEFAULT_APP_SETTINGS: Omit<AppSettings, 'id'> = {
  quantBonusMultiplierFirstWave: 0.12,
  quantBonusMultiplierSecondWave: 0.03,
  quantBonusMultiplierThirdWave: 0.012,
  registrationBonus: 5,
  depositBonusFixed: 15,
  depositTriggerLimit: 100,
  minWithdrawAmount: 30,
};

// Validation rules
export const APP_SETTINGS_VALIDATION = {
  quantBonusMultiplierFirstWave: { min: 0, max: 1 },
  quantBonusMultiplierSecondWave: { min: 0, max: 1 },
  quantBonusMultiplierThirdWave: { min: 0, max: 1 },
  registrationBonus: { min: 0, max: 1000 },
  depositBonusFixed: { min: 0, max: 10000 },
  depositTriggerLimit: { min: 1, max: 100000 },
  minWithdrawAmount: { min: 1, max: 10000 },
} as const;

// Описания полей для UI
export const APP_SETTINGS_DESCRIPTIONS = {
  quantBonusMultiplierFirstWave: 'Множитель бонуса за квант операции рефералов первой волны',
  quantBonusMultiplierSecondWave: 'Множитель бонуса за квант операции рефералов второй волны',
  quantBonusMultiplierThirdWave: 'Множитель бонуса за квант операции рефералов третьей волны',
  registrationBonus: 'Бонус за регистрацию в USD',
  depositBonusFixed: 'Фиксированный бонус за депозит в USD',
  depositTriggerLimit: 'Минимальная сумма депозита для получения бонуса в USD',
  minWithdrawAmount: 'Минимальная сумма для вывода в USD',
} as const;

// Группировка настроек по категориям
export const APP_SETTINGS_GROUPS = {
  referral: {
    title: 'Реферальные бонусы',
    fields: [
      'quantBonusMultiplierFirstWave',
      'quantBonusMultiplierSecondWave',
      'quantBonusMultiplierThirdWave',
    ] as const,
  },
  bonuses: {
    title: 'Бонусы',
    fields: [
      'registrationBonus',
      'depositBonusFixed',
    ] as const,
  },
  limits: {
    title: 'Лимиты',
    fields: [
      'depositTriggerLimit',
      'minWithdrawAmount',
    ] as const,
  },
} as const;

// Utility types
export type AppSettingsKey = keyof Omit<AppSettings, 'id'>;
export type AppSettingsGroup = keyof typeof APP_SETTINGS_GROUPS;