/**
 * Boolean Setting - On/Off toggle setting
 */

import { BaseSetting } from './base';
import type { BaseSettingConfig, SettingOptionType } from './types';

/**
 * Configuration for boolean settings
 */
export type BooleanSettingConfig = BaseSettingConfig<boolean>;

/**
 * Boolean setting for on/off toggles
 */
export class BooleanSetting extends BaseSetting<boolean> {
    readonly optionType: SettingOptionType = 'boolean';

    constructor(config: BooleanSettingConfig) {
        super(config);
    }

    /**
     * Validate boolean value
     */
    validate(value: boolean): boolean {
        return typeof value === 'boolean';
    }

    /**
     * Toggle the current value
     */
    toggle(): void {
        this.setValue(!this._value);
    }

    /**
     * Check if setting is enabled
     */
    isEnabled(): boolean {
        return this._value === true;
    }

    /**
     * Check if setting is disabled
     */
    isDisabled(): boolean {
        return this._value === false;
    }
}
