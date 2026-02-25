/**
 * Export Timetable Feature - Recurrence Builder
 *
 * Converts discrete TimetableEntry[] into RecurringSeries[] with:
 * - Grouping by classCode + periods
 * - Majority voting for location, lecturer, department
 * - RRULE generation (FREQ=WEEKLY, INTERVAL, BYDAY, UNTIL)
 * - Exception detection (EXDATE, RDATE, RECURRENCE-ID overrides)
 */

import {
    TimetableEntry,
    SeriesGroup,
    MajorityVoteResult,
    MasterInfo,
    RecurrenceParams,
    RecurrenceExceptions,
    OverrideEvent,
    RecurringSeries,
} from './types';
import { parseDateVN } from '../../utils/date';

// ============================================
// Day-of-week helpers
// ============================================

/** Map JS Date.getDay() (0=Sun..6=Sat) to RRULE day abbreviations */
const DAY_ABBR = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

/** Default majority voting threshold (60%) */
const DEFAULT_THRESHOLD = 0.6;

// ============================================
// 1. Grouping
// ============================================

/**
 * Create a grouping key from classCode + sorted periods.
 */
function groupKey(entry: TimetableEntry): string {
    const periodsKey = [...entry.periods].sort((a, b) => a - b).join(',');
    return `${entry.classCode}|${periodsKey}`;
}

/**
 * Group entries by classCode + periods.
 * Each group represents one recurring event series.
 */
export function groupEntries(entries: TimetableEntry[]): SeriesGroup[] {
    const map = new Map<string, TimetableEntry[]>();

    for (const entry of entries) {
        const key = groupKey(entry);
        const list = map.get(key);
        if (list) {
            list.push(entry);
        } else {
            map.set(key, [entry]);
        }
    }

    const groups: SeriesGroup[] = [];
    for (const list of map.values()) {
        const first = list[0];
        groups.push({
            course: first.course,
            classCode: first.classCode,
            periods: [...first.periods].sort((a, b) => a - b),
            entries: list,
        });
    }

    return groups;
}

// ============================================
// 2. Majority Voting
// ============================================

/**
 * Perform majority voting on an array of values.
 *
 * @param values - The values to vote on (undefined values are excluded)
 * @param threshold - Minimum ratio to be considered consensus (default: 0.6)
 * @returns The winning value and whether consensus was reached
 */
export function majorityVote<T>(
    values: (T | undefined)[],
    threshold: number = DEFAULT_THRESHOLD
): MajorityVoteResult<T> {
    const defined = values.filter((v): v is T => v !== undefined);
    if (defined.length === 0) {
        return { winner: undefined, isConsensus: false };
    }

    const freq = new Map<T, number>();
    for (const v of defined) {
        freq.set(v, (freq.get(v) ?? 0) + 1);
    }

    let maxValue: T | undefined;
    let maxCount = 0;
    for (const [value, count] of freq) {
        if (count > maxCount) {
            maxCount = count;
            maxValue = value;
        }
    }

    const ratio = maxCount / defined.length;
    const isConsensus = ratio >= threshold;

    return {
        winner: isConsensus ? maxValue : undefined,
        isConsensus,
    };
}

/**
 * Compute master info for a series group using majority voting.
 */
export function computeMasterInfo(group: SeriesGroup): MasterInfo {
    return {
        location: majorityVote(group.entries.map((e) => e.location)),
        lecturer: majorityVote(group.entries.map((e) => e.lecturer)),
        phone: majorityVote(group.entries.map((e) => e.phone)),
        department: majorityVote(group.entries.map((e) => e.department)),
    };
}

// ============================================
// 3. RRULE Generation
// ============================================

/**
 * Find the statistical mode (most frequent value) of a number array.
 * Returns the smallest value in case of tie.
 */
export function mode(arr: number[]): number {
    if (arr.length === 0) return 1;

    const freq = new Map<number, number>();
    for (const v of arr) {
        freq.set(v, (freq.get(v) ?? 0) + 1);
    }

    let bestVal = arr[0];
    let bestCount = 0;
    for (const [value, count] of freq) {
        if (count > bestCount || (count === bestCount && value < bestVal)) {
            bestCount = count;
            bestVal = value;
        }
    }

    return bestVal;
}

