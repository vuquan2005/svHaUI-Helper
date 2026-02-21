/**
 * Calendar Export Feature - ICS Generator
 * Converts TimetableEntry[] to an ICS (iCalendar RFC 5545) string.
 */

import { TimetableEntry, PeriodTimeSlot } from './types';

// ============================================
// Period Time Slots (16 periods)
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
// Date/Time Utilities
// ============================================

/**
 * Parse dd/MM/yyyy date string to { day, month, year }
 */
function parseDateVN(dateStr: string): { day: number; month: number; year: number } | null {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return { day, month, year };
}

/**
 * Format a date+time as ICS datetime string (YYYYMMDDTHHMMSS)
 * Uses local time (no timezone conversion).
 */
function formatICSDateTime(year: number, month: number, day: number, time: string): string {
    const [h, m] = time.split(':');
    const yy = String(year);
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const hh = h.padStart(2, '0');
    const mi = m.padStart(2, '0');
    return `${yy}${mm}${dd}T${hh}${mi}00`;
}

/**
 * Format current timestamp for ICS DTSTAMP
 */
function formatICSTimestamp(): string {
    const now = new Date();
    const y = String(now.getFullYear());
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${y}${m}${d}T${h}${mi}${s}`;
}

/**
 * Escape special characters in ICS text fields (RFC 5545 §3.3.11)
 */
function escapeICS(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

// ============================================
// ICS Generation
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
 * Generate a UID for a VEVENT.
 * Uses classCode + date + periods for uniqueness.
 */
function generateUID(entry: TimetableEntry): string {
    const periodsStr = entry.periods.join('-');
    return `${entry.classCode}-${entry.date.replace(/\//g, '')}-P${periodsStr}@svhaui-helper`;
}

/**
 * Generate a single VEVENT block for an entry.
 */
function generateVEvent(entry: TimetableEntry, dtstamp: string): string | null {
    const dateInfo = parseDateVN(entry.date);
    if (!dateInfo) return null;

    const timeRange = getTimeRange(entry.periods);
    if (!timeRange) return null;

    const dtstart = formatICSDateTime(dateInfo.year, dateInfo.month, dateInfo.day, timeRange.start);
    const dtend = formatICSDateTime(dateInfo.year, dateInfo.month, dateInfo.day, timeRange.end);
    const uid = generateUID(entry);

    // Build description parts
    const descParts: string[] = [];
    if (entry.classCode) descParts.push(`Mã lớp: ${entry.classCode}`);
    if (entry.lecturer) descParts.push(`GV: ${entry.lecturer}`);
    if (entry.phone) descParts.push(`SĐT: ${entry.phone}`);
    if (entry.department) descParts.push(`Khoa: ${entry.department}`);
    descParts.push(`Tiết: ${entry.periods.join(', ')}`);

    const lines = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${escapeICS(entry.course)}`,
    ];

    if (entry.location) {
        lines.push(`LOCATION:${escapeICS(entry.location)}`);
    }

    lines.push(`DESCRIPTION:${escapeICS(descParts.join('\\n'))}`);
    lines.push('END:VEVENT');

    return lines.join('\r\n');
}

/**
 * Generate a complete ICS calendar string from timetable entries.
 *
 * @param entries - Parsed timetable entries
 * @param calendarName - Name for the calendar (VCALENDAR X-WR-CALNAME)
 * @returns ICS file content as string
 */
export function generateICS(
    entries: TimetableEntry[],
    calendarName: string = 'HaUI Timetable'
): string {
    const dtstamp = formatICSTimestamp();

    const header = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//svHaUI Helper//Calendar Export//VI',
        `X-WR-CALNAME:${escapeICS(calendarName)}`,
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
    ].join('\r\n');

    const events = entries
        .map((entry) => generateVEvent(entry, dtstamp))
        .filter((e): e is string => e !== null);

    const footer = 'END:VCALENDAR';

    return [header, ...events, footer].join('\r\n');
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
