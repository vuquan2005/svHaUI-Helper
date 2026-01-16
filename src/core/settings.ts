/**
 * Settings Manager - Manages user settings
 * Uses type-safe storage
 */

import { storage } from './storage';
import { createLogger, setGlobalLogLevel, type LogLevel } from './logger';

const log = createLogger('Settings');

const DEFAULT_SETTINGS = {
    logLevel: 'debug' as LogLevel,
    features: {} as Record<string, boolean>,
    captchaUndoTelex: true,
};

class SettingsManager {
    private settings: typeof DEFAULT_SETTINGS;

    constructor() {
        this.settings = this.load();
        setGlobalLogLevel(this.settings.logLevel);
    }

    private load(): typeof DEFAULT_SETTINGS {
        try {
            const saved = storage.get('app_settings', DEFAULT_SETTINGS);
            return { ...DEFAULT_SETTINGS, ...saved };
        } catch (e) {
            log.e('Failed to load settings:', e);
            return { ...DEFAULT_SETTINGS };
        }
    }

    private save(): void {
        try {
            storage.set('app_settings', this.settings);
        } catch (e) {
            log.e('Failed to save settings:', e);
        }
    }

    isFeatureEnabled(featureId: string): boolean {
        return this.settings.features[featureId] ?? true;
    }

    setFeatureEnabled(featureId: string, enabled: boolean): void {
        this.settings.features[featureId] = enabled;
        this.save();
    }

    setLogLevel(level: LogLevel): void {
        this.settings.logLevel = level;
        setGlobalLogLevel(level);
        this.save();
    }

    getLogLevel(): LogLevel {
        return this.settings.logLevel;
    }

    getCaptchaUndoTelex(): boolean {
        return this.settings.captchaUndoTelex;
    }

    setCaptchaUndoTelex(enabled: boolean): void {
        this.settings.captchaUndoTelex = enabled;
        this.save();
    }
}

export const settings = new SettingsManager();
export type { LogLevel };
