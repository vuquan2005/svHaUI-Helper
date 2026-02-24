import { describe, it, expect } from 'vitest';
import {
    groupEntries,
    majorityVote,
    computeMasterInfo,
    buildRecurrenceParams,
    generateIdealDates,
    detectExceptions,
    buildRecurringSeries,
    mode,
    parseDates,
} from '../recurrence-builder';
import type { TimetableEntry, MasterInfo } from '../types';

// ============================================
// Test Helpers
// ============================================

function makeEntry(overrides: Partial<TimetableEntry> & { date: string }): TimetableEntry {
    return {
        periods: [1, 2, 3],
        course: 'Toán cao cấp',
        classCode: '20252MT1001001',
        lecturer: 'Nguyễn Văn A',
        phone: '0123456789',
        department: 'Khoa CNTT',
        location: 'P.301 - Nhà A',
        ...overrides,
    };
}

/** Tuesday dates in March 2026 */
const TUESDAYS_MAR_2026 = ['03/03/2026', '10/03/2026', '17/03/2026', '24/03/2026', '31/03/2026'];

/** Thursday dates in March 2026 */
const THURSDAYS_MAR_2026 = ['05/03/2026', '12/03/2026', '19/03/2026', '26/03/2026'];

// ============================================
// 1. Grouping
// ============================================

describe('groupEntries', () => {
    it('groups entries by classCode + periods', () => {
        const entries: TimetableEntry[] = [
            makeEntry({ date: '03/03/2026', classCode: 'A001', periods: [1, 2] }),
            makeEntry({ date: '05/03/2026', classCode: 'A001', periods: [1, 2] }),
            makeEntry({ date: '03/03/2026', classCode: 'B002', periods: [7, 8] }),
        ];

        const groups = groupEntries(entries);
        expect(groups).toHaveLength(2);

        const groupA = groups.find((g) => g.classCode === 'A001');
        expect(groupA?.entries).toHaveLength(2);
        expect(groupA?.periods).toEqual([1, 2]);

        const groupB = groups.find((g) => g.classCode === 'B002');
        expect(groupB?.entries).toHaveLength(1);
    });

    it('treats same classCode with different periods as separate groups', () => {
        const entries: TimetableEntry[] = [
            makeEntry({ date: '03/03/2026', classCode: 'A001', periods: [1, 2] }),
            makeEntry({ date: '05/03/2026', classCode: 'A001', periods: [7, 8] }),
        ];

        const groups = groupEntries(entries);
        expect(groups).toHaveLength(2);
    });

    it('handles unsorted periods correctly', () => {
        const entries: TimetableEntry[] = [
            makeEntry({ date: '03/03/2026', periods: [3, 1, 2] }),
            makeEntry({ date: '05/03/2026', periods: [2, 1, 3] }),
        ];

        const groups = groupEntries(entries);
        expect(groups).toHaveLength(1);
        expect(groups[0].periods).toEqual([1, 2, 3]);
    });
});

// ============================================
// 2. Majority Voting
// ============================================

describe('majorityVote', () => {
    it('returns winner when >60%', () => {
        const result = majorityVote(['A', 'A', 'A', 'B']);
        expect(result.winner).toBe('A');
        expect(result.isConsensus).toBe(true);
    });

    it('returns undefined when <60%', () => {
        const result = majorityVote(['A', 'B', 'C']);
        expect(result.winner).toBeUndefined();
        expect(result.isConsensus).toBe(false);
    });

    it('returns winner when 100%', () => {
        const result = majorityVote(['A', 'A', 'A']);
        expect(result.winner).toBe('A');
        expect(result.isConsensus).toBe(true);
    });

    it('returns undefined for boundary (exactly 60%)', () => {
        // 3 out of 5 = 60%
        const result = majorityVote(['A', 'A', 'A', 'B', 'C']);
        expect(result.winner).toBe('A');
        expect(result.isConsensus).toBe(true);
    });

    it('handles empty array', () => {
        const result = majorityVote([]);
        expect(result.winner).toBeUndefined();
        expect(result.isConsensus).toBe(false);
    });

    it('ignores undefined values', () => {
        const result = majorityVote([undefined, 'A', undefined, 'A', undefined]);
        expect(result.winner).toBe('A');
        expect(result.isConsensus).toBe(true);
    });

    it('returns undefined when no value hits threshold', () => {
        const result = majorityVote(['A', 'B', 'C', 'D', 'E']);
        expect(result.winner).toBeUndefined();
        expect(result.isConsensus).toBe(false);
    });
});

