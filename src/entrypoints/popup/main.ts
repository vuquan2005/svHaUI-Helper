import { browser } from 'wxt/browser';
import type { AppSettings } from '@/types';
import type { ExamScheduleEntry, ExamPlanEntry } from '@/features/exam-helper/types';
import { parseDateVN } from '@/utils/date';

interface FeatureDef {
    id: string;
    name: string;
    description: string;
    isSubSetting?: boolean;
    parentFeatureId?: string;
    type?: 'switch' | 'theme-selector';
}

const FEATURES: FeatureDef[] = [
    {
        id: 'dark-mode',
        name: 'Giao diện tối (Dark Mode)',
        description: 'Chế độ nền tối bảo vệ mắt cho toàn bộ website và tiện ích',
    },
    {
        id: 'dark_mode_system',
        name: 'Tự động theo hệ thống',
        description: 'Chỉ bật khi máy tính/điện thoại ở chế độ tối',
        isSubSetting: true,
        parentFeatureId: 'dark-mode',
    },
    {
        id: 'dark_mode_theme',
        name: 'Kiểu giao diện tối',
        description: 'Tùy chọn sắc thái màu tối hiển thị',
        isSubSetting: true,
        parentFeatureId: 'dark-mode',
        type: 'theme-selector',
    },
    {
        id: 'captcha-helper',
        name: 'Tự động giải Captcha',
        description: 'Mô hình AI PP-OCRv4 nhận diện và tự điền mã bảo vệ',
    },
    {
        id: 'captcha_undo_telex',
        name: 'Sửa lỗi gõ Telex ô Captcha',
        description: 'Tự chuyển chữ có dấu thành phím gõ gốc khi nhập mã',
        isSubSetting: true,
        parentFeatureId: 'captcha-helper',
    },
    {
        id: 'exam-helper',
        name: 'Hỗ trợ Lịch thi & Xuất ICS',
        description: 'Đếm ngược ngày thi, tô màu lịch thi và xuất lịch chuẩn .ics',
    },
    {
        id: 'export-timetable',
        name: 'Xuất Thời khóa biểu',
        description: 'Trích xuất lịch học và xuất ra file lịch .ics',
    },
    {
        id: 'grade-prediction',
        name: 'Tính GPA & Dự đoán điểm',
        description: 'Tính điểm TBHK, CPA và mô phỏng điểm số cần đạt',
    },
    {
        id: 'grade-navigation',
        name: 'Điều hướng bảng điểm',
        description: 'Xem chi tiết môn học, phân lớp và kết quả bạn bè',
    },
    {
        id: 'dynamic-title',
        name: 'Đổi tiêu đề Tab thông minh',
        description: 'Hiển thị tên học phần/mục đang xem trên tiêu đề tab',
    },
    {
        id: 'home-shortcuts',
        name: 'Phím tắt trang chủ',
        description: 'Bổ sung thanh lối tắt nhanh tại Dashboard sinh viên',
    },
    {
        id: 'survey-autofill',
        name: 'Tự động điền khảo sát',
        description: 'Tự động trả lời nhanh các câu hỏi khảo sát học kỳ',
    },
    {
        id: 'thesis-registration',
        name: 'Tra cứu Đề tài ĐA/KLTN',
        description: 'Hiển thị danh sách đề tài của tất cả giảng viên mà không cần tải lại trang',
    },
    {
        id: 'remove-snowfall',
        name: 'Tắt hiệu ứng tuyết rơi',
        description: 'Loại bỏ script tuyết rơi trang trí gây chậm trang web',
    },
];

