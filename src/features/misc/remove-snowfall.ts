/**
 * Remove Snowfall Feature
 * Hides all snowfall effect elements (.snowfall-flakes) from the page
 */

import { Feature } from '@/core';
import { GM_addStyle } from '$';

export class RemoveSnowfallFeature extends Feature {
    private styleElement: HTMLStyleElement | null = null;

    constructor() {
        super({
            id: 'remove-snowfall',
            name: 'Remove Snowfall',
            description: 'Ẩn toàn bộ hiệu ứng tuyết rơi (snowfall) trên trang',
        });
    }

    run(): void {
        this.styleElement = GM_addStyle('.snowfall-flakes { display: none !important; }');
        this.log.d('Snowfall hidden');
    }

    cleanup(): void {
        this.styleElement?.remove();
        this.styleElement = null;
    }
}
