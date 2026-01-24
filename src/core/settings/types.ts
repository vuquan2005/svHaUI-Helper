/**
 * Core types and interfaces for the settings system
 */

// ============================================
// Setting Option Types
// ============================================

/**
 * Available setting types
 */
export type SettingOptionType =
    | 'boolean'
    | 'select'
    | 'multi-select'
    | 'number'
    | 'string'
    | 'date'
    | 'time';

// ============================================
// Event Types
// ============================================

/**
 * Event emitted when a setting value changes
 */
export interface SettingChangeEvent<T> {
    /** Setting key that changed */
    key: string;
    /** Previous value */
    oldValue: T;
    /** New value */
    newValue: T;
    /** Timestamp of the change */
    timestamp: number;
}

/**
 * Handler function for setting change events
 */
export type SettingChangeHandler<T> = (event: SettingChangeEvent<T>) => void;

// ============================================
// Configuration Interfaces
// ============================================

/**
 * Base configuration for all settings
 */
export interface BaseSettingConfig<T> {
    /** Unique key for storage and identification */
    key: string;
    /** Display label for UI */
    displayLabel: string;
    /** Description shown in UI */
    displayDescription: string;
    /** Default value when not set */
    defaultValue: T;
}

/**
 * Option for select and multi-select settings
 */
export interface SelectOption<T> {
    /** Option value */
    value: T;
    /** Display label */
    label: string;
    /** Optional description */
    description?: string;
}

/**
 * Configuration for select settings
 */
export interface SelectSettingConfig<T extends string | number> extends BaseSettingConfig<T> {
    /** Available options */
    options: SelectOption<T>[];
}

/**
 * Configuration for multi-select settings
 */
export interface MultiSelectSettingConfig<T extends string | number> extends BaseSettingConfig<
    T[]
> {
    /** Available options */
    options: SelectOption<T>[];
}

/**
 * Configuration for number settings
 */
export interface NumberSettingConfig extends BaseSettingConfig<number> {
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Step for increment/decrement */
    step?: number;
    /** Whether value must be integer */
    integer?: boolean;
}

/**
 * String format types
 */
export type StringFormat = 'text' | 'date' | 'time' | 'datetime';

/**
 * Configuration for string settings
 */
export interface StringSettingConfig extends BaseSettingConfig<string> {
    /** Minimum length */
    minLength?: number;
    /** Maximum length */
    maxLength?: number;
    /** Regex pattern for validation */
    pattern?: RegExp;
    /** Placeholder text */
    placeholder?: string;
    /** Whether multiline input is allowed */
    multiline?: boolean;
    /** Format type (text, date, time, datetime) */
    format?: StringFormat;
}

// ============================================
// Serialization Interface
// ============================================

/**
 * Interface for setting serialization
 */
export interface SerializableSetting<T> {
    serialize(): string;
    deserialize(data: string): T;
}
