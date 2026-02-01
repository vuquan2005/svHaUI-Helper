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
// Title Configuration
// ============================================

interface DynamicTitleConfig {
    /** Regex to match URL (pathname + search) */
    pattern: RegExp;
    /** Icon emoji */
    icon: string;
    /** Function to generate title from DOM, returns null if DOM not ready */
    getTitleFn: () => string | null;
}

// Helper functions to get data from DOM
const DOM = {
    /** Get panel header text */
    panelHeader: (): string | null => {
        const el = document.querySelector('span.k-panel-header-text:first-child');
        return el?.textContent?.trim() || null;
    },

    /** Parse thông tin học phần từ header
     * "CHI TIẾT HỌC PHẦN: TÊN MÔN ( IC6005 )" -> { name: "TÊN MÔN", code: "IC6005" }
     */
    parseCourseInfo: (header: string): { name: string; code: string } | null => {
        // Match: "CHI TIẾT HỌC PHẦN (CDIO): TÊN MÔN ( CODE )"
        const match = header.match(/CHI TIẾT HỌC PHẦN[^:]*:\s*(.+?)\s*\(\s*([A-Z]{2}\d+)\s*\)/);
        if (!match) return null;
        return { name: match[1].trim(), code: match[2] };
    },

    /** Get class info from first table */
    classInfo: (): { subjectName: string; classCode: string } | null => {
        const table = document.querySelector('table:first-child');
        if (!table) return null;

        const subjectName = table
            .querySelector('tbody > tr:first-child > td:nth-child(2)')
            ?.textContent?.trim();
        const classCode = table
            .querySelector('tbody > tr:nth-child(3) > td:nth-child(2)')
            ?.textContent?.trim();

        if (!subjectName || !classCode) return null;
        return { subjectName, classCode };
    },

    /** Get friend info from first table */
    friendInfo: (): { name: string; className: string } | null => {
        const table = document.querySelector('table:first-child');
        if (!table) return null;

        const name = table
            .querySelector('tbody > tr:first-child > td:nth-child(2)')
            ?.textContent?.trim();
        const className = table
            .querySelector('tbody > tr:nth-child(3) > td:nth-child(2)')
            ?.textContent?.trim();

        if (!name || !className) return null;
        return { name, className };
    },
};

// Dynamic URL patterns (need to parse context from DOM)
const DYNAMIC_URL_PATTERNS: DynamicTitleConfig[] = [
    // CDIO course details
    {
        pattern: /^\/training\/viewmodulescdiosv\//,
        icon: '📖',
        getTitleFn: () => {
            const header = DOM.panelHeader();
            if (!header) return null;
            const info = DOM.parseCourseInfo(header);
            return info ? `${info.name} (${info.code})` : null;
        },
    },
    // Regular course details
    {
        pattern: /^\/training\/viewcourseindustry2\//,
        icon: '📖',
        getTitleFn: () => {
            const header = DOM.panelHeader();
            if (!header) return null;
            const info = DOM.parseCourseInfo(header);
            return info ? `${info.name} (${info.code})` : null;
        },
    },
    // Class exam results
    {
        pattern: /^\/student\/result\/viewexamresultclass/,
        icon: '👥',
        getTitleFn: () => {
            const info = DOM.classInfo();
            return info ? `KQ thi - ${info.subjectName} - ${info.classCode}` : null;
        },
    },
    // Class academic results
    {
        pattern: /^\/student\/result\/viewstudyresultclass/,
        icon: '👥',
        getTitleFn: () => {
            const info = DOM.classInfo();
            return info ? `KQ HT - ${info.subjectName} - ${info.classCode}` : null;
        },
    },
    // Friend academic results
    {
        pattern: /^\/student\/result\/viewstudyresult\?/,
        icon: '👤',
        getTitleFn: () => {
            const info = DOM.friendInfo();
            return info ? `KQ - ${info.name} - ${info.className}` : null;
        },
    },
    // Friend exam results
    {
        pattern: /^\/student\/result\/viewexamresult\?/,
        icon: '👤',
        getTitleFn: () => {
            const info = DOM.friendInfo();
            return info ? `KQ thi - ${info.name} - ${info.className}` : null;
        },
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

        // 2. Try dynamic patterns
        for (const config of DYNAMIC_URL_PATTERNS) {
            if (config.pattern.test(pathAndQuery)) {
                const title = config.getTitleFn();
                // null = DOM not ready yet, need to continue observing
                if (title === null) {
                    return false;
                }
                this.setTitle(`${config.icon} ${title}`);
                return true;
            }
        }

        // 3. Fallback: use panel header if available
        // const panelHeader = DOM.panelHeader();
        // if (panelHeader) {
        //     this.setTitle(`📄 ${panelHeader}`);
        //     return true;
        // }

        // 4. Keep original title if nothing matches
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
        // Restore original title
        document.title = this.originalTitle;

        // Abort any running observation
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }
}
