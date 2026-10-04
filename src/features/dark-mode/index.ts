/**
 * Dark Mode Feature
 * Provides native dark theme support for HaUI Portal and SV HaUI Helper UI.
 */

import { Feature } from '@/core';
import { browser } from 'wxt/browser';

export class DarkModeFeature extends Feature {
    private mediaQuery: MediaQueryList | null = null;
    private mediaListener: ((e: MediaQueryListEvent) => void) | null = null;
    private storageListener: Parameters<typeof browser.storage.onChanged.addListener>[0] | null =
        null;

    constructor() {
        super({
            id: 'dark-mode',
            name: 'Giao diện tối (Dark Mode)',
            description: 'Chế độ nền tối bảo vệ mắt cho toàn bộ website và tiện ích',
            priority: 100, // Highest priority to apply theme as early as possible
        });
    }

    async run(): Promise<void> {
        this.log.d('Initializing Dark Mode feature...');

        const applyCurrentState = async () => {
            const stored = await browser.storage.local.get(['app_settings', 'dark_mode_system']);
            const appSettings = stored.app_settings as
                { features?: Record<string, boolean> } | undefined;
            const isEnabled = appSettings?.features?.['dark-mode'] ?? false;
            const isSystem = Boolean(stored.dark_mode_system);

            this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const shouldBeDark = isEnabled && (!isSystem || this.mediaQuery.matches);
            document.documentElement.classList.toggle('sv-dark', shouldBeDark);
            this.log.i(
                `Giao diện tối: ${shouldBeDark ? 'Đã bật' : 'Tắt (theo hệ thống đang ở giao diện sáng)'}`
            );

            // Listen for system changes if system mode is enabled
            if (isEnabled && isSystem) {
                if (!this.mediaListener) {
                    this.mediaListener = (e: MediaQueryListEvent) => {
                        document.documentElement.classList.toggle('sv-dark', e.matches);
                        this.log.d(`Hệ thống đổi theme: ${e.matches ? 'Dark' : 'Light'}`);
                    };
                    this.mediaQuery.addEventListener('change', this.mediaListener);
                }
            } else if (this.mediaListener && this.mediaQuery) {
                this.mediaQuery.removeEventListener('change', this.mediaListener);
                this.mediaListener = null;
            }
        };

        await applyCurrentState();

        // Listen for changes to dark_mode settings
        this.storageListener = (changes, areaName) => {
            if (areaName === 'local' && (changes.dark_mode_system || changes.app_settings)) {
                this.log.d('dark_mode settings changed, updating theme...');
                void applyCurrentState();
            }
        };
        browser.storage.onChanged.addListener(this.storageListener);
    }

    cleanup(): void {
        document.documentElement.classList.remove('sv-dark');

        if (this.mediaQuery && this.mediaListener) {
            this.mediaQuery.removeEventListener('change', this.mediaListener);
            this.mediaListener = null;
        }

        if (this.storageListener) {
            browser.storage.onChanged.removeListener(this.storageListener);
            this.storageListener = null;
        }

        this.log.i('Đã tắt giao diện tối');
    }
}
