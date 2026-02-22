/**
 * Calendar Export Feature - Semester Configuration
 *
 * Semester value format: `${academicYear}${term}`
 * - academicYear: the starting year of the academic year pair (e.g., 2025 for 2025-2026)
 * - term: 1-4
 *
 * Examples based on class codes:
 * - "20251" = Kỳ 1, academic year 2025-2026, starts Sep 2025
 * - "20252" = Kỳ 2, academic year 2025-2026, starts Feb/Mar 2026
 * - "20253" = Kỳ Xuân, academic year 2025-2026, starts Dec 2025
 * - "20254" = Kỳ Hè, academic year 2025-2026, starts Jun 2026
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
     * Year offset for start date, relative to the academic year.
     * e.g., Term 1: startYearOffset=0 → start in academicYear (Sep 2025 for "20251")
     * e.g., Term 2: startYearOffset=1 → start in academicYear+1 (Feb 2026 for "20252")
     */
    startYearOffset: number;
    /**
     * Year offset for end date, relative to the academic year.
     * e.g., Term 1: endYearOffset=1 → end in academicYear+1 (Jan 2026 for "20251")
     */
    endYearOffset: number;
}

/**
 * 4 terms per academic year with buffered date ranges.
 *
 * Value encoding: `${academicYear}${term}`
 * - academicYear is always the starting year of the pair (e.g., 2025 for 2025-2026)
 * - All terms use the same academicYear in their value
 *
 * Date calculation: startYear = academicYear + startYearOffset, etc.
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
        startYearOffset: 0, // Sep of academicYear
        endYearOffset: 1, // Jan of academicYear+1
    },
    {
        term: 2,
        emoji: '2️⃣',
        name: 'Kỳ 2',
        startMonth: 2,
        startDay: 23,
        endMonth: 6,
        endDay: 7,
        startYearOffset: 1, // Feb of academicYear+1
        endYearOffset: 1, // Jun of academicYear+1
    },
    {
        term: 3,
        emoji: '🌸',
        name: 'Kỳ Xuân',
        startMonth: 12,
        startDay: 23,
        endMonth: 3,
        endDay: 7,
        startYearOffset: 0, // Dec of academicYear
        endYearOffset: 1, // Mar of academicYear+1
    },
    {
        term: 4,
        emoji: '☀️',
        name: 'Kỳ Hè',
        startMonth: 6,
        startDay: 23,
        endMonth: 9,
        endDay: 7,
        startYearOffset: 1, // Jun of academicYear+1
        endYearOffset: 1, // Sep of academicYear+1
    },
];

/** Number of past academic years to show in the dropdown */
export const HISTORY_YEARS = 5;

// ============================================
// Semester Option (for dropdown)
// ============================================

export interface SemesterOption {
    /** Encoded value: `${academicYear}${term}` (e.g., "20251") */
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
            // Value is always `${academicYear}${term}`
            const value = `${year}${termDef.term}`;
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
 * Parse a semester value into { academicYear, term }.
 * Value format: "20251" → { academicYear: 2025, term: 1 }
 */
export function parseSemesterValue(value: string): { academicYear: number; term: number } | null {
    if (value.length < 2) return null;

    const term = parseInt(value.slice(-1), 10);
    const academicYear = parseInt(value.slice(0, -1), 10);

    if (isNaN(term) || isNaN(academicYear) || term < 1 || term > 4) return null;
    return { academicYear, term };
}

/**
 * Get the concrete start and end dates for a semester value.
 *
 * @param value - Encoded semester value (e.g., "20251")
 * @returns Start and end Date objects, or null if invalid
 *
 * Examples:
 * - "20251" → start: 2025-08-23, end: 2026-01-07
 * - "20252" → start: 2026-02-23, end: 2026-06-07
 */
export function getSemesterDateRange(value: string): { start: Date; end: Date } | null {
    const parsed = parseSemesterValue(value);
    if (!parsed) return null;

    const termDef = TERMS.find((t) => t.term === parsed.term);
    if (!termDef) return null;

    const { academicYear } = parsed;

    const start = new Date(
        academicYear + termDef.startYearOffset,
        termDef.startMonth - 1,
        termDef.startDay
    );
    const end = new Date(
        academicYear + termDef.endYearOffset,
        termDef.endMonth - 1,
        termDef.endDay
    );

    return { start, end };
}

/**
 * Detect the current semester value based on date.
 *
 * Returns `${academicYear}${term}` where academicYear is the starting year
 * of the academic year pair.
 *
 * Examples:
 * - Sep 2025 → "20251" (Kỳ 1, academic year 2025-2026)
 * - Mar 2026 → "20252" (Kỳ 2, academic year 2025-2026)
 * - Jan 2026 → "20251" (still Kỳ 1, academic year 2025-2026)
 * - Jul 2026 → "20254" (Kỳ Hè, academic year 2025-2026)
 */
export function detectCurrentSemester(now: Date = new Date()): string {
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    // Determine academic year and term from current month
    if (month >= 8) {
        // Aug-Dec → Term 1, academic year starts this year
        return `${year}1`;
    } else if (month >= 2 && month <= 6) {
        // Feb-Jun → Term 2, academic year started LAST year
        return `${year - 1}2`;
    } else if (month === 1) {
        // Jan → end of Term 1, academic year started last year
        return `${year - 1}1`;
    } else {
        // Jul → Term 4, academic year started last year
        return `${year - 1}4`;
    }
}

/**
 * Get a human-readable label for a semester value.
 * e.g. "20251" → "HaUI - Kỳ 1 (2025-2026)"
 */
export function getSemesterLabel(semesterId: string): string {
    const parsed = parseSemesterValue(semesterId);
    if (!parsed) return `HaUI - TKB`;

    const termDef = TERMS.find((t) => t.term === parsed.term);
    const termName = termDef?.name ?? `Kỳ ${parsed.term}`;
    const academicYear = parsed.academicYear;

    return `HaUI - ${termName} (${academicYear}-${academicYear + 1})`;
}
