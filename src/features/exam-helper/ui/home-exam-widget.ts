/**
 * Exam Helper - Home Exam Widget Component
 * Injects a sleek "Upcoming Exams" widget on HaUI's Homepage when exams are near.
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
    onDownloadClick?: () => void;
}

/**
 * Creates the Home Upcoming Exams Widget if there are exams within the next 14 days.
 *
 * @param scheduleEntries - Cached schedule entries (has room/SBD)
 * @param planEntries - Cached plan entries (fallback if schedule not yet available)
 * @param callbacks - Optional action callbacks (e.g. onDownloadClick)
 * @returns HTMLDivElement or null if no upcoming exams
 */
export function createHomeExamWidget(
    scheduleEntries?: ExamScheduleEntry[],
    planEntries?: ExamPlanEntry[],
    callbacks: HomeExamWidgetCallbacks = {}
): HTMLDivElement | null {
    const upcomingList = getUpcomingExamsList(scheduleEntries, planEntries);
    if (upcomingList.length === 0) return null;

    const widget = document.createElement('div');
    widget.className = styles.homeExamWidget;

    // Header
    const header = document.createElement('div');
    header.className = styles.widgetHeader;

    const title = document.createElement('h4');
    title.className = styles.widgetTitle;
    title.innerHTML = `📢 Lịch thi sắp tới (${upcomingList.length} môn)`;

    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 8px; align-items: center;';

    if (callbacks.onDownloadClick) {
        const downloadBtn = document.createElement('button');
        downloadBtn.type = 'button';
        downloadBtn.className = 'btn btn-xs btn-primary';
        downloadBtn.innerHTML = '📥 Tải lịch';
        downloadBtn.title = 'Tải file ICS cho lịch thi sắp tới';
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            callbacks.onDownloadClick?.();
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

    // List
    const list = document.createElement('div');
    list.className = styles.examList;

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

        list.appendChild(card);
    }

    widget.appendChild(list);
    return widget;
}
