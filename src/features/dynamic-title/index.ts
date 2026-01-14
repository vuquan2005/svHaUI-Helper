/**
 * Dynamic Title Feature
 * Thay đổi document.title dựa trên URL và nội dung trang
 */

import { Feature } from '../../core';

// ============================================
// Title Configuration
// ============================================

interface DynamicTitleConfig {
    /** Regex để match URL (pathname + search) */
    pattern: RegExp;
    /** Icon emoji */
    icon: string;
    /** Function để tạo title từ DOM */
    getTitleFn: () => string;
}

// Static URL mapping (exact match với pathname)
const URL_TITLE_MAP: Record<string, string> = {
    // Trang chủ
    '/': '🏠 Trang chủ',

    // Tài chính
    '/student/recharge/cashinqr': '💳 Nạp tiền QR',
    '/student/recharge/cashin': '💳 Nạp tiền TK',
    '/student/recharge/inpatientpayment': '💰 Thanh toán công nợ',
    '/student/recharge/transactionhistory': '📜 Lịch sử GD',
    '/student/recharge/listeinvoice': '🧾 Hóa đơn ĐT',

    // Thông tin cá nhân
    '/student/userdetail/userdetail': '👤 Thông tin SV',
    '/student/userdetail/updateuserprofile': '📝 Cập nhật hồ sơ',
    '/student/userdetail/usercerupdate': '🎓 TT in bằng',
    '/member/changepass': '🔐 Đổi mật khẩu',
    '/student/userdetail/militaryclothes': '🎖️ Quân tư trang',

    // Đăng ký học phần
    '/register/dangkyhocphan': '📝 ĐK HP dự kiến',
    '/register/': '📝 Đăng ký HP',
    '/training/removeclasslist': '❌ Rút HP',
    '/training/statisticregister': '📊 Thống kê ĐKHP',
    '/training/viewprogram': '📚 ĐK 2 chương trình',

    // Chương trình đào tạo
    '/training/viewcourseindustry': '📚 Khung CT',
    '/training/programmodulessemester': '📅 Khung theo kỳ',

    // Lịch học & TKB
    '/timestable/calendarct': '📆 KH đầu khóa',
    '/timestable/calendarcl': '🗓️ Thời khóa biểu',
    '/timestable/timestableview': '🗓️ Lịch giảng dạy',

    // Lịch thi
    '/student/schedulefees/examplant': '📆 Kế hoạch thi',
    '/student/schedulefees/transactionmodules': '📆 Lịch thi',
    '/student/schedulefees/testonline': '💻 Thi Online',

    // Kết quả học tập - Cá nhân
    '/student/result/studyresults': '📊 KQ học tập',
    '/student/result/examresult': '📋 KQ thi',
    '/student/result/viewscorebysemester': '📈 ĐTB học kỳ',
    '/student/result/viewmodules': '📈 ĐTB tích lũy',
    '/student/result/sendreceiveapplications': '📨 Phúc tra',

    // Tốt nghiệp
    '/tttn/htdn/list': '🎓 Thực tập TN',
    '/student/result/graduatecal': '🎓 Xét tốt nghiệp',
    '/student/result/degreeview': '🎓 TT in bằng',

    // Tiện ích
    '/student/application/notifilist': '📢 Thông báo trường',
    '/student/application/messengeruserlist': '📬 Thông báo cá nhân',
    '/student/recharge/serviceonegate': '🚪 Dịch vụ một cửa',
    '/messages': '💬 Chia sẻ lớp',
    '/messages/group': '💬 Chia sẻ trường',
    '/study': '📖 Học trực tuyến',
    '/survey': '� Khảo sát',
};

// Helper functions để lấy data từ DOM
const DOM = {
    /** Lấy panel header text */
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

    /** Lấy thông tin lớp từ table đầu tiên */
    classInfo: (): { subjectName: string; classCode: string } | null => {
        const table = document.querySelector('table:first-child');
        if (!table) return null;

        const subjectName = table.querySelector('tbody > tr:first-child > td:nth-child(2)')?.textContent?.trim();
        const classCode = table.querySelector('tbody > tr:nth-child(3) > td:nth-child(2)')?.textContent?.trim();

        if (!subjectName || !classCode) return null;
        return { subjectName, classCode };
    },

    /** Lấy thông tin bạn bè từ table đầu tiên */
    friendInfo: (): { name: string; className: string } | null => {
        const table = document.querySelector('table:first-child');
        if (!table) return null;

        const name = table.querySelector('tbody > tr:first-child > td:nth-child(2)')?.textContent?.trim();
        const className = table.querySelector('tbody > tr:nth-child(3) > td:nth-child(2)')?.textContent?.trim();

        if (!name || !className) return null;
        return { name, className };
    },
};

