/**
 * Base Setting - Abstract class for all setting types
 * Provides core functionality for settings management
 */

import { SettingManager } from './setting-manager';
import { createLogger } from '../logger';
import type {
    SettingOptionType,
    SettingChangeEvent,
    SettingChangeHandler,
    BaseSettingConfig,
    SerializableSetting,
} from './types';

const log = createLogger('BaseSetting');

/**
 * Abstract base class for all settings
 * Provides common functionality: storage, validation, events
 */
export abstract class BaseSetting<T> implements SerializableSetting<T> {
    /** Unique key for storage and identification */
    readonly key: string;

    /** Display label for UI */
    readonly displayLabel: string;

    /** Description shown in UI */
    readonly displayDescription: string;

    /** Type of setting for UI rendering */
    abstract readonly optionType: SettingOptionType;

    /** Current value */
    protected _value: T;

    /** Default value */
    readonly defaultValue: T;

    /** Event listeners */
    protected readonly listeners: Set<SettingChangeHandler<T>> = new Set();

    constructor(config: BaseSettingConfig<T>) {
        this.key = config.key;
        this.displayLabel = config.displayLabel;
        this.displayDescription = config.displayDescription;
        this.defaultValue = config.defaultValue;
        this._value = config.defaultValue;

        // Register with SettingManager
        SettingManager.getInstance().register(this);
    }

    // ============================================
    // Value Access
    // ============================================

    /**
     * Get current value
     */
    getValue(): T {
        return this._value;
    }

    /**
     * Set new value with validation
     * @param value New value to set
     * @returns true if value was set, false if validation failed
     */
    setValue(value: T): boolean {
        if (!this.validate(value)) {
            log.w(`Validation failed for setting "${this.key}":`, value);
            return false;
        }

        const oldValue = this._value;
        if (this.isEqual(oldValue, value)) {
            return true; // No change needed
        }

        this._value = value;
        this.save();
        this.emit(oldValue, value);
        return true;
    }

    /**
     * Update value from storage (internal use)
     * Does not trigger save()
     */
    updateValue(value: T): void {
        const oldValue = this._value;
        if (!this.isEqual(oldValue, value)) {
            this._value = value;
            this.emit(oldValue, value);
        }
    }

    /**
     * Reset to default value
     */
    reset(): void {
        this.setValue(this.defaultValue);
    }

    // ============================================
    // Validation
    // ============================================

    /**
     * Validate a value before setting
     * Override in subclasses for specific validation
     */
    abstract validate(value: T): boolean;

    /**
     * Check if two values are equal
     * Override for complex types
     */
    protected isEqual(a: T, b: T): boolean {
        return a === b;
    }

    // ============================================
    // Serialization
    // ============================================

    /**
     * Serialize value to string for storage
     */
    serialize(): string {
        return JSON.stringify(this._value);
    }

    /**
     * Deserialize string to value
     */
    deserialize(data: string): T {
        try {
            return JSON.parse(data) as T;
        } catch {
            log.w(`Failed to deserialize setting "${this.key}", using default`);
            return this.defaultValue;
        }
    }

    // ============================================
    // Storage
    // ============================================

    /**
     * Save value to storage via SettingManager
     */
    protected save(): void {
        SettingManager.getInstance()
            .saveSetting(this.key, this._value)
            .catch((e: unknown) => {
                log.e(`Failed to save setting "${this.key}":`, e);
            });
    }

    // ============================================
    // Events
    // ============================================

    /**
     * Subscribe to value changes
     * @param handler Callback function
     * @returns Unsubscribe function
     */
    onChange(handler: SettingChangeHandler<T>): () => void {
        this.listeners.add(handler);
        return () => this.listeners.delete(handler);
    }

    /**
     * Emit change event to all listeners
     */
    protected emit(oldValue: T, newValue: T): void {
        const event: SettingChangeEvent<T> = {
            key: this.key,
            oldValue,
            newValue,
            timestamp: Date.now(),
        };

        this.listeners.forEach((handler) => {
            try {
                handler(event);
            } catch (e) {
                log.e(`Error in change handler for "${this.key}":`, e);
            }
        });
    }

    // ============================================
    // Utility
    // ============================================

    /**
     * Get JSON representation for debugging/export
     */
    toJSON(): object {
        return {
            key: this.key,
            displayLabel: this.displayLabel,
            displayDescription: this.displayDescription,
            optionType: this.optionType,
            value: this._value,
            defaultValue: this.defaultValue,
        };
    }

    /**
     * String representation
     */
    toString(): string {
        return `${this.constructor.name}(${this.key}=${String(this._value)})`;
    }
}
