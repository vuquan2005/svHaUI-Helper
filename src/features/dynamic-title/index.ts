/**
 * Dynamic Title Feature
 * Changes document.title based on URL and page content
 */

import { Feature } from '../../core';

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

// Static URL mapping (exact match with pathname)
const URL_TITLE_MAP: Record<string, string> = {
    // Home page
    '/': '🏠 Trang chủ',

    // Finance
    '/student/recharge/cashinqr': '💳 Nạp tiền QR',
    '/student/recharge/cashin': '💳 Nạp tiền TK',
    '/student/recharge/inpatientpayment': '💰 Thanh toán công nợ',
    '/student/recharge/transactionhistory': '📜 Lịch sử GD',
    '/student/recharge/listeinvoice': '🧾 Hóa đơn ĐT',

    // Personal information
    '/student/userdetail/userdetail': '👤 Thông tin SV',
    '/student/userdetail/updateuserprofile': '📝 Cập nhật hồ sơ',
    '/student/userdetail/usercerupdate': '🎓 TT in bằng',
    '/member/changepass': '🔐 Đổi mật khẩu',
    '/student/userdetail/militaryclothes': '🎖️ Quân tư trang',

    // Course registration
    '/register/dangkyhocphan': '📝 ĐK HP dự kiến',
    '/register/': '📝 Đăng ký HP',
    '/training/removeclasslist': '❌ Rút HP',
    '/training/statisticregister': '📊 Thống kê ĐKHP',
    '/training/viewprogram': '📚 ĐK 2 chương trình',

    // Training program
    '/training/viewcourseindustry': '📚 Khung CT',
    '/training/programmodulessemester': '📅 Khung theo kỳ',

    // Schedule & Timetable
    '/timestable/calendarct': '📆 KH đầu khóa',
    '/timestable/calendarcl': '🗓️ Thời khóa biểu',
    '/timestable/timestableview': '🗓️ Lịch giảng dạy',

    // Exam schedule
    '/student/schedulefees/examplant': '📆 Kế hoạch thi',
    '/student/schedulefees/transactionmodules': '📆 Lịch thi',
    '/student/schedulefees/testonline': '💻 Thi Online',

    // Academic results - Personal
    '/student/result/studyresults': '📊 KQ học tập',
    '/student/result/examresult': '📋 KQ thi',
    '/student/result/viewscorebysemester': '📈 ĐTB học kỳ',
    '/student/result/viewmodules': '📈 ĐTB tích lũy',
    '/student/result/sendreceiveapplications': '📨 Phúc tra',

    // Graduation
    '/tttn/htdn/list': '🎓 Thực tập TN',
    '/student/result/graduatecal': '🎓 Xét tốt nghiệp',
    '/student/result/degreeview': '🎓 TT in bằng',

    // Utilities
    '/student/application/notifilist': '📢 Thông báo trường',
    '/student/application/messengeruserlist': '📬 Thông báo cá nhân',
    '/student/recharge/serviceonegate': '🚪 Dịch vụ một cửa',
    '/messages': '💬 Chia sẻ lớp',
    '/messages/group': '💬 Chia sẻ trường',
    '/study': '📖 Học trực tuyến',
    '/survey': '� Khảo sát',
};

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
    private observer: MutationObserver | null = null;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        super({
            id: 'dynamic-title',
            name: 'Dynamic Title',
            description: 'Changes tab title based on current page',
        });
    }

    /**
     * Initialize Dynamic Title Feature
     * Update title and start observing DOM changes
     */
    init(): void {
        this.log.i('Initializing...');

        // Save original title
        this.originalTitle = document.title;

        // Update title for the first time
        const found = this.updateTitle();

        // Only observe if title not found yet (need to wait for DOM load)
        if (!found) {
            this.observeContentChanges();
        }

        this.log.i('Ready!');
    }

    /**
     * Update document title based on URL and DOM
     * @returns true if a matching title was found, false if need to wait
     */
    private updateTitle(): boolean {
        const url = window.location.pathname + window.location.search;
        const pathname = window.location.pathname;

        // 1. Try static mapping first (always succeeds if matches)
        const staticTitle = URL_TITLE_MAP[pathname];
        if (staticTitle) {
            this.setTitle(staticTitle);
            return true;
        }

        // 2. Try dynamic patterns
        for (const config of DYNAMIC_URL_PATTERNS) {
            if (config.pattern.test(url)) {
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
        const panelHeader = DOM.panelHeader();
        if (panelHeader) {
            this.setTitle(`📄 ${this.truncate(panelHeader, 30)}`);
            return true;
        }

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

    private truncate(str: string, maxLength: number): string {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - 1) + '…';
    }

    private observeContentChanges(): void {
        // Observe .be-content for dynamic content changes
        const content = document.querySelector('.be-content');
        if (!content) return;

        this.observer = new MutationObserver(() => {
            // Clear old timeout for proper debounce
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }

            this.debounceTimer = setTimeout(() => {
                this.debounceTimer = null;
                const found = this.updateTitle();
                // Stop observer when title is found
                if (found) {
                    this.log.d('Title found, stopping observer');
                    this.observer?.disconnect();
                    this.observer = null;
                }
            }, TITLE_UPDATE_DEBOUNCE_MS);
        });

        this.observer.observe(content, {
            childList: true,
            subtree: true,
        });

        this.log.d('Started observing for dynamic content');
    }

    /**
     * Cleanup resources when feature is disabled
     * Restore original title and stop observer
     */
    destroy(): void {
        // Restore original title
        document.title = this.originalTitle;

        // Stop debounce timer if running
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        // Stop observer
        this.observer?.disconnect();
        this.observer = null;
    }
}
