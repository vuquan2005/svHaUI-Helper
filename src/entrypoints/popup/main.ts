import { browser } from 'wxt/browser';
import { renderFeatureToggles, syncSettingsTheme } from '@/ui/settings/controls';
import type { ExamScheduleEntry, ExamPlanEntry } from '@/features/exam-helper/types';
import { parseDateVN } from '@/utils/date';

async function initPopup(): Promise<void> {
    // 0. Theme synchronization
    await syncSettingsTheme();

    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => void syncSettingsTheme());

    browser.storage.onChanged.addListener((changes, areaName) => {
        if (
            areaName === 'local' &&
            (changes.app_settings || changes.dark_mode_system || changes.dark_mode_theme)
        ) {
            void syncSettingsTheme();
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
    const toggles = document.getElementById('toggles-list');
    if (toggles) await renderFeatureToggles(toggles);
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

document.addEventListener('DOMContentLoaded', initPopup);
