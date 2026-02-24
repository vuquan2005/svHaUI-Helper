/**
 * Remove Snowfall Feature
 * Removes all snowfall effect elements (.snowfall-flakes) from the page
 */

import { Feature } from '@/core';

export class RemoveSnowfallFeature extends Feature {
    constructor() {
        super({
            id: 'remove-snowfall',
            name: 'Remove Snowfall',
            description: 'Xoá hiệu ứng tuyết rơi (snowfall) trên trang',
        });
    }

    run(): void {
        const flakes = document.querySelectorAll('.snowfall-flakes');
        flakes.forEach((flake) => flake.remove());
        this.log.d(`Removed ${flakes.length} snowfall elements`);
    }
}
