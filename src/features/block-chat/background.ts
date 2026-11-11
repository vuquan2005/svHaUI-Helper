import { browser } from 'wxt/browser';
import type { AppSettings } from '@/types';

/** Keep the packaged ruleset in sync even when no portal tab is open. */
export function initChatBlocking(): void {
    let pending = Promise.resolve();
    const sync = () => {
        // Serialize updates so rapid toggles cannot leave an older state applied last.
        pending = pending
            .then(async () => {
                const stored = await browser.storage.local.get('app_settings');
                const settings = stored.app_settings as AppSettings | undefined;
                const enabled = settings?.features?.['block-chat'] === true;
                await browser.declarativeNetRequest.updateEnabledRulesets({
                    enableRulesetIds: enabled ? ['block-chat'] : [],
                    disableRulesetIds: enabled ? [] : ['block-chat'],
                });
            })
            .catch((error: unknown) => {
                console.error('[HaUI:BlockChat] Không thể cập nhật rule chặn chat:', error);
            });
        return pending;
    };

    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && 'app_settings' in changes) void sync();
    });
    // Static ruleset state may be reset by an extension update.
    browser.runtime.onInstalled.addListener(() => void sync());
    void sync();
}
