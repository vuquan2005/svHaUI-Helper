/**
 * Calendar Export Feature - ICS Generator
 * Converts TimetableEntry[] to an ICS (iCalendar RFC 5545) string
 * using the `ical-generator` library.
 *
 * Supports two modes:
 * - Recurring: Groups entries into RRULE-based series with EXDATE, RDATE, RECURRENCE-ID
 * - Flat: One VEVENT per entry (fallback for entries that can't form series)
 */

import ical, {
    ICalCalendarMethod,
    ICalEventRepeatingFreq,
    ICalEventStatus,
    ICalWeekday,
    type ICalCalendar,
} from 'ical-generator';
import { TimetableEntry, PeriodTimeSlot, RecurringSeries } from './types';
import { buildRecurringSeries } from './recurrence-builder';

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

/** Map RRULE day abbreviations to ical-generator ICalWeekday enum */
const DAY_MAP: Record<string, ICalWeekday> = {
    SU: ICalWeekday.SU,
    MO: ICalWeekday.MO,
    TU: ICalWeekday.TU,
    WE: ICalWeekday.WE,
    TH: ICalWeekday.TH,
    FR: ICalWeekday.FR,
    SA: ICalWeekday.SA,
};

// ============================================
// Helpers
// ============================================

/**
 * Get the start and end times for a set of periods.
 * Uses the first period's start and last period's end.
 */
export function getTimeRange(periods: number[]): { start: string; end: string } | null {
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
export function buildUTCDate(dateStr: string, timeStr: string): Date | null {
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

/**
 * Convert a local VN date (midnight) to UTC for RRULE/EXDATE purposes.
 * Subtracts 7 hours from midnight VN time.
 */
function dateToUTC(date: Date, timeStr: string): Date {
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hour - VN_UTC_OFFSET_HOURS,
            minute
        )
    );
}

/**
 * Format a Date as ICS UTC datetime string (e.g. "20260301T000000Z").
 */
function formatICSDateTime(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    const h = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    const s = String(date.getUTCSeconds()).padStart(2, '0');
    return `${y}${m}${d}T${h}${min}${s}Z`;
}

/**
 * Clean location string: remove "- Cơ sở..." suffix.
 */
function cleanLocation(location: string | undefined): string | undefined {
    if (!location) return undefined;
    return location.replace(/\s*-\s*Cơ sở.*/i, '').trim() || undefined;
}

// ============================================
// Description Builders
// ============================================

/**
 * Build event description from a TimetableEntry (flat mode).
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
 * Build description for a master recurring event.
 * Includes class code, periods, and master info.
 * If a field has no consensus, list all unique values.
 */
function buildMasterDescription(series: RecurringSeries): string {
    const { group, masterInfo } = series;
    const descParts: string[] = [];

    const classPart = `Lớp: ${group.classCode}`;
    const periodPart = `(${group.periods.join(', ')})`;
    descParts.push(`${classPart} ${periodPart}`);

    // Lecturer
    if (masterInfo.lecturer.isConsensus && masterInfo.lecturer.winner) {
        const phone = masterInfo.phone.winner;
        const gvLine = phone
            ? `${masterInfo.lecturer.winner} - ${phone}`
            : masterInfo.lecturer.winner;
        descParts.push(gvLine);
    } else {
        const unique = [...new Set(group.entries.map((e) => e.lecturer).filter(Boolean))];
        if (unique.length > 0) {
            descParts.push(`GV: ${unique.join(', ')}`);
        }
    }

    // Department
    if (masterInfo.department.isConsensus && masterInfo.department.winner) {
        descParts.push(masterInfo.department.winner);
    }

    // Location (if no consensus, list all)
    if (!masterInfo.location.isConsensus) {
        const unique = [...new Set(group.entries.map((e) => e.location).filter(Boolean))];
        if (unique.length > 0) {
            descParts.push(`Phòng: ${unique.map((l) => cleanLocation(l)).join(', ')}`);
        }
    }

    return descParts.join('\n');
}

// ============================================
// Recurring Event Creation
// ============================================

/**
 * Create the master recurring VEVENT for a series.
 */
