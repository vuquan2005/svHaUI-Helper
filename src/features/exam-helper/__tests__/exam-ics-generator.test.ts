import { describe, it, expect } from 'vitest';
import {
    parseExamTime,
    normalizeCourseName,
    generateFallbackClassCode,
    mergeExamData,
    generateExamICS,
} from '../exam-ics-generator';
import type { ExamPlanEntry, ExamScheduleEntry } from '../types';

describe('parseExamTime', () => {
    it('parses valid time strings', () => {
        expect(parseExamTime('7h00')).toBe('07:00');
        expect(parseExamTime('07h00')).toBe('07:00');
        expect(parseExamTime('13h30')).toBe('13:30');
        expect(parseExamTime('9h45')).toBe('09:45');
    });

    it('returns null for invalid time strings', () => {
        expect(parseExamTime('invalid')).toBeNull();
        expect(parseExamTime('25h00')).toBeNull();
        expect(parseExamTime('12h65')).toBeNull();
    });
});

describe('normalizeCourseName', () => {
    it('normalizes Vietnamese characters, punctuation, and casing', () => {
        expect(normalizeCourseName('Lập trình Web')).toBe('laptrinhweb');
        expect(normalizeCourseName('  Cơ sở dữ liệu  (LT) ')).toBe('cosodulieult');
        expect(normalizeCourseName('Đồ án tốt nghiệp')).toBe('doantotnghiep');
    });
});

describe('generateFallbackClassCode', () => {
    it('creates deterministic class code from name and date', () => {
        expect(generateFallbackClassCode('Lập trình Web', '20/06/2026')).toBe(
            'laptrinhweb-20062026'
        );
    });
});

describe('mergeExamData', () => {
    const mockPlan: ExamPlanEntry[] = [
        {
            classCode: '20251IT6015001',
            course: 'Lập trình Web',
            examDate: '20/06/2026',
            examTime: '7h00',
            attempt: 1,
            department: 'CNTT',
        },
        {
            classCode: '20251IT6020001',
            course: 'Cơ sở dữ liệu',
            examDate: '25/06/2026',
            examTime: '9h30',
            attempt: 1,
            department: 'CNTT',
        },
    ];

    it('merges exact date + time matches and includes remaining unassigned plan courses', () => {
        const schedule: ExamScheduleEntry[] = [
            {
                course: 'Lập trình Web',
                examDate: '20/06/2026',
                examTime: '7h00',
                attempt: 1,
                sbd: '15',
                position: 'A15',
                room: '402',
                building: 'A1',
            },
        ];

        const { events, unmatched } = mergeExamData(schedule, mockPlan);
        expect(unmatched).toHaveLength(0);
        // 1 matched with schedule + 1 remaining from plan
        expect(events).toHaveLength(2);

        // First event: matched with schedule details
        expect(events[0].classCode).toBe('20251IT6015001');
        expect(events[0].room).toBe('402');
        expect(events[0].sbd).toBe('15');
        expect(events[0].department).toBe('CNTT');

        // Second event: from plan, not yet assigned room
        expect(events[1].classCode).toBe('20251IT6020001');
        expect(events[1].course).toBe('Cơ sở dữ liệu');
        expect(events[1].room).toBeUndefined();
    });

    it('matches by course name when exam date/time has been changed in official schedule', () => {
        const schedule: ExamScheduleEntry[] = [
            {
                course: 'Cơ sở dữ liệu',
                examDate: '27/06/2026', // date shifted from 25 to 27
                examTime: '13h30', // time shifted from 9h30 to 13h30
                attempt: 1,
                sbd: '20',
                position: 'B20',
                room: '501',
                building: 'A2',
            },
        ];

        const { events, unmatched } = mergeExamData(schedule, mockPlan);
        expect(unmatched).toHaveLength(0);
        expect(events[0].classCode).toBe('20251IT6020001');
        expect(events[0].examDate).toBe('27/06/2026'); // prioritizes schedule's actual date
        expect(events[0].examTime).toBe('13h30'); // prioritizes schedule's actual time
    });

    it('falls back gracefully with deterministic classCode when course is completely absent from plan', () => {
        const schedule: ExamScheduleEntry[] = [
            {
                course: 'Toán cao cấp',
                examDate: '30/06/2026',
                examTime: '7h00',
                attempt: 1,
                sbd: '05',
                position: 'A05',
                room: '301',
                building: 'A1',
            },
        ];

        const { events, unmatched } = mergeExamData(schedule, mockPlan);
        expect(unmatched).toHaveLength(1);
        // 1 fallback schedule + 2 unassigned plan entries
        expect(events).toHaveLength(3);
        expect(events[0].classCode).toBe('toancaocap-30062026');
        expect(events[0].course).toBe('Toán cao cấp');
    });
});

describe('generateExamICS', () => {
    it('generates valid ICS content with UID, summary, and description', () => {
        const events = [
            {
                classCode: '20251IT6015001',
                course: 'Lập trình Web',
                examDate: '20/06/2026',
                examTime: '7h00',
                attempt: 1,
                sbd: '15',
                position: 'A15',
                room: '402',
                building: 'A1',
                department: 'CNTT',
            },
        ];

        const ics = generateExamICS(events, 'Lịch thi test');
        expect(ics).toContain('BEGIN:VCALENDAR');
        expect(ics).toContain('SUMMARY:[THI] Lập trình Web');
        expect(ics).toContain('UID:exam-20251IT6015001-1@svhaui.helper');
        expect(ics).toContain('LOCATION:402 - A1');
        expect(ics).toContain('Mã lớp: 20251IT6015001');
        expect(ics).toContain('SBD: 15');
        expect(ics).toContain('Khoa: CNTT');
        expect(ics).toContain('END:VCALENDAR');
    });

    it('returns empty string for empty event list', () => {
        expect(generateExamICS([])).toBe('');
    });
});
