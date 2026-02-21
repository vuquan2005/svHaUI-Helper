/**
 * Calendar Export Feature - ICS Generator
 * Converts TimetableEntry[] to an ICS (iCalendar RFC 5545) string
 * using the `ics` library.
 */

import { createEvents, type EventAttributes, type HeaderAttributes } from 'ics';
import { TimetableEntry, PeriodTimeSlot } from './types';
import { parseDateTimeVN, vnToUTC } from '@/utils';

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

// ============================================
// ICS Generation (using `ics` library)
// ============================================

/**
 * Convert a TimetableEntry to an ics EventAttributes object.
 * Converts VN local time → UTC for ICS output.
 * Returns null if the entry cannot be converted.
 */
function toEventAttributes(entry: TimetableEntry): EventAttributes | null {
    const timeRange = getTimeRange(entry.periods);
    if (!timeRange) return null;

    const startVN = parseDateTimeVN(entry.date, timeRange.start);
    const endVN = parseDateTimeVN(entry.date, timeRange.end);
    if (!startVN || !endVN) return null;

    const startUTC = vnToUTC(startVN);
    const endUTC = vnToUTC(endVN);

    // Build description parts
    const descParts: string[] = [];
    if (entry.classCode) descParts.push(`Mã lớp: ${entry.classCode}`);
    if (entry.lecturer) descParts.push(`GV: ${entry.lecturer}`);
    if (entry.phone) descParts.push(`SĐT: ${entry.phone}`);
    if (entry.department) descParts.push(`Khoa: ${entry.department}`);
    descParts.push(`Tiết: ${entry.periods.join(', ')}`);

    const periodsStr = entry.periods.join('-');
    const uid = `${entry.classCode}-${entry.date.replace(/\//g, '')}-P${periodsStr}@svhaui-helper`;

    const attrs: EventAttributes = {
        start: startUTC,
        startInputType: 'utc',
        startOutputType: 'utc',
        end: endUTC,
        endInputType: 'utc',
        endOutputType: 'utc',
        title: entry.course,
        description: descParts.join('\n'),
        uid,
        status: 'CONFIRMED',
    };

    if (entry.location) {
        attrs.location = entry.location;
    }

    return attrs;
}

/**
 * Generate a complete ICS calendar string from timetable entries.
 *
 * @param entries - Parsed timetable entries
 * @param calendarName - Name for the calendar (X-WR-CALNAME)
 * @returns ICS file content as string
 */
export function generateICS(entries: TimetableEntry[], calendarName: string = 'HaUI'): string {
    const events = entries
        .map((entry) => toEventAttributes(entry))
        .filter((e): e is EventAttributes => e !== null);

    if (events.length === 0) {
        return '';
    }

    const headerAttributes: HeaderAttributes = {
        productId: '-//svHaUI Helper//Calendar Export//VI',
        calName: calendarName,
        method: 'PUBLISH',
    };

    const { error, value } = createEvents(events, headerAttributes);

    if (error) {
        console.error('[calendar-export] ICS generation error:', error);
        return '';
    }

    return value ?? '';
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
