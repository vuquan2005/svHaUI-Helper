/**
 * Exam Helper - Home Exam Widget Component
 * Injects an always-visible "Upcoming Exams" widget on HaUI's Homepage.
 */

import { ExamScheduleEntry, ExamPlanEntry } from '../types';
import { getExamCountdown } from '../time-utils';
import { getBadgeClass } from './plan-table-view';
import styles from '../style.module.scss';

export interface UnifiedUpcomingExam {
    course: string;
    examDate: string;
    examTime: string;
    room?: string;
    building?: string;
    sbd?: string;
}

/**
 * Extracts and unifies upcoming exams from schedule and plan entries.
 */
export function getUpcomingExamsList(
    scheduleEntries?: ExamScheduleEntry[],
    planEntries?: ExamPlanEntry[],
    now: Date = new Date(),
    maxDays = 14
): Array<{ exam: UnifiedUpcomingExam; countdown: ReturnType<typeof getExamCountdown> }> {
    const rawMap = new Map<string, UnifiedUpcomingExam>();

    // 1. Add from plan entries first (has all current semester courses)
    if (planEntries && planEntries.length > 0) {
        for (const p of planEntries) {
            rawMap.set(p.course.trim().toLowerCase(), {
                course: p.course,
                examDate: p.examDate,
                examTime: p.examTime,
            });
        }
    }

    // 2. Overlay / Merge with schedule entries (provides room, building, sbd)
    if (scheduleEntries && scheduleEntries.length > 0) {
        for (const s of scheduleEntries) {
            const key = s.course.trim().toLowerCase();
            const existing = rawMap.get(key);
            rawMap.set(key, {
                course: s.course,
                examDate: s.examDate,
                examTime: s.examTime,
                room: s.room || existing?.room,
                building: s.building || existing?.building,
                sbd: s.sbd || existing?.sbd,
            });
        }
    }

    const rawList = Array.from(rawMap.values());
    if (rawList.length === 0) return [];

    return rawList
        .map((exam) => {
            const countdown = getExamCountdown(exam.examDate, exam.examTime, now);
            return { exam, countdown };
        })
        .filter(({ countdown }) => countdown.direction === 1 && countdown.days <= maxDays)
        .sort((a, b) => a.countdown.diffMs - b.countdown.diffMs)
        .slice(0, 4);
}

export interface HomeExamWidgetCallbacks {
    onDownloadClick?: (btn: HTMLButtonElement) => void;
    onSyncClick?: (btn: HTMLButtonElement) => void;
}

/**
 * Creates the Home Upcoming Exams Widget (always visible).
 *
 * @param scheduleEntries - Cached schedule entries (has room/SBD)
 * @param planEntries - Cached plan entries (fallback if schedule not yet available)
 * @param callbacks - Optional action callbacks (e.g. onDownloadClick, onSyncClick)
 * @returns HTMLDivElement of the widget
 */
export function createHomeExamWidget(
    scheduleEntries?: ExamScheduleEntry[],
    planEntries?: ExamPlanEntry[],
    callbacks: HomeExamWidgetCallbacks = {}
): HTMLDivElement {
    const widget = document.createElement('div');
    widget.className = styles.homeExamWidget;

    // Header
    const header = document.createElement('div');
    header.className = styles.widgetHeader;

    const title = document.createElement('h4');
    title.className = styles.widgetTitle;

    const actions = document.createElement('div');
    actions.className = 'widget-actions';
    actions.style.cssText = 'display: flex; gap: 8px; align-items: center;';

    if (callbacks.onSyncClick) {
        const syncBtn = document.createElement('button');
        syncBtn.type = 'button';
        syncBtn.className = 'btn btn-xs btn-default home-sync-btn';
        syncBtn.innerHTML = '🔄 Đồng bộ';
        syncBtn.title = 'Đồng bộ lại lịch thi và phòng thi mới nhất';
        syncBtn.addEventListener('click', (e) => {
            e.preventDefault();
            callbacks.onSyncClick?.(syncBtn);
        });
        actions.appendChild(syncBtn);
    }

    if (callbacks.onDownloadClick) {
        const downloadBtn = document.createElement('button');
        downloadBtn.type = 'button';
        downloadBtn.className = 'btn btn-xs btn-primary home-download-btn';
        downloadBtn.innerHTML = '📥 Tải lịch';
        downloadBtn.title = 'Tải file ICS cho lịch thi sắp tới';
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            callbacks.onDownloadClick?.(downloadBtn);
        });
        actions.appendChild(downloadBtn);
    }

    const viewAll = document.createElement('a');
    viewAll.className = styles.viewAllLink;
    viewAll.href = '/student/schedulefees/transactionmodules';
    viewAll.innerHTML = 'Chi tiết &rarr;';
    actions.appendChild(viewAll);

    header.appendChild(title);
    header.appendChild(actions);
    widget.appendChild(header);

    // Body (List / Empty State)
    const listContainer = document.createElement('div');
    listContainer.className = styles.examList;
    widget.appendChild(listContainer);

    // Initial render of content
    updateHomeExamWidget(widget, scheduleEntries, planEntries);

    return widget;
}

