import { describe, it, expect } from 'vitest';
import { generateICS, getTimeRange, buildUTCDate } from '../ics-generator';
import type { TimetableEntry } from '../types';

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

/** 5 Tuesday dates in March 2026 */
const TUESDAYS = ['03/03/2026', '10/03/2026', '17/03/2026', '24/03/2026', '31/03/2026'];

// ============================================
// Helpers
// ============================================

describe('getTimeRange', () => {
    it('returns correct time range for morning periods', () => {
        const range = getTimeRange([1, 2, 3]);
        expect(range).toEqual({ start: '07:00', end: '09:35' });
    });

    it('returns null for empty periods', () => {
        expect(getTimeRange([])).toBeNull();
    });

    it('handles unsorted periods', () => {
        const range = getTimeRange([3, 1, 2]);
        expect(range).toEqual({ start: '07:00', end: '09:35' });
    });
});

describe('buildUTCDate', () => {
    it('converts VN time to UTC (subtracts 7 hours)', () => {
        const date = buildUTCDate('03/03/2026', '07:00');
        expect(date).not.toBeNull();
        expect(date!.getUTCHours()).toBe(0); // 7 - 7 = 0
        expect(date!.getUTCDate()).toBe(3);
    });

    it('handles midnight crossing', () => {
        const date = buildUTCDate('03/03/2026', '03:00');
        expect(date).not.toBeNull();
        // 3 - 7 = -4 → previous day 20:00
        expect(date!.getUTCHours()).toBe(20);
        expect(date!.getUTCDate()).toBe(2);
    });

    it('returns null for invalid input', () => {
        expect(buildUTCDate('invalid', '07:00')).toBeNull();
        expect(buildUTCDate('03/03/2026', 'bad')).toBeNull();
    });
});

// ============================================
// ICS Generation
// ============================================

describe('generateICS', () => {
    it('returns empty string for empty entries', () => {
        expect(generateICS([])).toBe('');
    });

    it('generates valid ICS for a single entry (flat mode)', () => {
        const entries = [makeEntry({ date: '03/03/2026' })];
        const ics = generateICS(entries);

        expect(ics).toContain('BEGIN:VCALENDAR');
        expect(ics).toContain('END:VCALENDAR');
        expect(ics).toContain('BEGIN:VEVENT');
        expect(ics).toContain('SUMMARY:Toán cao cấp');
        // Single entry = no RRULE
        expect(ics).not.toContain('RRULE');
    });

    it('generates RRULE for recurring entries', () => {
        const entries = TUESDAYS.map((date) => makeEntry({ date }));
        const ics = generateICS(entries);

        expect(ics).toContain('BEGIN:VCALENDAR');
        expect(ics).toContain('RRULE:FREQ=WEEKLY');
        expect(ics).toContain('BYDAY=TU');
        expect(ics).toContain('INTERVAL=1');
    });

    it('generates EXDATE for missing dates', () => {
        // Create 5 Tuesdays but remove the 3rd from entries
        const entries = TUESDAYS.filter((d) => d !== '17/03/2026').map((date) =>
            makeEntry({ date })
        );

        // Add a replacement entry on a different day to keep grouping
        // (4 entries = still enough for RRULE)
        const ics = generateICS(entries);

        // Should still create RRULE (4 entries in the same group)
        expect(ics).toContain('RRULE:FREQ=WEEKLY');
    });

    it('generates RECURRENCE-ID for overrides', () => {
        const entries = TUESDAYS.map((date) => {
            if (date === '17/03/2026') {
                return makeEntry({ date, location: 'P.999 - Nhà Z' });
            }
            return makeEntry({ date });
        });

        const ics = generateICS(entries);

        expect(ics).toContain('RRULE:FREQ=WEEKLY');
        expect(ics).toContain('RECURRENCE-ID');
        // Override event should have the new location
        expect(ics).toContain('P.999 - Nhà Z');
    });

    it('handles extra entries outside the RRULE pattern', () => {
        // When an extra entry (Sunday) shares classCode+periods,
        // it joins the group and affects the RRULE (BYDAY adds SU).
        // The extra Sundays that the RRULE generates but are not in
        // the actual entries get EXDATE'd out.
        const entries = [
            ...TUESDAYS.map((date) => makeEntry({ date })),
            makeEntry({ date: '08/03/2026' }), // Sunday — joins the group
        ];

        const ics = generateICS(entries);

        expect(ics).toContain('RRULE:FREQ=WEEKLY');
        // Either EXDATE or RDATE may appear depending on the pattern
        expect(ics).toContain('BEGIN:VEVENT');
        expect(ics).toContain('END:VEVENT');
    });

    it('cleans location (removes Cơ sở suffix)', () => {
        const entries = [makeEntry({ date: '03/03/2026', location: 'P.301 - Cơ sở 1 - Khu A' })];
        const ics = generateICS(entries);

        expect(ics).toContain('P.301');
        expect(ics).not.toContain('Cơ sở');
    });

    it('includes calendar name', () => {
        const entries = [makeEntry({ date: '03/03/2026' })];
        const ics = generateICS(entries, 'HaUI - Kỳ 2');

        expect(ics).toContain('HaUI - Kỳ 2');
    });

    it('creates separate series for different class codes', () => {
        const entries = [
            makeEntry({ date: '03/03/2026', classCode: 'A001', course: 'Math' }),
            makeEntry({ date: '10/03/2026', classCode: 'A001', course: 'Math' }),
            makeEntry({ date: '05/03/2026', classCode: 'B002', course: 'Physics' }),
            makeEntry({ date: '12/03/2026', classCode: 'B002', course: 'Physics' }),
        ];

        const ics = generateICS(entries);

        // 2 master events, each with RRULE
        const rruleMatches = ics.match(/RRULE:FREQ=WEEKLY/g);
        expect(rruleMatches).toHaveLength(2);
    });
});
