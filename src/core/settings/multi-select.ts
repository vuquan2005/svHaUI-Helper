/**
 * Multi-Select Setting - Multiple selection from options
 */

import { BaseSetting } from './base';
import type { SettingOptionType, SelectOption, MultiSelectSettingConfig } from './types';

/**
 * Multi-select setting (checkboxes)
 */
export class MultiSelectSetting<T extends string | number> extends BaseSetting<T[]> {
    readonly optionType: SettingOptionType = 'multi-select';

    /** Available options */
    readonly options: readonly SelectOption<T>[];

    constructor(config: MultiSelectSettingConfig<T>) {
        super(config);
        this.options = Object.freeze([...config.options]);
    }

    /**
     * Validate that all values are valid options
     */
    validate(value: T[]): boolean {
        if (!Array.isArray(value)) {
            return false;
        }
        return value.every((v) => this.options.some((opt) => opt.value === v));
    }

    /**
     * Check equality for arrays
     */
    protected isEqual(a: T[], b: T[]): boolean {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((val, idx) => val === sortedB[idx]);
    }

    /**
     * Check if a value is currently selected
     */
    isSelected(value: T): boolean {
        return this._value.includes(value);
    }

    /**
     * Select a value (add to selection)
     */
    select(value: T): boolean {
        if (!this.options.some((opt) => opt.value === value)) {
            return false;
        }
        if (this.isSelected(value)) {
            return true; // Already selected
        }
        return this.setValue([...this._value, value]);
    }

    /**
     * Deselect a value (remove from selection)
     */
    deselect(value: T): boolean {
        if (!this.isSelected(value)) {
            return true; // Not selected anyway
        }
        return this.setValue(this._value.filter((v) => v !== value));
    }

    /**
     * Toggle a value's selection state
     */
    toggleOption(value: T): boolean {
        if (this.isSelected(value)) {
            return this.deselect(value);
        }
        return this.select(value);
    }

    /**
     * Select all options
     */
    selectAll(): boolean {
        return this.setValue(this.options.map((opt) => opt.value));
    }

    /**
     * Deselect all options
     */
    deselectAll(): boolean {
        return this.setValue([]);
    }

    /**
     * Get selected options
     */
    getSelectedOptions(): SelectOption<T>[] {
        return this.options.filter((opt) => this.isSelected(opt.value));
    }

    /**
     * Get number of selected items
     */
    getSelectedCount(): number {
        return this._value.length;
    }
}
