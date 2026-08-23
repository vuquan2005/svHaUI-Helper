/**
 * Export Exam Feature - Exam Schedule Parser
 * Parses the exam schedule table from the /student/schedulefees/transactionmodules page.
 *
 * Based on structure documented in docs/pages/exam-schedule.md
 */

import { ExamScheduleEntry } from './types';

// ============================================
// Column Indices (1-indexed from td:nth-child as per docs)
// ============================================

const COL = {
    /** STT */
    INDEX: 1,
    /** Tên học phần */
    COURSE: 2,
    /** Ngày thi (dd/MM/yyyy) */
    EXAM_DATE: 3,
    /** Ca thi (H'h'mm) */
    EXAM_TIME: 4,
    /** Số báo danh */
    SBD: 5,
    /** Lần thi */
    ATTEMPT: 6,
    /** Vị trí ngồi */
    POSITION: 7,
    /** Phòng thi */
    ROOM: 8,
    /** Tòa nhà */
    BUILDING: 9,
    /** Cơ sở */
    CAMPUS: 10,
} as const;

// ============================================
// Table Locator
// ============================================

/**
 * Find the actual exam schedule table on the page.
 * Distinguishes the exam schedule table from the student info table.
 *
 * @param container - Root container (document or HTMLElement)
 * @returns The exam schedule HTMLTableElement or null
 */
export function findExamScheduleTable(
    container: Document | HTMLElement = document
): HTMLTableElement | null {
    // 1. Try finding table containing .kTableHeader row
    const headerRow = container.querySelector('tr.kTableHeader');
    if (headerRow) {
        const table = headerRow.closest('table');
        if (table) return table as HTMLTableElement;
    }

    // 2. Try finding all candidate tables and match by header text
    const tables = Array.from(
        container.querySelectorAll<HTMLTableElement>('div.kGrid table, table.table.table-bordered')
    );

    for (const table of tables) {
        const text = table.textContent ?? '';
        if (text.includes('Môn thi') && (text.includes('Ngày thi') || text.includes('Ngày thi'))) {
            return table;
        }
    }

    // 3. Fallback: table with the most columns/rows (usually the second table)
    if (tables.length >= 2) {
        return tables[1];
    }

    return tables[0] ?? null;
}

// ============================================
// Parser
// ============================================

/**
 * Parse the exam schedule table from the DOM.
 *
 * @param tableEl - The `table.table.table-bordered.table-striped` element
 * @returns Array of ExamScheduleEntry
 */
export function parseExamScheduleFromDOM(tableEl: HTMLTableElement): ExamScheduleEntry[] {
    const entries: ExamScheduleEntry[] = [];
    const rows = Array.from(tableEl.querySelectorAll('tbody > tr')).filter(
        (r) => !r.classList.contains('kTableHeader')
    );

    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < COL.BUILDING) continue;

        const getText = (colIndex: number): string =>
            cells[colIndex - 1]?.textContent?.trim() ?? '';

        const course = getText(COL.COURSE);
        const examDate = getText(COL.EXAM_DATE);
        const examTime = getText(COL.EXAM_TIME);

        // Skip rows with missing critical data
        if (!course || !examDate || !examTime) continue;

        const attemptStr = getText(COL.ATTEMPT);
        const attempt = parseInt(attemptStr, 10) || 1;

        entries.push({
            course,
            examDate,
            examTime,
            sbd: getText(COL.SBD),
            attempt,
            position: getText(COL.POSITION),
            room: getText(COL.ROOM),
            building: getText(COL.BUILDING),
            campus: getText(COL.CAMPUS) || undefined,
        });
    }

    return entries;
}

/**
 * Fetch and parse exam schedule directly from the server.
 * Can be called from any page (Home, Exam Plan, etc.) in the background.
 */
export async function fetchExamScheduleFromWeb(): Promise<ExamScheduleEntry[]> {
    try {
        const response = await fetch('/student/schedulefees/transactionmodules', {
            headers: {
                Accept: 'text/html,application/xhtml+xml',
            },
        });

        if (!response.ok) return [];

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const table = findExamScheduleTable(doc);
        if (!table) return [];

        return parseExamScheduleFromDOM(table);
    } catch {
        return [];
    }
}
