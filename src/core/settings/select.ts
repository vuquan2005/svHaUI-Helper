/**
 * Select Setting - Single selection from options
 */

import { BaseSetting } from './base';
import type { SettingOptionType, SelectOption, SelectSettingConfig } from './types';

/**
 * Single select setting (dropdown/radio buttons)
 */
export class SelectSetting<T extends string | number> extends BaseSetting<T> {
    readonly optionType: SettingOptionType = 'select';

    /** Available options */
    readonly options: readonly SelectOption<T>[];

    constructor(config: SelectSettingConfig<T>) {
        super(config);
        this.options = Object.freeze([...config.options]);
    }

    /**
     * Validate that value is one of the available options
     */
    validate(value: T): boolean {
        return this.options.some((opt) => opt.value === value);
    }

    /**
     * Get the currently selected option
     */
    getSelectedOption(): SelectOption<T> | undefined {
        return this.options.find((opt) => opt.value === this._value);
    }

    /**
     * Get the label of the currently selected option
     */
    getSelectedLabel(): string {
        return this.getSelectedOption()?.label ?? '';
    }

    /**
     * Select by option index
     */
    selectByIndex(index: number): boolean {
        if (index < 0 || index >= this.options.length) {
            return false;
        }
        return this.setValue(this.options[index].value);
    }

    /**
     * Get index of current selection
     */
    getSelectedIndex(): number {
        return this.options.findIndex((opt) => opt.value === this._value);
    }

    /**
     * Check if a specific value is selected
     */
    isSelected(value: T): boolean {
        return this._value === value;
    }
}
