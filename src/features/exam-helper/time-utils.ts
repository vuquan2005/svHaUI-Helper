/**
 * Exam Helper - Time & Countdown Utilities
 */

import { parseExamTime } from './exam-ics-generator';

export type ExamUrgency = 'urgent' | 'warning' | 'notice' | 'normal' | 'passed';

export interface CountdownInfo {
    /** Time difference in ms */
    diffMs: number;
    /** Remaining days */
    days: number;
    /** Remaining hours */
    hours: number;
    /** Remaining minutes */
    minutes: number;
    /** 1 if exam is in future, -1 if in past */
    direction: 1 | -1;
    /** Urgency level for color coding */
    urgency: ExamUrgency;
    /** Formatted human-readable string */
    label: string;
    /** Short label (e.g. "Còn 2 ngày", "Hôm nay", "Đã thi") */
    shortLabel: string;
}

/**
 * Parse an exam date (dd/MM/yyyy) and exam time (H'h'mm) into a local Date object.
 */
export function parseExamDateTime(examDate: string, examTime: string): Date | null {
    const dateParts = examDate.split('/');
    if (dateParts.length !== 3) return null;

    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
    const year = parseInt(dateParts[2], 10);

    const normalizedTime = parseExamTime(examTime);
    if (!normalizedTime) return null;

    const [hourStr, minuteStr] = normalizedTime.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if ([day, month, year, hour, minute].some(isNaN)) return null;

    const date = new Date(year, month, day, hour, minute);
    if (isNaN(date.getTime())) return null;

    return date;
}

/**
 * Calculate countdown information for an exam date and time.
 *
 * @param examDate - dd/MM/yyyy
 * @param examTime - H'h'mm (e.g. "7h00")
 * @param now - Current date for calculation (defaults to new Date())
 */
export function getExamCountdown(
    examDate: string,
    examTime: string,
    now: Date = new Date()
): CountdownInfo {
    const examDateTime = parseExamDateTime(examDate, examTime);

    if (!examDateTime) {
        return {
            diffMs: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            direction: 1,
            urgency: 'normal',
            label: 'Chưa rõ',
            shortLabel: 'Chưa rõ',
        };
    }

    const diffMs = examDateTime.getTime() - now.getTime();
    const absDiff = Math.abs(diffMs);
    const direction: 1 | -1 = diffMs >= 0 ? 1 : -1;

    const days = Math.floor(absDiff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((absDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((absDiff % (60 * 60 * 1000)) / (60 * 1000));

    let urgency: ExamUrgency = 'normal';
    if (direction === -1) {
        urgency = 'passed';
    } else if (days === 0 && hours < 24) {
        urgency = 'urgent';
    } else if (days <= 3) {
        urgency = 'urgent';
    } else if (days <= 7) {
        urgency = 'warning';
    } else if (days <= 14) {
        urgency = 'notice';
    }

    // Build human-readable labels
    let label: string;
    let shortLabel: string;

    if (direction === 1) {
        if (days === 0) {
            if (hours > 0) {
                label = `Còn ${hours} giờ ${minutes} phút (Hôm nay)`;
                shortLabel = `Hôm nay (${hours}h)`;
            } else {
                label = `Còn ${minutes} phút (Sắp thi)`;
                shortLabel = `Sắp thi (${minutes}p)`;
            }
        } else {
            label = `Còn ${days} ngày ${hours} giờ`;
            shortLabel = `Còn ${days} ngày`;
        }
    } else {
        if (days === 0) {
            label = `Đã thi hôm nay`;
            shortLabel = `Đã thi`;
        } else {
            label = `Đã thi (${days} ngày trước)`;
            shortLabel = `Đã thi`;
        }
    }

    return {
        diffMs,
        days,
        hours,
        minutes,
        direction,
        urgency,
        label,
        shortLabel,
    };
}
