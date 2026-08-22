/**
 * Home Shortcuts Feature
 * Injects missing useful shortcuts into HaUI's homepage action grid (.cttsv-action-grid)
 * and organizes them in a clean, logical order.
 */

import { Feature } from '@/core';
import { observeDomUntil } from '@/utils/dom';
import { ADDITIONAL_SHORTCUTS, SHORTCUT_SORT_ORDER, ShortcutItem } from './shortcuts';
import './style.module.scss';

export const SHORTCUT_CLASS = 'sv-helper-shortcut';

/**
 * Creates an action card HTML element matching HaUI's design system
 */
export function createShortcutCard(item: ShortcutItem): HTMLAnchorElement {
    const card = document.createElement('a');
    card.className = `cttsv-action-card ${SHORTCUT_CLASS}`;
    card.href = item.href;
    card.dataset.shortcutId = item.id;

    const iconWrap = document.createElement('span');
    iconWrap.className = `cttsv-action-icon ${item.colorClass}`;

    const icon = document.createElement('i');
    icon.className = `icon ${item.iconClass}`;
    iconWrap.appendChild(icon);

    const title = document.createElement('strong');
    title.textContent = item.title;

    const desc = document.createElement('em');
    desc.textContent = item.description;

    card.appendChild(iconWrap);
    card.appendChild(title);
    card.appendChild(desc);

    return card;
}

export class HomeShortcutsFeature extends Feature {
    private abortController: AbortController | null = null;

    constructor() {
        super({
            id: 'home-shortcuts',
            name: 'Home Shortcuts',
            description: 'Bổ sung và sắp xếp các lối tắt quan trọng trên trang chủ',
            urlMatch: [
                { name: 'home-root', pattern: /^\/$/ },
                { name: 'home-path', pattern: /^\/home$/ },
            ],
        });
    }

    run(): void {
        this.abortController = new AbortController();

        observeDomUntil(
            '.be-content',
            () => {
                const actionGrid = document.querySelector('div.cttsv-action-grid');
                if (!actionGrid) return false;

                this.injectShortcuts(actionGrid);
                this.sortShortcuts(actionGrid);
                return true;
            },
            {
                signal: this.abortController.signal,
                timeoutMs: 8000,
            }
        ).then((result) => {
            if (result.success) {
                this.log.i('Đã bổ sung và sắp xếp các lối tắt trên trang chủ');
            } else if (result.code !== 'ABORT') {
                this.log.d(`Observer dừng với mã: ${result.code}`);
            }
        });
    }

    /**
     * Injects additional shortcut cards if not already present
     */
    private injectShortcuts(grid: Element): void {
        for (const item of ADDITIONAL_SHORTCUTS) {
            const existing = grid.querySelector(`a[href="${item.href}"], a[href*="${item.href}"]`);
            if (existing) continue;

            const card = createShortcutCard(item);
            grid.appendChild(card);
        }
    }

    /**
     * Sorts all action cards in the grid according to SHORTCUT_SORT_ORDER
     */
    private sortShortcuts(grid: Element): void {
        const cards = Array.from(
            grid.querySelectorAll<HTMLAnchorElement>(':scope > a.cttsv-action-card')
        );
        if (cards.length === 0) return;

        cards.sort((a, b) => {
            const hrefA = a.getAttribute('href') || '';
            const hrefB = b.getAttribute('href') || '';

            const indexA = SHORTCUT_SORT_ORDER.findIndex((path) => hrefA.includes(path));
            const indexB = SHORTCUT_SORT_ORDER.findIndex((path) => hrefB.includes(path));

            const rankA = indexA === -1 ? 999 : indexA;
            const rankB = indexB === -1 ? 999 : indexB;

            return rankA - rankB;
        });

        for (const card of cards) {
            grid.appendChild(card);
        }
    }

    cleanup(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }

        const elements = document.querySelectorAll(`.${SHORTCUT_CLASS}`);
        elements.forEach((el) => el.remove());
    }
}