// Dynamic URL patterns (cần parse context từ DOM)
const DYNAMIC_URL_PATTERNS: DynamicTitleConfig[] = [
    // Chi tiết học phần CDIO
    {
        pattern: /^\/training\/viewmodulescdiosv\//,
        icon: '📖',
        getTitleFn: () => {
            const header = DOM.panelHeader();
            if (!header) return 'Chi tiết HP';
            const info = DOM.parseCourseInfo(header);
            return info ? `${info.name} (${info.code})` : 'Chi tiết HP';
        },
    },
    // Chi tiết học phần thường
    {
        pattern: /^\/training\/viewcourseindustry2\//,
        icon: '📖',
        getTitleFn: () => {
            const header = DOM.panelHeader();
            if (!header) return 'Chi tiết HP';
            const info = DOM.parseCourseInfo(header);
            return info ? `${info.name} (${info.code})` : 'Chi tiết HP';
        },
    },
    // Kết quả thi lớp
    {
        pattern: /^\/student\/result\/viewexamresultclass/,
        icon: '👥',
        getTitleFn: () => {
            const info = DOM.classInfo();
            return info ? `KQ thi - ${info.subjectName} - ${info.classCode}` : 'KQ thi lớp';
        },
    },
    // Kết quả học tập lớp
    {
        pattern: /^\/student\/result\/viewstudyresultclass/,
        icon: '👥',
        getTitleFn: () => {
            const info = DOM.classInfo();
            return info ? `KQ HT - ${info.subjectName} - ${info.classCode}` : 'KQ HT lớp';
        },
    },
    // Kết quả học tập bạn bè
    {
        pattern: /^\/student\/result\/viewstudyresult\?/,
        icon: '👤',
        getTitleFn: () => {
            const info = DOM.friendInfo();
            return info ? `KQ - ${info.name} - ${info.className}` : 'KQ bạn';
        },
    },
    // Kết quả thi bạn bè
    {
        pattern: /^\/student\/result\/viewexamresult\?/,
        icon: '👤',
        getTitleFn: () => {
            const info = DOM.friendInfo();
            return info ? `KQ thi - ${info.name} - ${info.className}` : 'KQ thi bạn';
        },
    },
];

// ============================================
// Feature Implementation
// ============================================

export class DynamicTitleFeature extends Feature {
    private originalTitle: string = '';
    private observer: MutationObserver | null = null;

    constructor() {
        super({
            id: 'dynamic-title',
            name: 'Dynamic Title',
            description: 'Thay đổi tiêu đề tab dựa trên trang đang xem',
        });
    }

    init(): void {
        this.log.i('Initializing...');

        // Lưu title gốc
        this.originalTitle = document.title;

        // Update title lần đầu
        this.updateTitle();

        // Theo dõi thay đổi DOM để update title khi content thay đổi
        this.observeContentChanges();

        this.log.i('Ready!');
    }

    private updateTitle(): void {
        const url = window.location.pathname + window.location.search;
        const pathname = window.location.pathname;

        // 1. Thử static mapping trước
        const staticTitle = URL_TITLE_MAP[pathname];
        if (staticTitle) {
            this.setTitle(staticTitle);
            return;
        }

        // 2. Thử dynamic patterns
        for (const config of DYNAMIC_URL_PATTERNS) {
            if (config.pattern.test(url)) {
                const title = config.getTitleFn();
                this.setTitle(`${config.icon} ${title}`);
                return;
            }
        }

        // 3. Fallback: dùng panel header nếu có
        const panelHeader = DOM.panelHeader();
        if (panelHeader) {
            this.setTitle(`📄 ${this.truncate(panelHeader, 30)}`);
            return;
        }

        // 4. Giữ nguyên title gốc nếu không match gì
        this.log.d('No matching pattern, keeping original title');
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
            // Debounce: wait 100ms after DOM changes
            setTimeout(() => this.updateTitle(), 100);
        });

        this.observer.observe(content, {
            childList: true,
            subtree: true,
        });
    }

    destroy(): void {
        // Khôi phục title gốc
        document.title = this.originalTitle;

        // Dừng observer
        this.observer?.disconnect();
        this.observer = null;
    }
}
