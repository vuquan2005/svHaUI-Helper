/**
 * Calendar Export Feature - Semester Configuration
 *
 * Uses academic year concept (e.g., 2025-2026) with value encoding:
 * - Value = `${calendarYear}${term}` (e.g., "20251" = Kỳ 1 starting in 2025)
 * - Term 1 uses the first year of the academic year pair
 * - Terms 2, 3, 4 use the second year
 */

// ============================================
// Term Definitions
// ============================================

export interface TermDefinition {
    /** Term number (1-4) */
    term: number;
    /** Emoji label */
    emoji: string;
    /** Display name */
    name: string;
    /** Start month (1-12) */
    startMonth: number;
    /** Start day */
    startDay: number;
    /** End month (1-12) */
    endMonth: number;
    /** End day */
    endDay: number;
    /**
     * Year offset for start date, relative to the calendar year in the value.
     * e.g., Term 3 (Xuân) value "20263" → year=2026, startYearOffset=-1 → start in Dec 2025
     */
    startYearOffset: number;
    /**
     * Year offset for end date, relative to the calendar year in the value.
     */
    endYearOffset: number;
}

/**
 * 4 terms per academic year with buffered date ranges.
 *
 * Value encoding: `${calendarYear}${term}`
 * - Term 1: calendarYear = academic start year (e.g., 2025 for 2025-2026)
 * - Term 2-4: calendarYear = academic end year (e.g., 2026 for 2025-2026)
 */
export const TERMS: TermDefinition[] = [
    {
        term: 1,
        emoji: '1️⃣',
        name: 'Kỳ 1',
        startMonth: 8,
        startDay: 23,
        endMonth: 1,
        endDay: 7,
        startYearOffset: 0,
        endYearOffset: 1,
    },
    {
        term: 2,
        emoji: '2️⃣',
        name: 'Kỳ 2',
        startMonth: 2,
        startDay: 23,
        endMonth: 6,
        endDay: 7,
        startYearOffset: 0,
        endYearOffset: 0,
    },
    {
        term: 3,
        emoji: '🌸',
        name: 'Kỳ Xuân',
        startMonth: 12,
        startDay: 23,
        endMonth: 3,
        endDay: 7,
        startYearOffset: -1,
        endYearOffset: 0,
    },
    {
        term: 4,
        emoji: '☀️',
        name: 'Kỳ Hè',
        startMonth: 6,
        startDay: 23,
        endMonth: 9,
        endDay: 7,
        startYearOffset: 0,
        endYearOffset: 0,
    },
];

/** Number of past academic years to show in the dropdown */
export const HISTORY_YEARS = 5;

// ============================================
// Semester Option (for dropdown)
// ============================================

export interface SemesterOption {
    /** Encoded value: `${calendarYear}${term}` (e.g., "20251") */
    value: string;
    /** Display label (e.g., "1️⃣ : 2025 - 2026") */
    label: string;
    /** The academic year start (e.g., 2025 for "2025-2026") */
    academicYear: number;
    /** Term number (1-4) */
    term: number;
}

/**
 * Generate all semester options for the dropdown.
 * Returns options from current academic year down to HISTORY_YEARS ago.
 */
export function generateSemesterOptions(currentYear?: number): SemesterOption[] {
    const now = new Date();
    // Determine current academic year:
    // If month >= 8 (August+), we're in academic year starting this year
    // Otherwise, we're in the academic year that started last year
    const baseYear =
        currentYear ?? (now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1);

    const options: SemesterOption[] = [];

    for (let year = baseYear; year >= baseYear - (HISTORY_YEARS - 1); year--) {
        for (const termDef of TERMS) {
            const calendarYear = termDef.term === 1 ? year : year + 1;
            const value = `${calendarYear}${termDef.term}`;
            const label = `${termDef.emoji} : ${year} - ${year + 1}`;

            options.push({
                value,
                label,
                academicYear: year,
                term: termDef.term,
            });
        }
    }

    return options;
}

// ============================================
// Date Range Calculation
// ============================================

/**
 * Parse a semester value into { calendarYear, term }.
 * Value format: "20251" → { calendarYear: 2025, term: 1 }
 */
export function parseSemesterValue(value: string): { calendarYear: number; term: number } | null {
    if (value.length < 2) return null;

    const term = parseInt(value.slice(-1), 10);
    const calendarYear = parseInt(value.slice(0, -1), 10);

    if (isNaN(term) || isNaN(calendarYear) || term < 1 || term > 4) return null;
    return { calendarYear, term };
}

/**
 * Get the concrete start and end dates for a semester value.
 *
 * @param value - Encoded semester value (e.g., "20251")
 * @returns Start and end Date objects, or null if invalid
 */
export function getSemesterDateRange(value: string): { start: Date; end: Date } | null {
    const parsed = parseSemesterValue(value);
    if (!parsed) return null;

    const termDef = TERMS.find((t) => t.term === parsed.term);
    if (!termDef) return null;

    const { calendarYear } = parsed;

    const start = new Date(
        calendarYear + termDef.startYearOffset,
        termDef.startMonth - 1,
        termDef.startDay
    );
    const end = new Date(
        calendarYear + termDef.endYearOffset,
        termDef.endMonth - 1,
        termDef.endDay
    );

    return { start, end };
}

/**
 * Detect the current semester value based on date.
 */
export function detectCurrentSemester(now: Date = new Date()): string {
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    // Determine academic year and term from current month
    if (month >= 8) {
        // Aug-Dec → Term 1, academic year starts this year
        return `${year}1`;
    } else if (month >= 2 && month <= 6) {
        // Feb-Jun → Term 2, calendar year = this year
        return `${year}2`;
    } else if (month === 1) {
        // Jan → could be end of Term 1 (started prev year) or Term 3 start
        return `${year - 1}1`;
    } else {
        // Jul → Term 4, calendar year = this year
        return `${year}4`;
    }
}
