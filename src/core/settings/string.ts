/**
 * String Setting - Text value with validation
 * Supports text, date, time, and datetime formats
 */

import { BaseSetting } from './base';
import type { SettingOptionType, StringSettingConfig, StringFormat } from './types';

/**
 * String setting with format support (text, date, time, datetime)
 */
export class StringSetting extends BaseSetting<string> {
    /** Base option type - may be overridden by format */
    get optionType(): SettingOptionType {
        if (this.format === 'date') return 'date';
        if (this.format === 'time') return 'time';
        return 'string';
    }

    /** Minimum length */
    readonly minLength?: number;

    /** Maximum length */
    readonly maxLength?: number;

    /** Regex pattern for validation */
    readonly pattern?: RegExp;

    /** Placeholder text */
    readonly placeholder?: string;

    /** Whether multiline input is allowed */
    readonly multiline: boolean;

    /** Format type */
    readonly format: StringFormat;

    constructor(config: StringSettingConfig) {
        super(config);
        this.minLength = config.minLength;
        this.maxLength = config.maxLength;
        this.pattern = config.pattern;
        this.placeholder = config.placeholder;
        this.multiline = config.multiline ?? false;
        this.format = config.format ?? 'text';
    }

    /**
     * Validate string value
     */
    validate(value: string): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        if (this.minLength !== undefined && value.length < this.minLength) {
            return false;
        }

        if (this.maxLength !== undefined && value.length > this.maxLength) {
            return false;
        }

        if (this.pattern && !this.pattern.test(value)) {
            return false;
        }

        // Format-specific validation
        if (this.format === 'date' || this.format === 'datetime') {
            if (value && isNaN(Date.parse(value))) {
                return false;
            }
        }

        if (this.format === 'time') {
            // Validate HH:MM or HH:MM:SS format
            if (value && !/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get trimmed value
     */
    getTrimmed(): string {
        return this._value.trim();
    }

    /**
     * Check if value is empty or whitespace only
     */
    isEmpty(): boolean {
        return this.getTrimmed().length === 0;
    }

    /**
     * Get current length
     */
    getLength(): number {
        return this._value.length;
    }

    // ============================================
    // Date/Time Helpers
    // ============================================

    /**
     * Get value as Date object (for date/datetime format)
     * Returns null if parsing fails or format is not date/datetime
     */
    getAsDate(): Date | null {
        if (this.format !== 'date' && this.format !== 'datetime') {
            return null;
        }
        if (!this._value) {
            return null;
        }
        const date = new Date(this._value);
        return isNaN(date.getTime()) ? null : date;
    }

    /**
     * Set value from Date object
     */
    setFromDate(date: Date): boolean {
        if (this.format === 'date') {
            // ISO date format: YYYY-MM-DD
            return this.setValue(date.toISOString().split('T')[0]);
        }
        if (this.format === 'datetime') {
            // ISO datetime format
            return this.setValue(date.toISOString());
        }
        if (this.format === 'time') {
            // HH:MM:SS format
            return this.setValue(date.toTimeString().split(' ')[0]);
        }
        return this.setValue(date.toString());
    }

    /**
     * Get value as time components (for time format)
     * Returns null if parsing fails or format is not time
     */
    getAsTime(): { hours: number; minutes: number; seconds: number } | null {
        if (this.format !== 'time') {
            return null;
        }
        const match = this._value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (!match) {
            return null;
        }
        return {
            hours: parseInt(match[1], 10),
            minutes: parseInt(match[2], 10),
            seconds: match[3] ? parseInt(match[3], 10) : 0,
        };
    }

    /**
     * Set value from time components
     */
    setFromTime(hours: number, minutes: number, seconds = 0): boolean {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return this.setValue(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }
}
