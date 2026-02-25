/**
 * Export Timetable Feature - Update Checker
 * Handles fetching timetable data, comparing entries, and diffing.
 */

import { TimetableEntry, TimetableDiff } from './types';
import { getSemesterDateRange } from './semester-config';
import { parseTimetableFromHTML } from './timetable-parser';
import { formatDateVN } from '../../utils/date';

// ============================================
// Constants
// ============================================

/** Default auto-check interval: 7 days */
export const AUTO_CHECK_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

/** Timetable page URL */
const TIMETABLE_URL = '/timestable/calendarcl';

// ============================================
// Entry Normalization & Comparison
// ============================================

/**
 * Create a stable key for a TimetableEntry (classCode + date + periods).
 */
function entryKey(entry: TimetableEntry): string {
    return `${entry.classCode}|${entry.date}|${entry.periods.join(',')}`;
}

/**
 * Normalize entries for stable comparison: sort by classCode, date, then periods.
 */
export function normalizeEntries(entries: TimetableEntry[]): TimetableEntry[] {
    return [...entries].sort((a, b) => {
        const cmp = a.classCode.localeCompare(b.classCode);
        if (cmp !== 0) return cmp;
        // Compare dates (dd/MM/yyyy → convert to comparable)
        const [ad, am, ay] = a.date.split('/');
        const [bd, bm, by] = b.date.split('/');
        const dateA = `${ay}${am}${ad}`;
        const dateB = `${by}${bm}${bd}`;
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return a.periods[0] - b.periods[0];
    });
}

/**
 * Filter entries to only include those belonging to a specific semester.
 * Checks if the classCode starts with the semester ID (e.g., "20252").
 *
 * This is useful when the server returns data across date ranges that
 * may overlap with other terms.
 *
 * @param entries - All parsed entries
 * @param semesterId - Semester value (e.g., "20252")
 * @returns Entries whose classCode starts with the semesterId
 */
export function filterEntriesBySemester(
    entries: TimetableEntry[],
    semesterId: string
): TimetableEntry[] {
    return entries.filter((e) => e.classCode.startsWith(semesterId));
}

/**
 * Quick equality check between two entry arrays.
 */
export function entriesEqual(a: TimetableEntry[], b: TimetableEntry[]): boolean {
    const na = normalizeEntries(a);
    const nb = normalizeEntries(b);
    return JSON.stringify(na) === JSON.stringify(nb);
}

/**
 * Compute detailed diff between old and new entries.
 */
export function diffEntries(
    oldEntries: TimetableEntry[],
    newEntries: TimetableEntry[]
): TimetableDiff {
    const oldMap = new Map<string, TimetableEntry>();
    for (const entry of oldEntries) {
        oldMap.set(entryKey(entry), entry);
    }

    const newMap = new Map<string, TimetableEntry>();
    for (const entry of newEntries) {
        newMap.set(entryKey(entry), entry);
    }

    const added: TimetableEntry[] = [];
    const removed: TimetableEntry[] = [];
    const changed: Array<{ old: TimetableEntry; new: TimetableEntry }> = [];
    let unchanged = 0;

    // Find added and changed entries
    for (const [key, newEntry] of newMap) {
        const oldEntry = oldMap.get(key);
        if (!oldEntry) {
            added.push(newEntry);
        } else if (JSON.stringify(oldEntry) !== JSON.stringify(newEntry)) {
            changed.push({ old: oldEntry, new: newEntry });
        } else {
            unchanged++;
        }
    }

    // Find removed entries
    for (const [key, oldEntry] of oldMap) {
        if (!newMap.has(key)) {
            removed.push(oldEntry);
        }
    }

    return { added, removed, changed, unchanged };
}

// ============================================
// Fetch Timetable
// ============================================

/**
 * Fetch the timetable for a given semester by making a same-origin fetch request.
 *
 * Strategy: First GET the page to obtain __VIEWSTATE and other ASP.NET fields,
 * then POST with the date range filled in.
 *
 * @param semesterId - Semester value (e.g. "20252")
 * @returns Parsed TimetableEntry array
 */
export async function fetchSemesterTimetable(semesterId: string): Promise<TimetableEntry[]> {
    const dateRange = getSemesterDateRange(semesterId);
    if (!dateRange) throw new Error(`Invalid semester ID: ${semesterId}`);

    // Step 1: GET the page to extract ASP.NET form tokens
    const pageResp = await fetch(TIMETABLE_URL, { credentials: 'same-origin' });
    if (!pageResp.ok) throw new Error(`Failed to load timetable page: ${pageResp.status}`);

    const pageHtml = await pageResp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageHtml, 'text/html');

    // Extract ASP.NET hidden fields
    const viewState = doc.querySelector<HTMLInputElement>('#__VIEWSTATE')?.value ?? '';
    const viewStateGen = doc.querySelector<HTMLInputElement>('#__VIEWSTATEGENERATOR')?.value ?? '';
    const eventValidation = doc.querySelector<HTMLInputElement>('#__EVENTVALIDATION')?.value ?? '';

    // Step 2: POST with date range
    const formData = new URLSearchParams();
    formData.set('__VIEWSTATE', viewState);
    formData.set('__VIEWSTATEGENERATOR', viewStateGen);
    formData.set('__EVENTVALIDATION', eventValidation);

    // Date fields
    formData.set('ctl03$inpStartDate_d', String(dateRange.start.getDate()));
    formData.set('ctl03$inpStartDate_m', String(dateRange.start.getMonth() + 1));
    formData.set('ctl03$inpStartDate', String(dateRange.start.getFullYear()));
    formData.set('ctl03$inpEndDate_d', String(dateRange.end.getDate()));
    formData.set('ctl03$inpEndDate_m', String(dateRange.end.getMonth() + 1));
    formData.set('ctl03$inpEndDate', String(dateRange.end.getFullYear()));

    // Submit button
    formData.set('ctl03$butGet', 'Xem');

    const postResp = await fetch(TIMETABLE_URL, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
    });

    if (!postResp.ok) throw new Error(`Failed to fetch timetable: ${postResp.status}`);

    const resultHtml = await postResp.text();
    const allEntries = parseTimetableFromHTML(resultHtml);
    return filterEntriesBySemester(allEntries, semesterId);
}

/**
 * Get the formatted date range string for a semester.
 */
export function getSemesterDateRangeFormatted(
    semesterId: string
): { start: string; end: string } | null {
    const range = getSemesterDateRange(semesterId);
    if (!range) return null;
    return {
        start: formatDateVN(range.start),
        end: formatDateVN(range.end),
    };
}

// ============================================
// Auto-Check Timing
// ============================================

/**
 * Check whether an auto-check should be triggered.
 *
 * @param lastCheckTime - ISO datetime string of last check, or undefined
 * @param intervalMs - Minimum interval between checks (default: 7 days)
 */
export function shouldAutoCheck(
    lastCheckTime: string | undefined,
    intervalMs: number = AUTO_CHECK_INTERVAL_MS
): boolean {
    if (!lastCheckTime) return true;
    const elapsed = Date.now() - new Date(lastCheckTime).getTime();
    return elapsed >= intervalMs;
}
