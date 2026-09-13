/**
 * Migration Notice Feature
 * Informs userscript users about migration to standalone Browser Extension
 */

import { Feature } from '@/core';
import './style.module.scss';

export interface MigrationNoticeStorage {
    dismissed?: boolean;
    [key: string]: unknown;
}

export const EXTENSION_RELEASE_URL = 'https://github.com/vuquan2005/svHaUI-Helper/releases/latest';

export class MigrationNoticeFeature extends Feature<MigrationNoticeStorage> {
    constructor() {
        super({
            id: 'migration-notice',
            name: 'Migration Notice',
            description: 'Thông báo nâng cấp lên Browser Extension độc lập',
            priority: 1000, // Run with highest priority so notice is shown immediately
        });
    }

    async run(): Promise<void> {
        const isDismissed = await this.storage.get('dismissed', false);
        if (isDismissed) {
            this.log.d('Migration notice has already been dismissed by user.');
            return;
        }

        this.renderBanner();
    }

    private renderBanner(): void {
        if (document.getElementById('svhaui-migration-banner')) {
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'svhaui-migration-banner';
        banner.className = 'sv-migration-banner';

        banner.innerHTML = `
            <div class="sv-migration-banner-inner">
                <div class="sv-migration-banner-left">
                    <div class="sv-migration-banner-icon">🚀</div>
                    <div class="sv-migration-banner-text">
                        <div class="sv-migration-banner-title">SV HaUI Helper đã nâng cấp lên Browser Extension!</div>
                        <div class="sv-migration-banner-desc">
                            Bản Userscript sẽ ngừng cập nhật. Vui lòng cài đặt Extension độc lập để giải Captcha offline, mượt mà hơn và không cần Tampermonkey.
                        </div>
                    </div>
                </div>
                <div class="sv-migration-banner-actions">
                    <a href="${EXTENSION_RELEASE_URL}" target="_blank" rel="noopener noreferrer" class="sv-migration-banner-btn-install">
                        Cài đặt Extension ngay
                    </a>
                    <button type="button" class="sv-migration-banner-btn-dismiss" title="Đóng và không hiển thị lại">
                        Đã hiểu
                    </button>
                </div>
            </div>
        `;

        const dismissBtn = banner.querySelector<HTMLButtonElement>(
            '.sv-migration-banner-btn-dismiss'
        );
        if (dismissBtn) {
            dismissBtn.addEventListener('click', async () => {
                banner.classList.add('hiding');
                setTimeout(() => banner.remove(), 300);
                await this.storage.set('dismissed', true);
            });
        }

        const installBtn = banner.querySelector<HTMLAnchorElement>(
            '.sv-migration-banner-btn-install'
        );
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                await this.storage.set('dismissed', true);
            });
        }

        if (document.body) {
            document.body.prepend(banner);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.prepend(banner);
            });
        }
    }
}
