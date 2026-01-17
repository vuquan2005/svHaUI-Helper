/**
 * Base Setting - Abstract class for all setting types
 * Provides core functionality for settings management
 */

import { storage } from '../storage';
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
    protected readonly defaultValue: T;

    /** Event listeners */
    protected readonly listeners: Set<SettingChangeHandler<T>> = new Set();

    constructor(config: BaseSettingConfig<T>) {
        this.key = config.key;
        this.displayLabel = config.displayLabel;
        this.displayDescription = config.displayDescription;
        this.defaultValue = config.defaultValue;
        this._value = this.load();
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
     * Storage key prefix for settings
     */
    protected get storageKey(): string {
        return `setting_${this.key}`;
    }

    /**
     * Load value from storage
     */
    protected load(): T {
        try {
            const stored = storage.getRaw<T>(this.storageKey);
            if (stored === undefined) {
                // Initialize storage with default value
                storage.setRaw(this.storageKey, this.defaultValue);
                return this.defaultValue;
            }
            return stored;
        } catch (e) {
            log.e(`Failed to load setting "${this.key}":`, e);
            return this.defaultValue;
        }
    }

    /**
     * Save value to storage
     */
    protected save(): void {
        try {
            storage.setRaw(this.storageKey, this._value);
        } catch (e) {
            log.e(`Failed to save setting "${this.key}":`, e);
        }
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
