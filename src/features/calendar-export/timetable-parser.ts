/**
 * Calendar Export Feature - Timetable Parser
 * Parses the HaUI timetable table into structured TimetableEntry objects.
 *
 * Based on parsing rules documented in docs/pages/timetable.md
 */

import { TimetableEntry } from './types';

// ============================================
// Regex Patterns (from timetable.md)
// ============================================

/** Extract course info: periods, course name, class code */
const REGEX_COURSE_INFO =
    /^\d+\.\s*\((?<periods>[\d,]+)\)\s*-\s*(?<course>.+?)\s*\(Lớp:\s*(?<classCode>[^)]+)\)/;

/** Extract lecturer info: name, phone, department */
const REGEX_LECTURER =
    /GV:\s*(?<lecturer>.+?)\s*\((?:(?<phone>[\d\s.]+)\s*-\s*)?(?<department>[^)]+)\)/;

/** Extract location info */
const REGEX_LOCATION = /^\s*\((?<location>[^)]+)\)\s*$/m;

// ============================================
// Session Column Indices
// ============================================

/** Column indices in the timetable (1-indexed from td:nth-child) */
const COL = {
    /** STT */
    INDEX: 1,
    /** Day name (Thứ 2, Thứ 3...) */
    DAY_NAME: 2,
    /** Date (dd/MM/yyyy) */
    DATE: 3,
    /** Morning session */
    MORNING: 4,
    /** Afternoon session */
    AFTERNOON: 5,
    /** Evening session */
    EVENING: 6,
} as const;

/** Columns that contain class sessions */
const SESSION_COLUMNS = [COL.MORNING, COL.AFTERNOON, COL.EVENING] as const;

// ============================================
// Parser Functions
// ============================================

/**
 * Parse a single text block (one class entry) into partial TimetableEntry data.
 * Returns null if the block doesn't match expected format.
 */
function parseBlock(block: string): Omit<TimetableEntry, 'date'> | null {
    const infoMatch = block.match(REGEX_COURSE_INFO);
    if (!infoMatch?.groups) return null;

    const { periods, course, classCode } = infoMatch.groups;
    const lecturerMatch = block.match(REGEX_LECTURER);
    const locationMatch = block.match(REGEX_LOCATION);

    return {
        periods: periods.split(',').map(Number),
        course: course.trim(),
        classCode: classCode.trim(),
        lecturer: lecturerMatch?.groups?.lecturer?.trim(),
        phone: lecturerMatch?.groups?.phone?.trim(),
        department: lecturerMatch?.groups?.department?.trim(),
        location: locationMatch?.groups?.location?.trim(),
    };
}

/**
 * Parse a session cell (morning/afternoon/evening) that may contain multiple classes.
 *
 * @param cellText - The innerText of the td cell
 * @param date - The date string for this row (dd/MM/yyyy)
 * @returns Array of TimetableEntry for this cell
 */
function parseSessionCell(cellText: string, date: string): TimetableEntry[] {
    const trimmed = cellText.trim();
    if (!trimmed) return [];

    // Split into blocks by leading number (e.g. "1. ...")
    const blocks = trimmed.split(/(?=^\d+\.)/gm).filter(Boolean);
    const entries: TimetableEntry[] = [];

    for (const block of blocks) {
        const parsed = parseBlock(block);
        if (parsed) {
            entries.push({ date, ...parsed });
        }
    }

    return entries;
}

/**
 * Parse the timetable from a DOM table element.
 *
 * @param tableEl - The table.table.table-bordered element
 * @returns Array of all TimetableEntry across all days and sessions
 */
export function parseTimetableFromDOM(tableEl: HTMLTableElement): TimetableEntry[] {
    const entries: TimetableEntry[] = [];
    const rows = Array.from(tableEl.querySelectorAll('tbody > tr:not(.k-table-head)'));

    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < COL.EVENING) continue;

        // Get date from the 3rd column (index 2)
        const date = cells[COL.DATE - 1]?.textContent?.trim();
        if (!date) continue;

        // Parse each session column
        for (const col of SESSION_COLUMNS) {
            const cellText = cells[col - 1]?.innerText ?? '';
            const cellEntries = parseSessionCell(cellText, date);
            entries.push(...cellEntries);
        }
    }

    return entries;
}

/**
 * Parse the timetable from an HTML string (e.g. from fetch response).
 * Creates a temporary DOM to parse.
 *
 * @param html - Full HTML response from the timetable page
 * @returns Array of TimetableEntry
 */
export function parseTimetableFromHTML(html: string): TimetableEntry[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector<HTMLTableElement>('table.table.table-bordered');

    if (!table) return [];
    return parseTimetableFromDOM(table);
}
