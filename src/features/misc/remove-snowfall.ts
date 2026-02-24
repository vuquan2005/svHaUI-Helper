/**
 * Remove Snowfall Feature
 * Hides all snowfall effect elements (.snowfall-flakes) from the page
 */

import { Feature } from '@/core';

export class RemoveSnowfallFeature extends Feature {
    constructor() {
        super({
            id: 'remove-snowfall',
            name: 'Remove Snowfall',
            description: 'Xoá toàn bộ hiệu ứng tuyết rơi (snowfall) trên trang',
        });
    }

    run(): void {
        document.querySelectorAll('.snowfall-flakes').forEach((el) => el.remove());
        this.log.d('Snowfall removed');
    }
}