/**
 * Parse dd/MM/yyyy date strings into sorted Date objects.
 * Returns only valid dates.
 */
export function parseDates(dateStrs: string[]): Date[] {
    return dateStrs
        .map((s) => parseDateVN(s))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Compute week gap between two dates.
 * Uses total days difference / 7, rounded to nearest integer.
 */
function weekGap(a: Date, b: Date): number {
    const diffMs = b.getTime() - a.getTime();
    return Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
}

/**
 * Build RRULE parameters from an array of actual dates.
 *
 * Algorithm:
 * 1. Sort dates ascending → dtstart = first, until = last
 * 2. Extract unique day-of-week → byDay
 * 3. Group dates by day-of-week, compute gaps between consecutive same-day dates
 * 4. Mode of all gaps → interval
 */
export function buildRecurrenceParams(dates: Date[]): RecurrenceParams {
    const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const dtstart = sorted[0];
    const until = sorted[sorted.length - 1];

    // Extract unique days of the week
    const daySet = new Set<string>();
    for (const d of sorted) {
        daySet.add(DAY_ABBR[d.getDay()]);
    }
    const byDay = [...daySet].sort(
        (a, b) =>
            DAY_ABBR.indexOf(a as (typeof DAY_ABBR)[number]) -
            DAY_ABBR.indexOf(b as (typeof DAY_ABBR)[number])
    );

    // Group dates by day-of-week and compute gaps
    const datesByDay = new Map<number, Date[]>();
    for (const d of sorted) {
        const day = d.getDay();
        const list = datesByDay.get(day);
        if (list) {
            list.push(d);
        } else {
            datesByDay.set(day, [d]);
        }
    }

    const allGaps: number[] = [];
    for (const dayDates of datesByDay.values()) {
        for (let i = 1; i < dayDates.length; i++) {
            const gap = weekGap(dayDates[i - 1], dayDates[i]);
            if (gap > 0) allGaps.push(gap);
        }
    }

    const interval = mode(allGaps);

    return { dtstart, until, byDay, interval };
}

// ============================================
// 4. Ideal Schedule Generation
// ============================================

/**
 * Expand RRULE parameters into an array of ideal dates.
 *
 * Generates every date from dtstart to until that matches byDay + interval.
 */
export function generateIdealDates(params: RecurrenceParams): Date[] {
    const { dtstart, until, byDay, interval } = params;
    const idealDates: Date[] = [];

    // Convert byDay strings to day numbers (0=SU..6=SA)
    const targetDays = new Set(byDay.map((d) => DAY_ABBR.indexOf(d as (typeof DAY_ABBR)[number])));

    // Find the Monday of dtstart's week (or Sunday if SU is first day)
    const startDate = new Date(dtstart);
    const untilTime = until.getTime() + 86400000; // include the until date

    // We iterate week by week from the week of dtstart
    // First, find the start of dtstart's week (Monday)
    const weekStart = new Date(startDate);
    const dayOfWeek = weekStart.getDay(); // 0=Sun
    // Go back to Monday (day 1)
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(weekStart.getDate() - daysToMonday);

    let weekCounter = 0;

    for (
        let currentWeekStart = new Date(weekStart);
        currentWeekStart.getTime() <= untilTime;
        currentWeekStart.setDate(currentWeekStart.getDate() + 7), weekCounter++
    ) {
        // Only generate dates on interval-matching weeks
        if (weekCounter % interval !== 0) continue;

        // Check each day of this week
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const candidate = new Date(currentWeekStart);
            candidate.setDate(candidate.getDate() + dayOffset);

            // Convert dayOffset (0=Mon) to JS day (0=Sun)
            const jsDay = candidate.getDay();

            if (!targetDays.has(jsDay)) continue;
            if (candidate.getTime() < dtstart.getTime()) continue;
            if (candidate.getTime() > until.getTime()) continue;

            idealDates.push(new Date(candidate));
        }
    }

    return idealDates;
}

// ============================================
// 5. Exception Detection
// ============================================