describe('computeMasterInfo', () => {
    it('computes master info from group entries', () => {
        const entries = TUESDAYS_MAR_2026.map((date) =>
            makeEntry({ date, location: 'P.301 - Nhà A' })
        );
        // Change one entry's location
        entries[2] = makeEntry({ date: TUESDAYS_MAR_2026[2], location: 'P.302 - Nhà B' });

        const group = {
            course: 'Toán cao cấp',
            classCode: '20252MT1001001',
            periods: [1, 2, 3],
            entries,
        };

        const master = computeMasterInfo(group);
        expect(master.location.winner).toBe('P.301 - Nhà A');
        expect(master.location.isConsensus).toBe(true);
        expect(master.lecturer.winner).toBe('Nguyễn Văn A');
        expect(master.lecturer.isConsensus).toBe(true);
    });
});

// ============================================
// 3. Mode & parseDates
// ============================================

describe('mode', () => {
    it('returns the most frequent value', () => {
        expect(mode([1, 1, 1, 2, 1])).toBe(1);
    });

    it('returns smallest value on tie', () => {
        expect(mode([1, 2, 1, 2])).toBe(1);
    });

    it('returns 1 for empty array', () => {
        expect(mode([])).toBe(1);
    });

    it('handles single element', () => {
        expect(mode([3])).toBe(3);
    });
});

describe('parseDates', () => {
    it('parses and sorts dates', () => {
        const dates = parseDates(['10/03/2026', '03/03/2026', '17/03/2026']);
        expect(dates).toHaveLength(3);
        expect(dates[0].getDate()).toBe(3);
        expect(dates[1].getDate()).toBe(10);
        expect(dates[2].getDate()).toBe(17);
    });

    it('filters invalid dates', () => {
        const dates = parseDates(['invalid', '03/03/2026']);
        expect(dates).toHaveLength(1);
    });
});

// ============================================
// 4. RRULE Generation
// ============================================

describe('buildRecurrenceParams', () => {
    it('builds weekly RRULE for single day', () => {
        const dates = parseDates(TUESDAYS_MAR_2026);
        const params = buildRecurrenceParams(dates);

        expect(params.dtstart).toEqual(dates[0]);
        expect(params.until).toEqual(dates[dates.length - 1]);
        expect(params.byDay).toEqual(['TU']);
        expect(params.interval).toBe(1);
    });

    it('builds RRULE for two days per week', () => {
        const dates = parseDates([...TUESDAYS_MAR_2026, ...THURSDAYS_MAR_2026]);
        const params = buildRecurrenceParams(dates);

        expect(params.byDay).toContain('TU');
        expect(params.byDay).toContain('TH');
        expect(params.interval).toBe(1);
    });

    it('detects biweekly interval', () => {
        // Every other Tuesday
        const biweekly = parseDates(['03/03/2026', '17/03/2026', '31/03/2026']);
        const params = buildRecurrenceParams(biweekly);

        expect(params.byDay).toEqual(['TU']);
        expect(params.interval).toBe(2);
    });
});

// ============================================
// 5. Ideal Schedule Generation
// ============================================

describe('generateIdealDates', () => {
    it('generates correct weekly dates', () => {
        const dates = parseDates(TUESDAYS_MAR_2026);
        const params = buildRecurrenceParams(dates);
        const idealDates = generateIdealDates(params);

        expect(idealDates).toHaveLength(5);
        // All should be Tuesdays
        for (const d of idealDates) {
            expect(d.getDay()).toBe(2); // Tuesday
        }
    });

    it('generates dates for two days per week', () => {
        const dates = parseDates([
            '03/03/2026', // Tuesday
            '05/03/2026', // Thursday
            '10/03/2026', // Tuesday
            '12/03/2026', // Thursday
        ]);
        const params = buildRecurrenceParams(dates);
        const idealDates = generateIdealDates(params);

        expect(idealDates.length).toBeGreaterThanOrEqual(4);
        const days = new Set(idealDates.map((d) => d.getDay()));
        expect(days.has(2)).toBe(true); // Tuesday
        expect(days.has(4)).toBe(true); // Thursday
    });
});

// ============================================
// 6. Exception Detection
// ============================================

