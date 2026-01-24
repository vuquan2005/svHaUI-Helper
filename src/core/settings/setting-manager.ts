import { ScopedStorage, storage } from '../storage';
import { BaseSetting } from './base';
import { createLogger } from '../logger';

const log = createLogger('SettingManager');

/**
 * Singleton implementation for managing settings
 * Handles storage, caching, and synchronization
 */
export class SettingManager {
    private static instance: SettingManager;
    private storage: ScopedStorage<any>;
    private settings: Map<string, BaseSetting<any>> = new Map();
    private initialized = false;

    private constructor() {
        // Use 'settings' scope for all settings
        // This will result in keys being stored as "settings.KEY"
        this.storage = storage.createScope('settings');
    }

    /**
     * Get the singleton instance
     */
    public static getInstance(): SettingManager {
        if (!SettingManager.instance) {
            SettingManager.instance = new SettingManager();
        }
        return SettingManager.instance;
    }

    /**
     * Register a setting with the manager
     * @param setting The setting instance to register
     */
    public register(setting: BaseSetting<any>) {
        if (this.settings.has(setting.key)) {
            log.w(`Setting with key "${setting.key}" already registered. Overwriting.`);
        }
        this.settings.set(setting.key, setting);

        // If manager is already initialized, we should load this setting immediately
        if (this.initialized) {
            this.loadSetting(setting).catch((err) => {
                log.e(`Failed to load setting "${setting.key}" during registration:`, err);
            });
        }
    }

    /**
     * Initialize the manager and load all registered settings
     */
    public async init(): Promise<void> {
        if (this.initialized) {
            return;
        }

        log.i('Initializing SettingManager...');
        const loadPromises: Promise<void>[] = [];

        for (const setting of this.settings.values()) {
            loadPromises.push(this.loadSetting(setting));
        }

        await Promise.all(loadPromises);
        this.initialized = true;
        log.i(`SettingManager initialized with ${this.settings.size} settings.`);
    }

    /**
     * Load a single setting from storage
     */
    private async loadSetting(setting: BaseSetting<any>): Promise<void> {
        try {
            const storedValue = await this.storage.get(setting.key);

            if (storedValue !== undefined) {
                // Update the setting's value without triggering save
                // valid: using the public setter would trigger save, so we need a special method
                // or we use a hack (cast to any). Ideally BaseSetting exposes a sync method.
                // We will assume BaseSetting has a method `setValueFromStorage` or similar.
                // For now, I'll assume I can call a method I'm about to add to BaseSetting.
                (setting as any)._value = storedValue;
                // We also might want to emit a change event? Maybe not for initial load.
            } else {
                // Save default value to storage if not present
                await this.storage.set(setting.key, setting.defaultValue);
            }
        } catch (e) {
            log.e(`Error loading setting "${setting.key}":`, e);
        }
    }

    /**
     * Save a setting value to storage
     * @param key Setting key
     * @param value Value to save
     */
    public async saveSetting<T>(key: string, value: T): Promise<void> {
        try {
            await this.storage.set(key, value);
        } catch (e) {
            log.e(`Error saving setting "${key}":`, e);
            throw e;
        }
    }

    /**
     * Get a setting instance by key
     */
    public getSetting<T>(key: string): BaseSetting<T> | undefined {
        return this.settings.get(key) as BaseSetting<T>;
    }
}
