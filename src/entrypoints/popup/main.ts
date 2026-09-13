import { browser } from 'wxt/browser';
import type { AppSettings } from '@/types';
import type { ExamScheduleEntry, ExamPlanEntry } from '@/features/exam-helper/types';
import { parseDateVN } from '@/utils/date';

interface FeatureDef {
    id: string;
    name: string;
    description: string;
    isSubSetting?: boolean;
}

const FEATURES: FeatureDef[] = [
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
        id: 'remove-snowfall',
        name: 'Tắt hiệu ứng tuyết rơi',
        description: 'Loại bỏ script tuyết rơi trang trí gây chậm trang web',
    },
];

async function initPopup(): Promise<void> {
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

    // 3. Donate button
    document.getElementById('donate-btn')?.addEventListener('click', () => {
        browser.tabs.create({ url: 'https://img.vietqr.io/image/TPB-07602987000-qr_only.png' });
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

    const stored = await browser.storage.local.get(['app_settings', 'captcha_undo_telex']);
    const appSettings = (stored.app_settings || {
        logLevel: 'warn',
        features: {},
    }) as AppSettings;
    const undoTelex = stored.captcha_undo_telex ?? true;

    for (const feat of FEATURES) {
        const item = document.createElement('div');
        item.className = 'toggle-item';

        const isChecked = feat.isSubSetting ? undoTelex : (appSettings.features?.[feat.id] ?? true);

        item.innerHTML = `
            <div class="toggle-info">
                <span class="toggle-title">${feat.name}</span>
                <span class="toggle-desc">${feat.description}</span>
            </div>
            <label class="switch">
                <input type="checkbox" data-id="${feat.id}" ${isChecked ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        `;

        const checkbox = item.querySelector<HTMLInputElement>('input');
        checkbox?.addEventListener('change', async (e) => {
            const checked = (e.target as HTMLInputElement).checked;

            if (feat.isSubSetting) {
                await browser.storage.local.set({
                    captcha_undo_telex: checked,
                    'feat:captcha-helper.undoTelex': checked,
                });
            } else {
                if (!appSettings.features) appSettings.features = {};
                appSettings.features[feat.id] = checked;
                await browser.storage.local.set({
                    app_settings: appSettings,
                });
            }
        });

        listEl.appendChild(item);
    }
}

document.addEventListener('DOMContentLoaded', initPopup);