async function syncPopupTheme(): Promise<void> {
    const stored = await browser.storage.local.get([
        'app_settings',
        'dark_mode_system',
        'dark_mode_theme',
    ]);
    const appSettings = stored.app_settings as { features?: Record<string, boolean> } | undefined;
    const isEnabled = appSettings?.features?.['dark-mode'] ?? false;
    const isSystem = Boolean(stored.dark_mode_system);
    const themeVariant = (stored.dark_mode_theme as string) === 'midnight' ? 'midnight' : 'slate';

    const isDark =
        isEnabled && (!isSystem || window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('sv-dark', isDark);
    document.documentElement.classList.toggle(
        'sv-dark-midnight',
        isDark && themeVariant === 'midnight'
    );
}

async function initPopup(): Promise<void> {
    // 0. Theme synchronization
    await syncPopupTheme();

    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => void syncPopupTheme());

    browser.storage.onChanged.addListener((changes, areaName) => {
        if (
            areaName === 'local' &&
            (changes.app_settings || changes.dark_mode_system || changes.dark_mode_theme)
        ) {
            void syncPopupTheme();
        }
    });

    // 1. Version display
    const versionEl = document.getElementById('app-version');
    if (versionEl && typeof __APP_VERSION__ !== 'undefined') {
        versionEl.textContent = `v${__APP_VERSION__}`;
    }

    // 2. Navigation buttons
    document.querySelectorAll<HTMLButtonElement>('.nav-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const url = btn.dataset.url;
            if (url) {
                browser.tabs.create({ url });
            }
        });
    });

    // 3. Donate modal
    const donateModal = document.getElementById('donate-modal');
    const openDonateModal = () => {
        donateModal?.classList.add('is-visible');
    };
    const closeDonateModal = () => {
        donateModal?.classList.remove('is-visible');
    };

    document.getElementById('donate-btn')?.addEventListener('click', openDonateModal);
    document.getElementById('donate-close-btn')?.addEventListener('click', closeDonateModal);
    document.getElementById('donate-backdrop')?.addEventListener('click', closeDonateModal);

    document.getElementById('copy-acc-btn')?.addEventListener('click', async (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        try {
            await navigator.clipboard.writeText('07602987000');
            btn.textContent = '✅';
            setTimeout(() => {
                btn.textContent = '📋';
            }, 2000);
        } catch {
            // fallback
        }
    });

    // 4. Upcoming Exam Widget
    await renderUpcomingExam();

    // 5. Feature Toggles
    await renderFeatureToggles();
}

async function renderUpcomingExam(): Promise<void> {
    const courseEl = document.getElementById('exam-course');
    const timeEl = document.getElementById('exam-time');
    const roomEl = document.getElementById('exam-room');
    const countdownEl = document.getElementById('exam-countdown');

    if (!courseEl || !timeEl || !roomEl || !countdownEl) return;

    try {
        const stored = await browser.storage.local.get([
            'feat:exam-helper.scheduleEntries',
            'feat:exam-helper.planEntries',
        ]);

        const scheduleEntries = (stored['feat:exam-helper.scheduleEntries'] ||
            []) as ExamScheduleEntry[];
        const planEntries = (stored['feat:exam-helper.planEntries'] || []) as ExamPlanEntry[];

        // Combine entries to find closest upcoming exam
        const candidates: Array<{
            course: string;
            dateStr: string;
            timeStr: string;
            room?: string;
            building?: string;
            date: Date;
        }> = [];

        const now = new Date();
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        for (const s of scheduleEntries) {
            const d = parseDateVN(s.examDate);
            if (d && d.getTime() >= todayZero) {
                candidates.push({
                    course: s.course,
                    dateStr: s.examDate,
                    timeStr: s.examTime,
                    room: s.room ? `Phòng ${s.room}` : undefined,
                    building: s.building ? `(Nhà ${s.building})` : undefined,
                    date: d,
                });
            }
        }

        if (candidates.length === 0) {
            for (const p of planEntries) {
                const d = parseDateVN(p.examDate);
                if (d && d.getTime() >= todayZero) {
                    candidates.push({
                        course: p.course,
                        dateStr: p.examDate,
                        timeStr: p.examTime,
                        date: d,
                    });
                }
            }
        }

        candidates.sort((a, b) => a.date.getTime() - b.date.getTime());

        const nextExam = candidates[0];
        if (!nextExam) {
            courseEl.textContent = 'Chưa có lịch thi hoặc đã kết thúc kỳ thi';
            timeEl.textContent = 'Mở trang Lịch thi để tự động đồng bộ';
            roomEl.textContent = '';
            countdownEl.textContent = 'Không có';
            return;
        }

        const diffDays = Math.ceil((nextExam.date.getTime() - todayZero) / (24 * 60 * 60 * 1000));
        let countdownText = 'Hôm nay';
        if (diffDays === 1) countdownText = 'Ngày mai';
        else if (diffDays > 1) countdownText = `Còn ${diffDays} ngày`;

        courseEl.textContent = nextExam.course;
        timeEl.textContent = `📅 ${nextExam.dateStr} - ⏰ ${nextExam.timeStr}`;
        roomEl.textContent = [nextExam.room, nextExam.building].filter(Boolean).join(' ') || '';
        countdownEl.textContent = countdownText;
    } catch {
        courseEl.textContent = 'Không thể tải thông tin lịch thi';
        countdownEl.textContent = '--';
    }
}

