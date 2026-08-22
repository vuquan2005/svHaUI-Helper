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
 * Creates the Home Upcoming Exams Widget if there are exams within the next 14 days.
 *
 * @param scheduleEntries - Cached schedule entries (has room/SBD)
 * @param planEntries - Cached plan entries (fallback if schedule not yet available)
 * @returns HTMLDivElement or null if no upcoming exams
 */
export function createHomeExamWidget(
    scheduleEntries?: ExamScheduleEntry[],
    planEntries?: ExamPlanEntry[]
): HTMLDivElement | null {
    const rawList: UnifiedUpcomingExam[] = [];

    // Prioritize schedule entries (has room/SBD)
    if (scheduleEntries && scheduleEntries.length > 0) {
        for (const s of scheduleEntries) {
            rawList.push({
                course: s.course,
                examDate: s.examDate,
                examTime: s.examTime,
                room: s.room,
                building: s.building,
                sbd: s.sbd,
            });
        }
    } else if (planEntries && planEntries.length > 0) {
        for (const p of planEntries) {
            rawList.push({
                course: p.course,
                examDate: p.examDate,
                examTime: p.examTime,
            });
        }
    }

    if (rawList.length === 0) return null;

    // Filter upcoming exams (next 14 days)
    const upcomingList = rawList
        .map((exam) => {
            const countdown = getExamCountdown(exam.examDate, exam.examTime);
            return { exam, countdown };
        })
        .filter(({ countdown }) => countdown.direction === 1 && countdown.days <= 14)
        .sort((a, b) => a.countdown.diffMs - b.countdown.diffMs)
        .slice(0, 4); // Show top 4 closest exams

    if (upcomingList.length === 0) return null;

    const widget = document.createElement('div');
    widget.className = styles.homeExamWidget;

    // Header
    const header = document.createElement('div');
    header.className = styles.widgetHeader;

    const title = document.createElement('h4');
    title.className = styles.widgetTitle;
    title.innerHTML = `📢 Lịch thi sắp tới (${upcomingList.length} môn)`;

    const viewAll = document.createElement('a');
    viewAll.className = styles.viewAllLink;
    viewAll.href = '/student/schedulefees/transactionmodules';
    viewAll.innerHTML = 'Xem chi tiết &rarr;';

    header.appendChild(title);
    header.appendChild(viewAll);
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
