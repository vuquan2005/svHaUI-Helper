/**
 * Settings Manager - Central registry for all settings
 * Uses the new setting class system
 */

import { createLogger, setGlobalLogLevel, type LogLevel } from './logger';
import { DEFAULT_SETTINGS } from './constants';
import {
    BaseSetting,
    BooleanSetting,
    SelectSetting,
    type SettingChangeEvent,
} from './settings/index';

const log = createLogger('SettingsManager');

/**
 * Handler for any setting change
 */
type GlobalChangeHandler = (key: string, event: SettingChangeEvent<unknown>) => void;

/**
 * Central registry and manager for all application settings
 */
class SettingsManager {
    /** Registry of all settings by key */
    private registry: Map<string, BaseSetting<unknown>> = new Map();

    /** Global change listeners */
    private globalListeners: Set<GlobalChangeHandler> = new Set();

    // ============================================
    // Pre-defined Settings
    // ============================================

    /** Log level setting */
    readonly logLevel: SelectSetting<LogLevel>;

    /** Captcha undo telex setting */
    readonly captchaUndoTelex: BooleanSetting;

    /** Feature enable/disable flags (legacy support) */
    private featureSettings: Map<string, BooleanSetting> = new Map();

    constructor() {
        // Always show initialization message (before log level is applied)
        console.log('🔧 [HaUI:SettingsManager] Initializing settings...');

        // Initialize log level setting FIRST
        this.logLevel = new SelectSetting<LogLevel>({
            key: 'logLevel',
            displayLabel: 'Log Level',
            displayDescription: 'Mức độ chi tiết của log output',
            defaultValue: DEFAULT_SETTINGS.logLevel,
            options: [
                { value: 'debug', label: 'Debug', description: 'Hiển thị tất cả logs' },
                { value: 'info', label: 'Info', description: 'Thông tin chung' },
                { value: 'warn', label: 'Warning', description: 'Cảnh báo và lỗi' },
                { value: 'error', label: 'Error', description: 'Chỉ lỗi' },
                { value: 'none', label: 'None', description: 'Tắt hoàn toàn' },
            ],
        });

        setGlobalLogLevel(this.logLevel.getValue());
        this.logLevel.onChange((event) => {
            setGlobalLogLevel(event.newValue);
        });

        // Initialize other settings
        this.captchaUndoTelex = new BooleanSetting({
            key: 'captchaUndoTelex',
            displayLabel: 'Captcha Undo Telex',
            displayDescription: 'Tự động hoàn tác gõ Telex khi nhập captcha',
            defaultValue: DEFAULT_SETTINGS.captchaUndoTelex,
        });

        // Register all settings
        this.register(this.logLevel);
        this.register(this.captchaUndoTelex);

        log.d('✅ Settings ready!');
    }

    // ============================================
    // Registry Methods
    // ============================================

    /**
     * Register a setting in the registry
     */
    register<T>(setting: BaseSetting<T>): void {
        if (this.registry.has(setting.key)) {
            log.w(`Setting "${setting.key}" already registered, overwriting`);
        }

        this.registry.set(setting.key, setting as BaseSetting<unknown>);

        // Subscribe to changes for global event
        setting.onChange((event) => {
            this.emitGlobal(setting.key, event as SettingChangeEvent<unknown>);
        });

        log.d(`  ${setting.key} = ${JSON.stringify(setting.getValue())}`);
    }

    /**
     * Get a setting by key
     */
    get<T>(key: string): BaseSetting<T> | undefined {
        return this.registry.get(key) as BaseSetting<T> | undefined;
    }

    /**
     * Check if a setting is registered
     */
    has(key: string): boolean {
        return this.registry.has(key);
    }

    /**
     * Get all registered settings
     */
    getAll(): BaseSetting<unknown>[] {
        return Array.from(this.registry.values());
    }

    /**
     * Get all settings as JSON for export
     */
    toJSON(): Record<string, unknown> {
        const result: Record<string, unknown> = {};
        this.registry.forEach((setting, key) => {
            result[key] = setting.getValue();
        });
        return result;
    }

    // ============================================
    // Feature Settings
    // ============================================

    /**
     * Check if a feature is enabled
     * @param featureId Feature ID
     * @param name Feature display name (for UI)
     * @param description Feature description (for UI)
     */
    isFeatureEnabled(featureId: string, name?: string, description?: string): boolean {
        let setting = this.featureSettings.get(featureId);

        if (!setting) {
            // Create on-demand
            setting = new BooleanSetting({
                key: `feature_${featureId}`,
                displayLabel: name ?? featureId,
                displayDescription: description ?? `Bật/tắt ${name ?? featureId}`,
                defaultValue: true,
            });
            this.featureSettings.set(featureId, setting);
            this.register(setting);
        }

        return setting.getValue();
    }

    /**
     * Set feature enabled state
     * @param featureId Feature ID
     * @param enabled New enabled state
     * @param name Feature display name (for UI)
     * @param description Feature description (for UI)
     */
    setFeatureEnabled(featureId: string, enabled: boolean, name?: string, description?: string): void {
        let setting = this.featureSettings.get(featureId);

        if (!setting) {
            setting = new BooleanSetting({
                key: `feature_${featureId}`,
                displayLabel: name ?? featureId,
                displayDescription: description ?? `Bật/tắt ${name ?? featureId}`,
                defaultValue: true,
            });
            this.featureSettings.set(featureId, setting);
            this.register(setting);
        }

        setting.setValue(enabled);
    }

    /**
     * Get feature setting (for direct access)
     */
    getFeatureSetting(featureId: string): BooleanSetting | undefined {
        return this.featureSettings.get(featureId);
    }

    // ============================================
    // Global Events
    // ============================================

    /**
     * Subscribe to any setting change
     * @returns Unsubscribe function
     */
    onAnyChange(handler: GlobalChangeHandler): () => void {
        this.globalListeners.add(handler);
        return () => this.globalListeners.delete(handler);
    }

    /**
     * Emit global change event
     */
    private emitGlobal(key: string, event: SettingChangeEvent<unknown>): void {
        this.globalListeners.forEach((handler) => {
            try {
                handler(key, event);
            } catch (e) {
                log.e(`Error in global change handler:`, e);
            }
        });
    }

    // ============================================
    // Utility
    // ============================================

    /**
     * Reset all settings to defaults
     */
    resetAll(): void {
        this.registry.forEach((setting) => {
            setting.reset();
        });
        log.i('All settings reset to defaults');
    }
}

export const settings = new SettingsManager();
export type { LogLevel };

// Re-export setting types for convenience
export * from './settings/index';
