/**
 * Home Shortcuts Definitions & Sort Order
 * Contains missing shortcut definitions and the optimal logical ordering for the homepage Action Grid.
 */

export interface ShortcutItem {
    id: string;
    title: string;
    description: string;
    href: string;
    iconClass: string;
    colorClass: string;
}

/**
 * Additional shortcuts that are not present in HaUI's default action grid
 */
export const ADDITIONAL_SHORTCUTS: ShortcutItem[] = [
    {
        id: 'blearning',
        title: 'Học kết hợp',
        description: 'B-Learning học và kiểm tra',
        href: '/sso/blearning',
        iconClass: 'mdi mdi-laptop',
        colorClass: 'cttsv-action-orange',
    },
    {
        id: 'elearning',
        title: 'Học trực tuyến',
        description: 'Lớp học trực tuyến LMS',
        href: '/sso/elearning',
        iconClass: 'mdi mdi-desktop-windows',
        colorClass: 'cttsv-action-cyan',
    },
    {
        id: 'exam-plan',
        title: 'Kế hoạch thi',
        description: 'Dự kiến lịch thi và ca thi',
        href: '/student/schedulefees/examplant',
        iconClass: 'mdi mdi-calendar-alt',
        colorClass: 'cttsv-action-purple',
    },
    {
        id: 'register',
        title: 'Đăng ký học phần',
        description: 'Cổng đăng ký môn học trực tuyến',
        href: '/register/',
        iconClass: 'mdi mdi-edit',
        colorClass: 'cttsv-action-red',
    },
    {
        id: 'course-registration-survey',
        title: 'ĐKHP dự kiến',
        description: 'Khảo sát nguyện vọng học phần',
        href: '/register/dangkyhocphan',
        iconClass: 'mdi mdi-calendar-check',
        colorClass: 'cttsv-action-green',
    },
    {
        id: 'curriculum',
        title: 'Khung chương trình',
        description: 'Lộ trình đào tạo toàn khóa',
        href: '/training/viewcourseindustry',
        iconClass: 'mdi mdi-format-list-bulleted',
        colorClass: 'cttsv-action-purple',
    },
    {
        id: 'semester-modules',
        title: 'Khung theo kỳ',
        description: 'Học phần theo từng kỳ học',
        href: '/training/programmodulessemester',
        iconClass: 'mdi mdi-view-module',
        colorClass: 'cttsv-action-blue',
    },
];

/**
 * Logical sorting order for all action cards (both native and injected)
 * Grouped logically:
 * 1. Học tập & Trực tuyến
 * 2. Kết quả & Thi cử
 * 3. Đăng ký & Khung chương trình
 * 4. Dịch vụ & Cá nhân
 */
export const SHORTCUT_SORT_ORDER: string[] = [
    // Dịch vụ & Cá nhân
    '/student/userdetail/userdetail',
    '/student/recharge/inpatientpayment',
    '/student/recharge/serviceonegate',
    '/survey',

    // Đăng ký & Khung chương trình
    '/training/viewcourseindustry',
    '/training/programmodulessemester',
    '/register',
    '/register/dangkyhocphan',

    // Kết quả & Thi cử
    '/student/result/studyresults',
    '/student/result/examresult',
    '/student/schedulefees/transactionmodules',
    '/student/schedulefees/examplant',

    // Học tập & Trực tuyến
    '/sso/blearning',
    '/sso/elearning',
    '/timestable/calendarcl',
];
