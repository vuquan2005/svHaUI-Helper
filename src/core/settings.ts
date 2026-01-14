/**
 * Settings Manager - Quản lý cài đặt người dùng
 * Sử dụng GM_getValue/GM_setValue để lưu trữ persistent
 */

export interface AppSettings {
    // Cài đặt chung
    enabled: boolean;

    // Cài đặt cho từng feature
    features: {
        [key: string]: boolean;
    };
}

const DEFAULT_SETTINGS: AppSettings = {
    enabled: true,
    features: {},
};

class SettingsManager {
    private settings: AppSettings;
    private readonly STORAGE_KEY = 'svhaui_helper_settings';

    constructor() {
        this.settings = this.load();
    }

    private load(): AppSettings {
        try {
            const saved = GM_getValue(this.STORAGE_KEY, null);
            if (saved) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('[Settings] Failed to load settings:', e);
        }
        return { ...DEFAULT_SETTINGS };
    }

    save(): void {
        try {
            GM_setValue(this.STORAGE_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.error('[Settings] Failed to save settings:', e);
        }
    }

    get<K extends keyof AppSettings>(key: K): AppSettings[K] {
        return this.settings[key];
    }

    set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
        this.settings[key] = value;
        this.save();
    }

    isFeatureEnabled(featureId: string): boolean {
        return this.settings.features[featureId] ?? true;
    }

    setFeatureEnabled(featureId: string, enabled: boolean): void {
        this.settings.features[featureId] = enabled;
        this.save();
    }

    getAll(): AppSettings {
        return { ...this.settings };
    }
}

export const settings = new SettingsManager();
