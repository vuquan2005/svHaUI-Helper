/**
 * Export Exam Feature - Exam Plan Parser
 * Parses and fetches exam plan data from /student/schedulefees/examplant.
 *
 * Based on structure documented in docs/pages/exam-plan.md
 *
 * Two views:
 * 1. List view (default): Shows all class codes the student is enrolled in
 * 2. Detail view (?code=...): Shows exam plan details for a specific class code
 */

import { ExamPlanEntry } from './types';

// ============================================
// Constants
// ============================================

const EXAM_PLAN_URL = '/student/schedulefees/examplant';

/** Number of concurrent requests per batch */
const BATCH_SIZE = 5;

/** Delay between batches in ms */
const BATCH_DELAY_MS = 300;

// ============================================
// Types
// ============================================

/** A class code item from the list view */
interface ExamPlanListItem {
    classCode: string;
    course: string;
}

// ============================================
// Detail Column Indices (from docs)
// ============================================

const DETAIL_COL = {
    INDEX: 1,
    CLASS_CODE: 2,
    COURSE: 3,
    EXAM_DATE: 4,
    EXAM_TIME: 5,
    ATTEMPT: 6,
    PRIORITY_CLASS: 7,
    DEPARTMENT: 8,
} as const;

// ============================================
// List Column Indices (from docs)
// ============================================

const LIST_COL = {
    INDEX: 1,
    CLASS_CODE: 2, // td:nth-child(2) > a
    COURSE: 3, // td:nth-child(3) > a
} as const;

// ============================================
// Parsers
// ============================================

/**
 * Parse the exam plan list page to extract class code and course name pairs.
 * Works on the default page (no ?code= parameter).
 *
 * @param doc - Document to parse (defaults to current document)
 * @returns Array of { classCode, course } items
 */
export function parseExamPlanList(doc: Document = document): ExamPlanListItem[] {
    const items: ExamPlanListItem[] = [];

    // Selector from docs: div.kGrid > div > div.panel-body > table
    const table = doc.querySelector<HTMLTableElement>('div.kGrid > div > div.panel-body > table');
    if (!table) return items;

    const rows = Array.from(table.querySelectorAll('tbody > tr'));

    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < LIST_COL.COURSE) continue;

        const classCodeLink = cells[LIST_COL.CLASS_CODE - 1]?.querySelector('a');
        const courseLink = cells[LIST_COL.COURSE - 1]?.querySelector('a');

        const classCode = classCodeLink?.textContent?.trim() ?? '';
        const course = courseLink?.textContent?.trim() ?? '';

        if (classCode) {
            items.push({ classCode, course });
        }
    }

    return items;
}

/**
 * Parse the exam plan detail page HTML to extract ExamPlanEntry items.
 *
 * @param html - Full HTML from the detail page (?code=...)
 * @returns Array of ExamPlanEntry
 */
export function parseExamPlanDetail(html: string): ExamPlanEntry[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Detail table selector from docs:
    // div#ctl03_ctl00_viewResult > div.kGrid > div.panel-body > table
    const table = doc.querySelector<HTMLTableElement>(
        'div#ctl03_ctl00_viewResult > div.kGrid > div.panel-body > table'
    );
    if (!table) return [];

    const entries: ExamPlanEntry[] = [];
    const rows = Array.from(table.querySelectorAll('tbody > tr'));

    for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < DETAIL_COL.DEPARTMENT) continue;

        const getText = (colIndex: number): string =>
            cells[colIndex - 1]?.textContent?.trim() ?? '';

        const classCode = getText(DETAIL_COL.CLASS_CODE);
        const course = getText(DETAIL_COL.COURSE);
        const examDate = getText(DETAIL_COL.EXAM_DATE);
        const examTime = getText(DETAIL_COL.EXAM_TIME);

        if (!classCode || !examDate) continue;

        const attemptStr = getText(DETAIL_COL.ATTEMPT);

        entries.push({
            classCode,
            course,
            examDate,
            examTime,
            attempt: parseInt(attemptStr, 10) || 1,
            priorityClass: getText(DETAIL_COL.PRIORITY_CLASS) || undefined,
            department: getText(DETAIL_COL.DEPARTMENT) || undefined,
        });
    }

    return entries;
}

// ============================================
// Fetching
// ============================================

/**
 * Fetch the exam plan list page to get all class codes.
 *
 * @returns Array of { classCode, course } items
 */
export async function fetchExamPlanList(): Promise<ExamPlanListItem[]> {
    const resp = await fetch(EXAM_PLAN_URL, { credentials: 'same-origin' });
    if (!resp.ok) throw new Error(`Failed to load exam plan page: ${resp.status}`);

    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    return parseExamPlanList(doc);
}

/**
 * Fetch the exam plan detail for a single class code.
 *
 * @param classCode - Mã lớp độc lập (e.g., "20251BS101001")
 * @returns Array of ExamPlanEntry for this code
 */
async function fetchExamPlanDetail(classCode: string): Promise<ExamPlanEntry[]> {
    const url = `${EXAM_PLAN_URL}?code=${encodeURIComponent(classCode)}`;
    const resp = await fetch(url, { credentials: 'same-origin' });
    if (!resp.ok)
        throw new Error(`Failed to fetch exam plan detail for ${classCode}: ${resp.status}`);

    const html = await resp.text();
    return parseExamPlanDetail(html);
}

/**
 * Utility to delay execution.
 */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process an array in chunks, running each chunk concurrently with a delay between batches.
 *
 * @param items - Items to process
 * @param batchSize - Max concurrent requests per batch
 * @param batchDelay - Delay between batches in ms
 * @param fn - Async function to apply to each item
 * @returns Flattened results
 */
async function processBatched<T, R>(
    items: T[],
    batchSize: number,
    batchDelay: number,
    fn: (item: T) => Promise<R[]>
): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(fn));

        for (const r of batchResults) {
            results.push(...r);
        }

        // Delay between batches (skip delay after last batch)
        if (i + batchSize < items.length) {
            await delay(batchDelay);
        }
    }

    return results;
}

/**
 * Fetch all exam plan data by:
 * 1. Getting the list of class codes from the plan page
 * 2. Fetching detail for each code in batches
 *
 * @returns All ExamPlanEntry items
 */
export async function fetchAllExamPlansBatched(): Promise<ExamPlanEntry[]> {
    const listItems = await fetchExamPlanList();
    if (listItems.length === 0) return [];

    const classCodes = listItems.map((item) => item.classCode);
    return processBatched(classCodes, BATCH_SIZE, BATCH_DELAY_MS, fetchExamPlanDetail);
}

/**
 * Fetch exam plan details for specific class codes (used for force update).
 *
 * @param classCodes - Array of class codes to fetch
 * @returns ExamPlanEntry items for those codes
 */
export async function fetchExamPlansByClassCodes(classCodes: string[]): Promise<ExamPlanEntry[]> {
    if (classCodes.length === 0) return [];
    return processBatched(classCodes, BATCH_SIZE, BATCH_DELAY_MS, fetchExamPlanDetail);
}

/**
 * Filter class codes that belong to the current semester.
 * Class code format: `yyyy` + `Mã học kỳ` + `Mã môn` + `STT`
 * e.g., "20251BS101001" → semester prefix "20251"
 *
 * @param classCodes - All class codes
 * @param semesterPrefix - e.g., "20251"
 */
export function filterClassCodesBySemester(classCodes: string[], semesterPrefix: string): string[] {
    return classCodes.filter((code) => code.startsWith(semesterPrefix));
}