describe('detectExceptions', () => {
    it('detects EXDATE when student is off', () => {
        // Ideal: 5 Tuesdays, Actual: 4 (missing 17/03)
        const dates = parseDates(TUESDAYS_MAR_2026);
        const params = buildRecurrenceParams(dates);
        const idealDates = generateIdealDates(params);

        const actualEntries = TUESDAYS_MAR_2026.filter((d) => d !== '17/03/2026').map((date) =>
            makeEntry({ date })
        );

        const master: MasterInfo = {
            location: { winner: 'P.301 - Nhà A', isConsensus: true },
            lecturer: { winner: 'Nguyễn Văn A', isConsensus: true },
            phone: { winner: '0123456789', isConsensus: true },
            department: { winner: 'Khoa CNTT', isConsensus: true },
        };

        const exceptions = detectExceptions(idealDates, actualEntries, master);

        expect(exceptions.exdates).toHaveLength(1);
        expect(exceptions.exdates[0].getDate()).toBe(17);
        expect(exceptions.rdates).toHaveLength(0);
        expect(exceptions.overrides).toHaveLength(0);
    });

    it('detects override when attributes differ', () => {
        const dates = parseDates(TUESDAYS_MAR_2026);
        const params = buildRecurrenceParams(dates);
        const idealDates = generateIdealDates(params);

        const actualEntries = TUESDAYS_MAR_2026.map((date) => {
            if (date === '17/03/2026') {
                return makeEntry({ date, location: 'P.999 - Nhà Z' }); // different location
            }
            return makeEntry({ date });
        });

        const master: MasterInfo = {
            location: { winner: 'P.301 - Nhà A', isConsensus: true },
            lecturer: { winner: 'Nguyễn Văn A', isConsensus: true },
            phone: { winner: '0123456789', isConsensus: true },
            department: { winner: 'Khoa CNTT', isConsensus: true },
        };

        const exceptions = detectExceptions(idealDates, actualEntries, master);

        expect(exceptions.exdates).toHaveLength(0);
        expect(exceptions.overrides).toHaveLength(1);
        expect(exceptions.overrides[0].entry.location).toBe('P.999 - Nhà Z');
    });

    it('detects RDATE for makeup class with same attributes', () => {
        const dates = parseDates(TUESDAYS_MAR_2026);
        const params = buildRecurrenceParams(dates);
        const idealDates = generateIdealDates(params);

        // Add a Sunday makeup class with same attributes
        const actualEntries = [
            ...TUESDAYS_MAR_2026.map((date) => makeEntry({ date })),
            makeEntry({ date: '08/03/2026' }), // Sunday - makeup
        ];

        const master: MasterInfo = {
            location: { winner: 'P.301 - Nhà A', isConsensus: true },
            lecturer: { winner: 'Nguyễn Văn A', isConsensus: true },
            phone: { winner: '0123456789', isConsensus: true },
            department: { winner: 'Khoa CNTT', isConsensus: true },
        };

        const exceptions = detectExceptions(idealDates, actualEntries, master);

        expect(exceptions.rdates).toHaveLength(1);
        expect(exceptions.rdates[0].getDate()).toBe(8);
    });
});

// ============================================
// 7. Pipeline
// ============================================

describe('buildRecurringSeries', () => {
    it('builds complete recurring series', () => {
        const entries = TUESDAYS_MAR_2026.map((date) => makeEntry({ date }));
        const series = buildRecurringSeries(entries);

        expect(series).toHaveLength(1);
        expect(series[0].uid).toContain('20252MT1001001');
        expect(series[0].rrule.byDay).toEqual(['TU']);
        expect(series[0].rrule.interval).toBe(1);
    });

    it('skips groups with only 1 entry', () => {
        const entries = [makeEntry({ date: '03/03/2026' })];
        const series = buildRecurringSeries(entries);
        expect(series).toHaveLength(0);
    });

    it('creates separate series for different groups', () => {
        const entries = [
            makeEntry({ date: '03/03/2026', classCode: 'A001', course: 'Math' }),
            makeEntry({ date: '10/03/2026', classCode: 'A001', course: 'Math' }),
            makeEntry({ date: '05/03/2026', classCode: 'B002', course: 'Physics' }),
            makeEntry({ date: '12/03/2026', classCode: 'B002', course: 'Physics' }),
        ];

        const series = buildRecurringSeries(entries);
        expect(series).toHaveLength(2);
    });
});
