/**
 * Number Setting - Numeric value with validation
 */

import { BaseSetting } from './base';
import type { SettingOptionType, NumberSettingConfig } from './types';

/**
 * Number setting with min/max/step validation
 */
export class NumberSetting extends BaseSetting<number> {
    readonly optionType: SettingOptionType = 'number';

    /** Minimum allowed value */
    readonly min?: number;

    /** Maximum allowed value */
    readonly max?: number;

    /** Step for increment/decrement */
    readonly step: number;

    /** Whether value must be an integer */
    readonly integer: boolean;

    constructor(config: NumberSettingConfig) {
        super(config);
        this.min = config.min;
        this.max = config.max;
        this.step = config.step ?? 1;
        this.integer = config.integer ?? false;
    }

    /**
     * Validate number value
     */
    validate(value: number): boolean {
        if (typeof value !== 'number' || isNaN(value)) {
            return false;
        }

        if (this.integer && !Number.isInteger(value)) {
            return false;
        }

        if (this.min !== undefined && value < this.min) {
            return false;
        }

        if (this.max !== undefined && value > this.max) {
            return false;
        }

        return true;
    }

    /**
     * Clamp value to min/max range
     */
    clamp(value: number): number {
        let result = value;

        if (this.integer) {
            result = Math.round(result);
        }

        if (this.min !== undefined) {
            result = Math.max(this.min, result);
        }

        if (this.max !== undefined) {
            result = Math.min(this.max, result);
        }

        return result;
    }

    /**
     * Set value with automatic clamping
     */
    setValueClamped(value: number): boolean {
        return this.setValue(this.clamp(value));
    }

    /**
     * Increment by step
     */
    increment(): boolean {
        return this.setValueClamped(this._value + this.step);
    }

    /**
     * Decrement by step
     */
    decrement(): boolean {
        return this.setValueClamped(this._value - this.step);
    }

    /**
     * Get value as percentage between min and max
     * Returns NaN if min or max is not defined
     */
    getPercentage(): number {
        if (this.min === undefined || this.max === undefined) {
            return NaN;
        }
        const range = this.max - this.min;
        if (range === 0) return 100;
        return ((this._value - this.min) / range) * 100;
    }

    /**
     * Set value from percentage (0-100)
     */
    setFromPercentage(percent: number): boolean {
        if (this.min === undefined || this.max === undefined) {
            return false;
        }
        const range = this.max - this.min;
        const value = this.min + (range * percent) / 100;
        return this.setValueClamped(value);
    }
}
