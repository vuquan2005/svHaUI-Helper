/**
 * Calendar Export Feature - ICS Generator
 * Converts TimetableEntry[] to an ICS (iCalendar RFC 5545) string
 * using the `ical-generator` library.
 */

import ical, { ICalCalendarMethod, ICalEventStatus } from 'ical-generator';
import { TimetableEntry, PeriodTimeSlot } from './types';

// ============================================
// Period Time Slots (16 periods, VN local time)
// ============================================

const PERIOD_SLOTS: PeriodTimeSlot[] = [
    // Morning (tiết 1-6)
    { period: 1, start: '07:00', end: '07:50' },
    { period: 2, start: '07:50', end: '08:40' },
    { period: 3, start: '08:45', end: '09:35' },
    { period: 4, start: '09:40', end: '10:30' },
    { period: 5, start: '10:35', end: '11:25' },
    { period: 6, start: '11:25', end: '12:15' },
    // Afternoon (tiết 7-12)
    { period: 7, start: '12:30', end: '13:20' },
    { period: 8, start: '13:20', end: '14:10' },
    { period: 9, start: '14:15', end: '15:05' },
    { period: 10, start: '15:10', end: '16:00' },
    { period: 11, start: '16:05', end: '16:55' },
    { period: 12, start: '16:55', end: '17:45' },
    // Evening (tiết 13-16)
    { period: 13, start: '18:00', end: '18:50' },
    { period: 14, start: '18:50', end: '19:40' },
    { period: 15, start: '19:45', end: '20:35' },
    { period: 16, start: '20:35', end: '21:25' },
];

// ============================================
// Constants
// ============================================

/** Vietnam timezone offset in hours (UTC+7) */
const VN_UTC_OFFSET_HOURS = 7;

// ============================================
// Helpers
// ============================================

/**
 * Get the start and end times for a set of periods.
 * Uses the first period's start and last period's end.
 */
function getTimeRange(periods: number[]): { start: string; end: string } | null {
    if (periods.length === 0) return null;

    const sorted = [...periods].sort((a, b) => a - b);
    const firstSlot = PERIOD_SLOTS.find((s) => s.period === sorted[0]);
    const lastSlot = PERIOD_SLOTS.find((s) => s.period === sorted[sorted.length - 1]);

    if (!firstSlot || !lastSlot) return null;
    return { start: firstSlot.start, end: lastSlot.end };
}

/**
 * Build a UTC Date from a dd/MM/yyyy date string and an HH:mm time string (VN local time).
 * Converts VN time (UTC+7) to UTC automatically.
 *
 * @returns Date in UTC, or null if parsing fails.
 */
function buildUTCDate(dateStr: string, timeStr: string): Date | null {
    const dateParts = dateStr.split('/');
    if (dateParts.length !== 3) return null;

    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    const timeParts = timeStr.split(':');
    if (timeParts.length !== 2) return null;

    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);

    if ([day, month, year, hour, minute].some(isNaN)) return null;

    // Create UTC date by subtracting VN offset (UTC+7)
    return new Date(Date.UTC(year, month - 1, day, hour - VN_UTC_OFFSET_HOURS, minute));
}

// ============================================
// ICS Generation (using `ical-generator`)
// ============================================

/**
 * Build event description from a TimetableEntry.
 */
function buildDescription(entry: TimetableEntry): string {
    const descParts: string[] = [];

    const classPart = entry.classCode ? `Lớp: ${entry.classCode}` : '';
    const periodPart = `(${entry.periods.join(', ')})`;
    descParts.push([classPart, periodPart].filter(Boolean).join(' '));

    const gvAndPhone = [entry.lecturer, entry.phone].filter(Boolean).join(' - ');
    if (gvAndPhone) {
        descParts.push(gvAndPhone);
    }

    if (entry.department) {
        descParts.push(entry.department);
    }

    return descParts.join('\n');
}

/**
 * Generate a complete ICS calendar string from timetable entries.
 *
 * @param entries - Parsed timetable entries
 * @param calendarName - Name for the calendar (X-WR-CALNAME)
 * @returns ICS file content as string
 */
export function generateICS(entries: TimetableEntry[], calendarName: string = 'HaUI'): string {
    const cal = ical({
        name: calendarName,
        prodId: '-//QuanVu//svHaUI Helper//VI',
    });
    cal.method(ICalCalendarMethod.PUBLISH);

    let eventCount = 0;

    for (const entry of entries) {
        const timeRange = getTimeRange(entry.periods);
        if (!timeRange) continue;

        const start = buildUTCDate(entry.date, timeRange.start);
        const end = buildUTCDate(entry.date, timeRange.end);
        if (!start || !end) continue;

        const periodsStr = entry.periods.join('-');
        const uid = `${entry.classCode}-${entry.date.replace(/\//g, '')}-P${periodsStr}@svhaui-helper`;

        const location = entry.location
            ? entry.location.replace(/\s*-\s*Cơ sở.*/i, '').trim()
            : undefined;

        cal.createEvent({
            id: uid,
            start,
            end,
            summary: entry.course,
            description: buildDescription(entry),
            location,
            status: ICalEventStatus.CONFIRMED,
        });

        eventCount++;
    }

    if (eventCount === 0) {
        return '';
    }

    return cal.toString();
}

/**
 * Trigger a file download in the browser.
 *
 * @param content - File content as string
 * @param filename - Suggested filename
 */
export function downloadICSFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}