/**
 * Updates the exam cards and title inside an existing HomeExamWidget.
 */
export function updateHomeExamWidget(
    widget: HTMLElement,
    scheduleEntries?: ExamScheduleEntry[],
    planEntries?: ExamPlanEntry[]
): void {
    const upcomingList = getUpcomingExamsList(scheduleEntries, planEntries);
    const listContainer = widget.querySelector(`.${styles.examList}`);
    const title = widget.querySelector(`.${styles.widgetTitle}`);
    const downloadBtn = widget.querySelector<HTMLButtonElement>('.home-download-btn');

    if (upcomingList.length > 0) {
        if (title) {
            title.innerHTML = `📢 Lịch thi sắp tới (${upcomingList.length} môn)`;
        }
        if (downloadBtn) {
            downloadBtn.style.display = '';
        }

        if (listContainer) {
            listContainer.innerHTML = '';
            for (const { exam, countdown } of upcomingList) {
                const card = document.createElement('div');
                card.className = styles.examCard;
                const badgeClass = getBadgeClass(countdown.urgency);

                let locationHtml = '';
                if (exam.room && exam.building) {
                    locationHtml = `<div class="${styles.examLocation}">📍 Phòng: <strong>${exam.room} - ${exam.building}</strong> ${exam.sbd ? `(SBD: ${exam.sbd})` : ''}</div>`;
                }

                card.innerHTML = `
                    <div class="${styles.courseName}">${exam.course}</div>
                    <div class="${styles.examMeta}">
                        <span>🗓️ ${exam.examTime} ngày ${exam.examDate}</span>
                        <span class="${styles.badge} ${badgeClass}">${countdown.shortLabel}</span>
                    </div>
                    ${locationHtml}
                `;
                listContainer.appendChild(card);
            }
        }
    } else {
        if (title) {
            title.innerHTML = '📢 Lịch thi & Kế hoạch thi';
        }
        // If there are no upcoming exams, keep download button available if plan has entries, or hide
        if (downloadBtn) {
            downloadBtn.style.display = planEntries && planEntries.length > 0 ? '' : 'none';
        }

        if (listContainer) {
            const message =
                planEntries && planEntries.length > 0
                    ? '✨ Hiện tại không có môn thi nào diễn ra trong 14 ngày tới.'
                    : '📭 Chưa có dữ liệu lịch thi. Hãy bấm "Đồng bộ" để tải tự động.';

            listContainer.innerHTML = `
                <div class="${styles.emptyState}">
                    <span>${message}</span>
                </div>
            `;
        }
    }
}

/**
 * Mounts the upcoming exams widget into the home dashboard DOM.
 * Strictly guards against unauthenticated / login views (div.splash-container).
 *
 * @param widget - The widget element to mount
 * @param root - The root document or container to search within (defaults to document)
 * @returns boolean indicating whether the widget was successfully mounted
 */
export function mountHomeExamWidget(
    widget: HTMLElement,
    root: Document | HTMLElement = typeof document !== 'undefined' ? document : ({} as Document)
): boolean {
    if (!root || typeof root.querySelector !== 'function') return false;

    // 1. Guard: Never mount on unauthenticated / login page
    if (
        root.querySelector('div.splash-container') ||
        root.querySelector('input#ctl00_inpUserName')
    ) {
        return false;
    }

    // 2. Locate the main dashboard container
    const dashboard =
        root.querySelector('div.cttsv-dashboard') ||
        root.querySelector('.be-content') ||
        root.querySelector('div.main-content');
    if (!dashboard) return false;

    // 3. Avoid injecting duplicate widgets
    if (widget.isConnected || dashboard.querySelector(`.${styles.homeExamWidget}`)) {
        return true;
    }

    // 4. Target insertion point: overview section or action grid
    const target =
        dashboard.querySelector('section.cttsv-overview-section') ||
        dashboard.querySelector('section.cttsv-action-grid, div.cttsv-action-grid');

    // Strictly require a valid dashboard section to prevent injecting into unexpected views
    if (!target) return false;

    dashboard.insertBefore(widget, target);
    return true;
}
