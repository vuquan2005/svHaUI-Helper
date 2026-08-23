import { describe, it, expect } from 'vitest';
import { getUpcomingExamsList, mountHomeExamWidget } from '../ui/home-exam-widget';
import { ExamPlanEntry, ExamScheduleEntry } from '../types';

describe('getUpcomingExamsList', () => {
    const fixedNow = new Date(2026, 7, 23, 12, 0, 0); // 23/08/2026

    it('returns empty array when there are no entries', () => {
        expect(getUpcomingExamsList([], [], fixedNow)).toEqual([]);
        expect(getUpcomingExamsList(undefined, undefined, fixedNow)).toEqual([]);
    });

    it('extracts upcoming exams within 14 days from planEntries', () => {
        const planEntries: ExamPlanEntry[] = [
            {
                classCode: '20254ME6052001',
                course: 'Đồ án môn học Cơ điện tử',
                examDate: '04/09/2026', // 12 days from 23/08
                examTime: '8h00',
                attempt: 1,
            },
            {
                classCode: '20254ME6030001',
                course: 'Quản lý chất lượng sản phẩm',
                examDate: '04/09/2026',
                examTime: '13h30',
                attempt: 1,
            },
        ];

        // Even if scheduleEntries contains only old exams from 2023
        const oldScheduleEntries: ExamScheduleEntry[] = [
            {
                course: 'Đường lối QP&AN',
                examDate: '24/10/2023',
                examTime: '7h30',
                sbd: '704755',
                attempt: 1,
                position: 'D3',
                room: 'C21-104',
                building: 'C21',
            },
        ];

        const list = getUpcomingExamsList(oldScheduleEntries, planEntries, fixedNow);
        expect(list.length).toBe(2);
        expect(list[0].exam.course).toBe('Đồ án môn học Cơ điện tử');
        expect(list[1].exam.course).toBe('Quản lý chất lượng sản phẩm');
        expect(list[0].countdown.days).toBe(11);
    });

    it('overlays schedule details (room, SBD) on matching plan courses', () => {
        const planEntries: ExamPlanEntry[] = [
            {
                classCode: '20254ME6052001',
                course: 'Đồ án môn học Cơ điện tử',
                examDate: '04/09/2026',
                examTime: '8h00',
                attempt: 1,
            },
        ];

        const scheduleEntries: ExamScheduleEntry[] = [
            {
                course: 'Đồ án môn học Cơ điện tử',
                examDate: '04/09/2026',
                examTime: '8h00',
                sbd: '701234',
                attempt: 1,
                position: 'A01',
                room: '502',
                building: 'A1',
            },
        ];

        const list = getUpcomingExamsList(scheduleEntries, planEntries, fixedNow);
        expect(list.length).toBe(1);
        expect(list[0].exam.room).toBe('502');
        expect(list[0].exam.building).toBe('A1');
        expect(list[0].exam.sbd).toBe('701234');
    });

    it('returns empty array if all exams are in the past or further than 14 days', () => {
        const pastPlan: ExamPlanEntry[] = [
            {
                classCode: '20241ME6112006',
                course: 'Kỹ thuật nhiệt',
                examDate: '10/01/2025',
                examTime: '7h00',
                attempt: 1,
            },
        ];

        expect(getUpcomingExamsList([], pastPlan, fixedNow)).toEqual([]);
    });
});

describe('mountHomeExamWidget', () => {
    it('returns false and does not mount when on unauthenticated login page', () => {
        const mockRoot = {
            querySelector: (selector: string) => {
                if (selector === 'div.splash-container') return {} as HTMLElement;
                return null;
            },
        } as unknown as HTMLElement;

        const widget = { isConnected: false } as HTMLElement;
        expect(mountHomeExamWidget(widget, mockRoot)).toBe(false);
    });

    it('returns false when dashboard container lacks target section', () => {
        const mockDashboard = {
            querySelector: () => null,
        } as unknown as HTMLElement;

        const mockRoot = {
            querySelector: (selector: string) => {
                if (selector === 'div.cttsv-dashboard') return mockDashboard;
                return null;
            },
        } as unknown as HTMLElement;

        const widget = { isConnected: false } as HTMLElement;
        expect(mountHomeExamWidget(widget, mockRoot)).toBe(false);
    });

    it('mounts successfully before overview section on authenticated dashboard', () => {
        let insertedChild: unknown = null;
        let insertedBefore: unknown = null;

        const mockTarget = {} as HTMLElement;
        const mockDashboard = {
            querySelector: (selector: string) => {
                if (selector === 'section.cttsv-overview-section') return mockTarget;
                return null;
            },
            insertBefore: (child: unknown, before: unknown) => {
                insertedChild = child;
                insertedBefore = before;
            },
        } as unknown as HTMLElement;

        const mockRoot = {
            querySelector: (selector: string) => {
                if (selector === 'div.cttsv-dashboard') return mockDashboard;
                return null;
            },
        } as unknown as HTMLElement;

        const widget = { isConnected: false } as HTMLElement;
        const result = mountHomeExamWidget(widget, mockRoot);

        expect(result).toBe(true);
        expect(insertedChild).toBe(widget);
        expect(insertedBefore).toBe(mockTarget);
    });

    it('mounts successfully before action grid if overview section is absent', () => {
        let insertedChild: unknown = null;
        let insertedBefore: unknown = null;

        const mockTarget = {} as HTMLElement;
        const mockDashboard = {
            querySelector: (selector: string) => {
                if (selector === 'section.cttsv-action-grid, div.cttsv-action-grid') {
                    return mockTarget;
                }
                return null;
            },
            insertBefore: (child: unknown, before: unknown) => {
                insertedChild = child;
                insertedBefore = before;
            },
        } as unknown as HTMLElement;

        const mockRoot = {
            querySelector: (selector: string) => {
                if (selector === 'div.cttsv-dashboard') return mockDashboard;
                return null;
            },
        } as unknown as HTMLElement;

        const widget = { isConnected: false } as HTMLElement;
        const result = mountHomeExamWidget(widget, mockRoot);

        expect(result).toBe(true);
        expect(insertedChild).toBe(widget);
        expect(insertedBefore).toBe(mockTarget);
    });

    it('avoids duplicate mounting if widget is already connected or in DOM', () => {
        const widget = { isConnected: true } as HTMLElement;
        const mockDashboard = {
            querySelector: () => null,
        } as unknown as HTMLElement;

        const mockRoot = {
            querySelector: (selector: string) => {
                if (selector === 'div.cttsv-dashboard') return mockDashboard;
                return null;
            },
        } as unknown as HTMLElement;

        expect(mountHomeExamWidget(widget, mockRoot)).toBe(true);
    });
});
