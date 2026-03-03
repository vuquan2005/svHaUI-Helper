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
    const rows = Array.from(tableEl.querySelectorAll('tbody > tr'));

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
