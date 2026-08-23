import { describe, it, expect } from 'vitest';
import { parseExamDateTime, getExamCountdown, detectExamSemester } from '../time-utils';

describe('parseExamDateTime', () => {
    it('parses valid date and time strings to Date', () => {
        const date = parseExamDateTime('25/06/2026', '7h30');
        expect(date).not.toBeNull();
        expect(date!.getFullYear()).toBe(2026);
        expect(date!.getMonth()).toBe(5); // June (0-indexed)
        expect(date!.getDate()).toBe(25);
        expect(date!.getHours()).toBe(7);
        expect(date!.getMinutes()).toBe(30);
    });

    it('returns null for invalid date/time', () => {
        expect(parseExamDateTime('invalid', '7h00')).toBeNull();
        expect(parseExamDateTime('25/06/2026', 'invalid')).toBeNull();
    });
});

describe('getExamCountdown', () => {
    // Reference date: 20/06/2026 at 08:00
    const now = new Date(2026, 5, 20, 8, 0, 0);

    it('calculates urgent status for exam within 3 days', () => {
        const countdown = getExamCountdown('22/06/2026', '7h00', now);
        expect(countdown.direction).toBe(1);
        expect(countdown.urgency).toBe('urgent');
        expect(countdown.days).toBe(1);
        expect(countdown.shortLabel).toBe('Còn 1 ngày');
    });

    it('calculates warning status for exam within 7 days', () => {
        const countdown = getExamCountdown('26/06/2026', '7h00', now);
        expect(countdown.direction).toBe(1);
        expect(countdown.urgency).toBe('warning');
        expect(countdown.days).toBe(5);
        expect(countdown.shortLabel).toBe('Còn 5 ngày');
    });

    it('calculates notice status for exam within 14 days', () => {
        const countdown = getExamCountdown('02/07/2026', '7h00', now);
        expect(countdown.direction).toBe(1);
        expect(countdown.urgency).toBe('notice');
        expect(countdown.days).toBe(11);
    });

    it('calculates passed status for past exams', () => {
        const countdown = getExamCountdown('15/06/2026', '7h00', now);
        expect(countdown.direction).toBe(-1);
        expect(countdown.urgency).toBe('passed');
        expect(countdown.shortLabel).toBe('Đã thi');
    });

    it('calculates today status for exam occurring today', () => {
        const countdown = getExamCountdown('20/06/2026', '13h30', now);
        expect(countdown.direction).toBe(1);
        expect(countdown.urgency).toBe('urgent');
        expect(countdown.days).toBe(0);
        expect(countdown.shortLabel).toContain('Hôm nay');
    });
});

describe('detectExamSemester', () => {
    it('detects Term 1 from Sep to Feb (with lag)', () => {
        expect(detectExamSemester(new Date(2026, 8, 15))).toBe('20261'); // Sep 2026
        expect(detectExamSemester(new Date(2026, 11, 20))).toBe('20261'); // Dec 2026
        expect(detectExamSemester(new Date(2027, 0, 10))).toBe('20261'); // Jan 2027
        expect(detectExamSemester(new Date(2027, 1, 25))).toBe('20261'); // Feb 2027
    });

    it('detects Term 2 from Mar to Jul', () => {
        expect(detectExamSemester(new Date(2026, 2, 1))).toBe('20252'); // Mar 2026
        expect(detectExamSemester(new Date(2026, 5, 20))).toBe('20252'); // Jun 2026
        expect(detectExamSemester(new Date(2026, 6, 15))).toBe('20252'); // Jul 2026
    });

    it('detects Term 4 (Summer) in August', () => {
        expect(detectExamSemester(new Date(2026, 7, 23))).toBe('20254'); // Aug 23, 2026
    });
});
