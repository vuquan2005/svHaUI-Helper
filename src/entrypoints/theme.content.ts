import { browser } from 'wxt/browser';
import '@/features/dark-mode/dark-theme.scss';

export default defineContentScript({
    matches: ['https://sv.haui.edu.vn/*'],
    runAt: 'document_start',
    async main() {
        try {
            const stored = await browser.storage.local.get(['app_settings', 'dark_mode_system']);
            const appSettings = stored.app_settings as
                { features?: Record<string, boolean> } | undefined;
            const isEnabled = appSettings?.features?.['dark-mode'] ?? false;
            const isSystem = Boolean(stored.dark_mode_system);

            const isDark =
                isEnabled &&
                (!isSystem || window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (isDark) {
                document.documentElement.classList.add('sv-dark');
            }
        } catch {
            // Ignore error at early document_start
        }
    },
});
