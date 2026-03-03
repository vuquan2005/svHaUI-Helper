/**
 * Dynamic Title Feature
 * Changes document.title based on URL and page content
 */

import { Feature } from '@/core';
import { observeDomUntil } from '@/utils/dom';
import { URL_TITLE_MAP } from './url-title-map';

// ============================================
// Constants
// ============================================

/** Debounce delay after DOM changes before updating title (ms) */
const TITLE_UPDATE_DEBOUNCE_MS = 100;

// ============================================
// DOM Selectors
// ============================================

const DOM = {
    /** Get panel header text */
    panelHeader: (): string | null => {
        const el = document.querySelector('span.k-panel-header-text:first-child');
        return el?.textContent?.trim() || null;
    },

    /** Get subject name + class code from first table (rows 1 & 3, column 2) */
    tableInfoPair: (): { first: string; second: string } | null => {
        const table = document.querySelector('table:first-child');
        if (!table) return null;

        const first = table
            .querySelector('tbody > tr:first-child > td:nth-child(2)')
            ?.textContent?.trim();
        const second = table
            .querySelector('tbody > tr:nth-child(3) > td:nth-child(2)')
            ?.textContent?.trim();

        if (!first || !second) return null;
        return { first, second };
    },
};

// ============================================
// Title Parsers
// ============================================

/**
 * Parse course info from panel header
 * "CHI TIẾT HỌC PHẦN: TÊN MÔN ( IC6005 )" -> { name: "TÊN MÔN", code: "IC6005" }
 * "CHI TIẾT HỌC PHẦN (CDIO): TÊN MÔN ( IC6005 )" -> same result
 */
function parseCourseTitle(): string | null {
    const header = DOM.panelHeader();
    if (!header) return null;

    const match = header.match(/CHI TIẾT HỌC PHẦN[^:]*:\s*(.+?)\s*\(\s*([A-Z]{2}\d+)\s*\)/);
    if (!match) return null;

    return `${match[1].trim()} (${match[2]})`;
}

/**
 * Build a title from table info pair with a given prefix
 * Used for both class results and friend results
 */
function tableTitle(prefix: string): string | null {
    const info = DOM.tableInfoPair();
    return info ? `${prefix} - ${info.first} - ${info.second}` : null;
}

// ============================================
// Dynamic URL Patterns
// ============================================

interface DynamicTitleConfig {
    /** Regex to match URL (pathname + search) */
    pattern: RegExp;
    /** Icon emoji */
    icon: string;
    /** Function to generate title from DOM, returns null if DOM not ready */
    getTitle: () => string | null;
}

const DYNAMIC_URL_PATTERNS: DynamicTitleConfig[] = [
    // Course details (CDIO & regular)
    {
        pattern: /^\/training\/view(?:modulescdiosv|courseindustry2)\//,
        icon: '📖',
        getTitle: parseCourseTitle,
    },
    // Class exam results
    {
        pattern: /^\/student\/result\/viewexamresultclass/,
        icon: '👥',
        getTitle: () => tableTitle('KQ thi'),
    },
    // Class academic results
    {
        pattern: /^\/student\/result\/viewstudyresultclass/,
        icon: '👥',
        getTitle: () => tableTitle('KQ HT'),
    },
    // Friend academic results
    {
        pattern: /^\/student\/result\/viewstudyresult\?/,
        icon: '👤',
        getTitle: () => tableTitle('KQ'),
    },
    // Friend exam results
    {
        pattern: /^\/student\/result\/viewexamresult\?/,
        icon: '👤',
        getTitle: () => tableTitle('KQ thi'),
    },
];

// ============================================
// Feature Implementation
// ============================================

export class DynamicTitleFeature extends Feature {
    private originalTitle: string = '';
    private abortController: AbortController | null = null;

    constructor() {
        super({
            id: 'dynamic-title',
            name: 'Dynamic Title',
            description: 'Thay đổi tiêu đề tab dựa trên trang đang xem',
        });
    }

    /**
     * Initialize Dynamic Title Feature
     * Update title and start observing DOM changes
     */
    run(): void {
        this.originalTitle = document.title;
        this.abortController = new AbortController();

        observeDomUntil('.be-content', () => this.updateTitle(), {
            debounceMs: TITLE_UPDATE_DEBOUNCE_MS,
            signal: this.abortController.signal,
        }).then((result) => {
            if (result.success) {
                this.log.d('Title found, stopping observer');
            } else if (result.code !== 'ABORT') {
                this.log.d(`Observer stopped with code: ${result.code}`);
            }
        });
    }

    /**
     * Update document title based on URL and DOM
     * @returns true if a matching title was found, false if need to wait
     */
    private updateTitle(): boolean {
        const pathAndQuery = this.location.pathAndQuery;
        const pathname = this.location.path;

        // 1. Try static mapping first (always succeeds if matches)
        const staticTitle = URL_TITLE_MAP[pathname];
        if (staticTitle) {
            this.setTitle(staticTitle);
            return true;
        }

        // 2. Try dynamic patterns (need DOM content)
        for (const { pattern, icon, getTitle } of DYNAMIC_URL_PATTERNS) {
            if (pattern.test(pathAndQuery)) {
                const title = getTitle();
                if (title === null) return false; // DOM not ready yet
                this.setTitle(`${icon} ${title}`);
                return true;
            }
        }

        // 3. No match — keep original title
        this.log.d('No matching pattern, keeping original title');
        return false;
    }

    private setTitle(title: string): void {
        const newTitle = `${title} | HaUI`;
        if (document.title !== newTitle) {
            document.title = newTitle;
            this.log.d(`Title set: ${newTitle}`);
        }
    }

    /**
     * Cleanup resources when feature is disabled
     * Restore original title and stop observer
     */
    cleanup(): void {
        document.title = this.originalTitle;

        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }
}
