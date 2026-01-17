/**
 * Settings Module - Export all setting types and utilities
 */

// Types
export type {
    SettingOptionType,
    SettingChangeEvent,
    SettingChangeHandler,
    BaseSettingConfig,
    SelectOption,
    SelectSettingConfig,
    MultiSelectSettingConfig,
    NumberSettingConfig,
    StringFormat,
    StringSettingConfig,
    SerializableSetting,
} from './types';

// Base class
export { BaseSetting } from './base';

// Setting types
export { BooleanSetting, type BooleanSettingConfig } from './boolean';
export { SelectSetting } from './select';
export { MultiSelectSetting } from './multi-select';
export { NumberSetting } from './number';
export { StringSetting } from './string';