/**
 * Normalize a date to midnight (yyyy-mm-dd comparable string).
 */
function dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Check if an entry's mutable attributes match the master info.
 */
function matchesMaster(entry: TimetableEntry, master: MasterInfo): boolean {
    const locMatch = !master.location.isConsensus || entry.location === master.location.winner;
    const lecMatch = !master.lecturer.isConsensus || entry.lecturer === master.lecturer.winner;
    const deptMatch =
        !master.department.isConsensus || entry.department === master.department.winner;
    return locMatch && lecMatch && deptMatch;
}

/**
 * Detect exceptions by comparing ideal schedule vs actual entries.
 *
 * Four cases:
 * 1. A ∩ B, same attrs → skip (RRULE handles it)
 * 2. A - B → EXDATE (student is off)
 * 3. B - A, same attrs → RDATE (makeup class)
 * 4. B with different attrs → Override (RECURRENCE-ID)
 */
export function detectExceptions(
    idealDates: Date[],
    actualEntries: TimetableEntry[],
    masterInfo: MasterInfo
): RecurrenceExceptions {
    // Build sets for comparison
    const idealSet = new Set(idealDates.map(dateKey));
    const actualMap = new Map<string, TimetableEntry>();
    for (const entry of actualEntries) {
        const d = parseDateVN(entry.date);
        if (d) actualMap.set(dateKey(d), entry);
    }

    const exdates: Date[] = [];
    const rdates: Date[] = [];
    const overrides: OverrideEvent[] = [];

    // Check ideal dates against actual
    for (const idealDate of idealDates) {
        const key = dateKey(idealDate);
        const actual = actualMap.get(key);

        if (!actual) {
            // Case 2: In ideal but not actual → EXDATE
            exdates.push(idealDate);
        } else if (!matchesMaster(actual, masterInfo)) {
            // Case 4: In both but attributes differ → Override
            overrides.push({ recurrenceId: idealDate, entry: actual });
        }
        // Case 1: In both and matches → skip (RRULE handles it)
    }

    // Check actual entries not in ideal
    for (const [key, entry] of actualMap) {
        if (!idealSet.has(key)) {
            const d = parseDateVN(entry.date);
            if (!d) continue;

            if (matchesMaster(entry, masterInfo)) {
                // Case 3: Not in ideal, same attrs → RDATE
                rdates.push(d);
            } else {
                // Case 4 variant: Not in ideal, different attrs → Override + RDATE
                // We need both RDATE (to add the date) and override (to change attrs)
                // But since RECURRENCE-ID only works for dates in RRULE or RDATE,
                // we add it as RDATE with an override
                rdates.push(d);
                overrides.push({ recurrenceId: d, entry });
            }
        }
    }

    return { exdates, rdates, overrides };
}

// ============================================
// 6. Pipeline
// ============================================

/**
 * Build the complete recurring series from a flat list of timetable entries.
 *
 * Pipeline: group → vote → rrule → ideal → detect → output
 *
 * @param entries - All timetable entries for a semester
 * @returns Array of RecurringSeries, one per classCode+periods group
 */
export function buildRecurringSeries(entries: TimetableEntry[]): RecurringSeries[] {
    const groups = groupEntries(entries);
    const results: RecurringSeries[] = [];

    for (const group of groups) {
        // Need at least 2 entries to form a recurring series
        if (group.entries.length < 2) continue;

        // Parse dates
        const dates = parseDates(group.entries.map((e) => e.date));
        if (dates.length < 2) continue;

        // Step 1: Majority voting
        const masterInfo = computeMasterInfo(group);

        // Step 2: Build RRULE
        const rrule = buildRecurrenceParams(dates);

        // Step 3: Generate ideal dates
        const idealDates = generateIdealDates(rrule);

        // Step 4: Detect exceptions
        const exceptions = detectExceptions(idealDates, group.entries, masterInfo);

        // Generate UID
        const periodsStr = group.periods.join('-');
        const uid = `${group.classCode}-P${periodsStr}@svhaui-helper`;

        results.push({ group, masterInfo, rrule, exceptions, uid });
    }

    return results;
}