async function renderFeatureToggles(): Promise<void> {
    const listEl = document.getElementById('toggles-list');
    if (!listEl) return;

    listEl.innerHTML = '';

    const stored = await browser.storage.local.get([
        'app_settings',
        'captcha_undo_telex',
        'dark_mode_system',
        'dark_mode_theme',
    ]);
    const appSettings = (stored.app_settings || {
        logLevel: 'warn',
        features: {},
    }) as AppSettings;
    const undoTelex =
        stored.captcha_undo_telex !== undefined ? Boolean(stored.captcha_undo_telex) : true;
    const darkModeSystem = Boolean(stored.dark_mode_system);

    for (const feat of FEATURES) {
        const item = document.createElement('div');
        item.className = feat.isSubSetting ? 'toggle-item toggle-item-sub' : 'toggle-item';

        const isParentEnabled = feat.parentFeatureId
            ? feat.parentFeatureId === 'dark-mode'
                ? (appSettings.features?.['dark-mode'] ?? false)
                : (appSettings.features?.[feat.parentFeatureId] ?? true)
            : true;

        if (feat.parentFeatureId) {
            item.setAttribute('data-parent', feat.parentFeatureId);
            if (!isParentEnabled) {
                item.classList.add('is-disabled');
            }
        }

        if (feat.type === 'theme-selector') {
            const currentTheme =
                (stored.dark_mode_theme as string) === 'midnight' ? 'midnight' : 'slate';
            item.innerHTML = `
                <div class="toggle-info">
                    <span class="toggle-title">${feat.name}</span>
                    <span class="toggle-desc">${feat.description}</span>
                </div>
                <div class="theme-segmented">
                    <button type="button" class="theme-btn ${currentTheme === 'slate' ? 'is-active' : ''}" data-theme="slate" ${!isParentEnabled ? 'disabled' : ''} title="Xanh than (Slate) - Dịu mắt">
                        <span class="theme-dot dot-slate"></span>
                        <span>Xanh than</span>
                    </button>
                    <button type="button" class="theme-btn ${currentTheme === 'midnight' ? 'is-active' : ''}" data-theme="midnight" ${!isParentEnabled ? 'disabled' : ''} title="Đen sâu (Midnight) - AMOLED">
                        <span class="theme-dot dot-midnight"></span>
                        <span>Đen sâu</span>
                    </button>
                </div>
            `;

            const themeBtns = item.querySelectorAll<HTMLButtonElement>('.theme-btn');
            themeBtns.forEach((btn) => {
                btn.addEventListener('click', async () => {
                    const theme = btn.dataset.theme as 'slate' | 'midnight';
                    if (!theme || btn.classList.contains('is-active')) return;
                    await browser.storage.local.set({ dark_mode_theme: theme });
                    themeBtns.forEach((b) =>
                        b.classList.toggle('is-active', b.dataset.theme === theme)
                    );
                    await syncPopupTheme();
                });
            });

            listEl.appendChild(item);
            continue;
        }

        let isChecked: boolean;
        if (feat.id === 'captcha_undo_telex') {
            isChecked = undoTelex;
        } else if (feat.id === 'dark_mode_system') {
            isChecked = darkModeSystem;
        } else if (feat.id === 'dark-mode') {
            isChecked = appSettings.features?.[feat.id] ?? false;
        } else {
            isChecked = appSettings.features?.[feat.id] ?? true;
        }

        item.innerHTML = `
            <div class="toggle-info">
                <span class="toggle-title">${feat.name}</span>
                <span class="toggle-desc">${feat.description}</span>
            </div>
            <label class="switch">
                <input type="checkbox" data-id="${feat.id}" ${isChecked ? 'checked' : ''} ${!isParentEnabled ? 'disabled' : ''}>
                <span class="slider"></span>
            </label>
        `;

        const checkbox = item.querySelector<HTMLInputElement>('input');
        checkbox?.addEventListener('change', async (e) => {
            const checked = (e.target as HTMLInputElement).checked;

            if (feat.id === 'captcha_undo_telex') {
                await browser.storage.local.set({
                    captcha_undo_telex: checked,
                    'feat:captcha-helper.undoTelex': checked,
                });
            } else if (feat.id === 'dark_mode_system') {
                await browser.storage.local.set({
                    dark_mode_system: checked,
                });
                await syncPopupTheme();
            } else {
                if (!appSettings.features) appSettings.features = {};
                appSettings.features[feat.id] = checked;
                await browser.storage.local.set({
                    app_settings: appSettings,
                });
                if (feat.id === 'dark-mode') {
                    await syncPopupTheme();
                }

                // Update sub-settings if this feature is a parent
                const childItems = listEl.querySelectorAll<HTMLElement>(
                    `[data-parent="${feat.id}"]`
                );
                childItems.forEach((childItem) => {
                    childItem.classList.toggle('is-disabled', !checked);
                    const childInput = childItem.querySelector<HTMLInputElement>('input');
                    if (childInput) {
                        childInput.disabled = !checked;
                    }
                    const childButtons =
                        childItem.querySelectorAll<HTMLButtonElement>('.theme-btn');
                    childButtons.forEach((btn) => {
                        btn.disabled = !checked;
                    });
                });
            }
        });

        listEl.appendChild(item);
    }
}

document.addEventListener('DOMContentLoaded', initPopup);