function createMasterEvent(cal: ICalCalendar, series: RecurringSeries): void {
    const { group, masterInfo, rrule, exceptions, uid } = series;

    const timeRange = getTimeRange(group.periods);
    if (!timeRange) return;

    const start = dateToUTC(rrule.dtstart, timeRange.start);
    const end = dateToUTC(rrule.dtstart, timeRange.end);

    // Build x attributes for RDATE (if any)
    const xAttrs: [string, string][] = exceptions.rdates.map((d) => {
        const rdateUTC = dateToUTC(d, timeRange.start);
        return ['RDATE;VALUE=DATE-TIME', formatICSDateTime(rdateUTC)];
    });

    // Build EXDATE values (convert to UTC with the event's start time)
    const excludeDates = exceptions.exdates.map((d) => dateToUTC(d, timeRange.start));

    // Map byDay strings to ICalWeekday
    const byDay = rrule.byDay
        .map((d) => DAY_MAP[d])
        .filter((d): d is ICalWeekday => d !== undefined);

    const untilUTC = dateToUTC(rrule.until, timeRange.start);

    cal.createEvent({
        id: uid,
        start,
        end,
        summary: group.course,
        description: buildMasterDescription(series),
        location: cleanLocation(masterInfo.location.winner),
        status: ICalEventStatus.CONFIRMED,
        repeating: {
            freq: ICalEventRepeatingFreq.WEEKLY,
            interval: rrule.interval,
            byDay,
            until: untilUTC,
            exclude: excludeDates.length > 0 ? excludeDates : undefined,
        },
        x: xAttrs.length > 0 ? xAttrs : undefined,
    });
}

/**
 * Create an override VEVENT for a specific date in the series.
 * Uses the same UID with RECURRENCE-ID pointing to the overridden date.
 */
function createOverrideEvent(
    cal: ICalCalendar,
    series: RecurringSeries,
    override: { recurrenceId: Date; entry: TimetableEntry }
): void {
    const timeRange = getTimeRange(series.group.periods);
    if (!timeRange) return;

    const recurrenceIdUTC = dateToUTC(override.recurrenceId, timeRange.start);

    const start = buildUTCDate(override.entry.date, timeRange.start);
    const end = buildUTCDate(override.entry.date, timeRange.end);
    if (!start || !end) return;

    cal.createEvent({
        id: series.uid,
        recurrenceId: recurrenceIdUTC,
        start,
        end,
        summary: series.group.course,
        description: buildDescription(override.entry),
        location: cleanLocation(override.entry.location),
        status: ICalEventStatus.CONFIRMED,
    });
}

/**
 * Create a flat (non-recurring) VEVENT for a single entry.
 */
function createFlatEvent(cal: ICalCalendar, entry: TimetableEntry): void {
    const timeRange = getTimeRange(entry.periods);
    if (!timeRange) return;

    const start = buildUTCDate(entry.date, timeRange.start);
    const end = buildUTCDate(entry.date, timeRange.end);
    if (!start || !end) return;

    const periodsStr = entry.periods.join('-');
    const uid = `${entry.classCode}-${entry.date.replace(/\//g, '')}-P${periodsStr}@svhaui-helper`;

    cal.createEvent({
        id: uid,
        start,
        end,
        summary: entry.course,
        description: buildDescription(entry),
        location: cleanLocation(entry.location),
        status: ICalEventStatus.CONFIRMED,
    });
}

// ============================================
// Main Generator
// ============================================

/**
 * Generate a complete ICS calendar string from timetable entries.
 *
 * Uses RRULE-based recurring events for groups with ≥ 2 entries,
 * and flat events for standalone entries.
 *
 * @param entries - Parsed timetable entries
 * @param calendarName - Name for the calendar (X-WR-CALNAME)
 * @returns ICS file content as string
 */
export function generateICS(entries: TimetableEntry[], calendarName: string = 'HaUI'): string {
    if (entries.length === 0) return '';

    const cal = ical({
        name: calendarName,
        prodId: '-//QuanVu//svHaUI Helper//VI',
    });
    cal.method(ICalCalendarMethod.PUBLISH);

    // Build recurring series (groups with >= 2 entries)
    const seriesList = buildRecurringSeries(entries);

    // Collect entries that are part of a series (so we can find standalone ones)
    const seriesEntrySet = new Set<TimetableEntry>();
    for (const series of seriesList) {
        for (const entry of series.group.entries) {
            seriesEntrySet.add(entry);
        }
    }

    let eventCount = 0;

    // Create recurring events
    for (const series of seriesList) {
        createMasterEvent(cal, series);
        eventCount++;

        // Create override events
        for (const override of series.exceptions.overrides) {
            createOverrideEvent(cal, series, override);
            eventCount++;
        }
    }

    // Create flat events for standalone entries (not part of any series)
    for (const entry of entries) {
        if (!seriesEntrySet.has(entry)) {
            createFlatEvent(cal, entry);
            eventCount++;
        }
    }

    if (eventCount === 0) return '';

    return cal.toString();
}

// ============================================
// File Download
// ============================================

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
