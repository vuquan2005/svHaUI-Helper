/**
 * Export Exam Feature - ICS Generator
 * Merges exam plan + schedule data and generates ICS calendar events.
 *
 * Matching logic: Schedule entries are matched to Plan entries by examDate + examTime.
 * UID format: exam-{classCode}-{attempt}@haui
 */

import ical, { ICalCalendarMethod, ICalEventStatus, type ICalCalendar } from 'ical-generator';
import { ExamPlanEntry, ExamScheduleEntry, ExamEvent } from './types';
import { buildUTCDate } from '../../utils/date';
import { downloadFile } from '../../utils/download';

// ============================================
// Exam Time Parsing
// ============================================

/**
 * Estimated exam duration in minutes.
 * Most HaUI exams are 60-90 minutes. We use 90 as a safe default.
 */
const EXAM_DURATION_MINUTES = 90;

/**
 * Parse exam time string (H'h'mm format) to HH:mm format.
 * Examples: "7h00" → "07:00", "13h30" → "13:30", "9h45" → "09:45"
 */
export function parseExamTime(timeStr: string): string | null {
    const match = timeStr.match(/^(\d{1,2})h(\d{2})$/);
    if (!match) return null;

    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Calculate end time by adding duration to start time.
 *
 * @param startTime - HH:mm format
 * @param durationMinutes - Duration in minutes
 * @returns End time in HH:mm format
 */
function addMinutes(startTime: string, durationMinutes: number): string {
    const [hour, minute] = startTime.split(':').map(Number);
    const totalMinutes = hour * 60 + minute + durationMinutes;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}

// ============================================
// Normalization & Fallback Helpers
// ============================================

/**
 * Normalizes course name for flexible matching (removes accents, punctuation, lowercases).
 */
export function normalizeCourseName(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]/g, '');
}

/**
 * Generate a deterministic fallback classCode when not found in plan.
 * Uses normalized course name + schedule exam date.
 */
export function generateFallbackClassCode(courseName: string, examDate: string): string {
    const slug = normalizeCourseName(courseName) || 'course';
    const dateFormatted = examDate.replace(/[^\d]/g, '');
    return `${slug}-${dateFormatted}`;
}

// ============================================
// Matching Key
// ============================================

/**
 * Create a matching key from examDate + examTime.
 * Normalizes the time to HH:mm for consistent matching.
 */
function matchKey(examDate: string, examTime: string): string {
    const normalizedTime = parseExamTime(examTime) ?? examTime;
    return `${examDate}|${normalizedTime}`;
}

// ============================================
// Data Merging
// ============================================

/**
 * Merge exam schedule entries with plan entries.
 * Uses a cascade matching strategy:
 * 1. Exact match by examDate + examTime
 * 2. Match by normalized course name + attempt
 * 3. Match by normalized course name
 * 4. Fallback: Generate fallback classCode using schedule's actual date
 *
 * Always uses the Schedule's examDate & examTime as the single source of truth for time.
 *
 * @param scheduleEntries - Parsed from schedule page
 * @param planEntries - Cached from plan page
 * @returns Merged ExamEvent array and list of unmatched schedule entries
 */
export function mergeExamData(
    scheduleEntries: ExamScheduleEntry[],
    planEntries: ExamPlanEntry[]
): { events: ExamEvent[]; unmatched: ExamScheduleEntry[] } {
    // 1. Exact lookup map by examDate + examTime
    const exactPlanMap = new Map<string, ExamPlanEntry>();
    for (const plan of planEntries) {
        const key = matchKey(plan.examDate, plan.examTime);
        exactPlanMap.set(key, plan);
    }

    // 2. Course name + attempt lookup map
    const courseAttemptPlanMap = new Map<string, ExamPlanEntry>();
    for (const plan of planEntries) {
        const key = `${normalizeCourseName(plan.course)}|${plan.attempt}`;
        courseAttemptPlanMap.set(key, plan);
    }

    // 3. Course name alone lookup map
    const coursePlanMap = new Map<string, ExamPlanEntry>();
    for (const plan of planEntries) {
        const key = normalizeCourseName(plan.course);
        coursePlanMap.set(key, plan);
    }

    const events: ExamEvent[] = [];
    const unmatched: ExamScheduleEntry[] = [];
    const matchedPlanSet = new Set<ExamPlanEntry>();

    for (const schedule of scheduleEntries) {
        const exactKey = matchKey(schedule.examDate, schedule.examTime);
        const courseAttemptKey = `${normalizeCourseName(schedule.course)}|${schedule.attempt}`;
        const courseKey = normalizeCourseName(schedule.course);

        const plan =
            exactPlanMap.get(exactKey) ||
            courseAttemptPlanMap.get(courseAttemptKey) ||
            coursePlanMap.get(courseKey);

        if (plan) {
            matchedPlanSet.add(plan);
            events.push({
                classCode: plan.classCode,
                course: schedule.course, // Schedule has the official course title
                examDate: schedule.examDate, // Always prioritize schedule's actual exam date
                examTime: schedule.examTime, // Always prioritize schedule's actual exam time
                attempt: schedule.attempt,
                sbd: schedule.sbd,
                position: schedule.position,
                room: schedule.room,
                building: schedule.building,
                department: plan.department,
            });
        } else {
            unmatched.push(schedule);
            // Fallback: Create event with deterministic classCode using schedule's actual date
            events.push({
                classCode: generateFallbackClassCode(schedule.course, schedule.examDate),
                course: schedule.course,
                examDate: schedule.examDate,
                examTime: schedule.examTime,
                attempt: schedule.attempt,
                sbd: schedule.sbd,
                position: schedule.position,
                room: schedule.room,
                building: schedule.building,
            });
        }
    }

    // Two-way merge: Append remaining plan entries not yet assigned rooms in schedule
    for (const plan of planEntries) {
        if (!matchedPlanSet.has(plan)) {
            events.push({
                classCode: plan.classCode,
                course: plan.course,
                examDate: plan.examDate,
                examTime: plan.examTime,
                attempt: plan.attempt,
                department: plan.department,
            });
        }
    }

    return { events, unmatched };
}

/**
 * Convert plan entries to ExamEvents (when only plan data is available).
 *
 * @param planEntries - Entries from plan storage
 * @returns ExamEvent array (without schedule fields like SBD, room, etc.)
 */
export function planEntriesToEvents(planEntries: ExamPlanEntry[]): ExamEvent[] {
    return planEntries.map((plan) => ({
        classCode: plan.classCode,
        course: plan.course,
        examDate: plan.examDate,
        examTime: plan.examTime,
        attempt: plan.attempt,
        department: plan.department,
    }));
}

// ============================================
// ICS Event Builder
// ============================================

/**
 * Build description text for an exam event.
 */
function buildExamDescription(event: ExamEvent): string {
    const parts: string[] = [];

    parts.push(`Mã lớp: ${event.classCode}`);

    if (event.sbd) {
        parts.push(`SBD: ${event.sbd}`);
    }

    if (event.position) {
        parts.push(`Vị trí: ${event.position}`);
    }

    if (event.attempt) {
        parts.push(`Lần thi: ${event.attempt}`);
    }

    if (event.department) {
        parts.push(`Khoa: ${event.department}`);
    }

    if (!event.room && !event.building) {
        parts.push(`Trạng thái: (Đang chờ trường xếp phòng thi)`);
    }

    if (event.room && event.building) {
        parts.push(`Phòng: ${event.room} - ${event.building}`);
    } else if (event.room) {
        parts.push(`Phòng: ${event.room}`);
    }

    return parts.join('\n');
}

/**
 * Build location string for an exam event.
 */
function buildExamLocation(event: ExamEvent): string | undefined {
    if (event.room && event.building) {
        return `${event.room} - ${event.building}`;
    }
    return event.room || event.building || undefined;
}

/**
 * Create an ICS event from an ExamEvent.
 */
function createExamEvent(cal: ICalCalendar, event: ExamEvent, usedUids: Set<string>): void {
    const startTime = parseExamTime(event.examTime);
    if (!startTime) return;

    const endTime = addMinutes(startTime, EXAM_DURATION_MINUTES);

    const start = buildUTCDate(event.examDate, startTime);
    const end = buildUTCDate(event.examDate, endTime);
    if (!start || !end) return;

    // Stable UID format: exam-{classCode}-{attempt}@svhaui.helper
    const baseUid = `exam-${event.classCode}-${event.attempt}@svhaui.helper`;
    const dateCompact = event.examDate.replace(/[^\d]/g, '');
    const uid = usedUids.has(baseUid) ? `${baseUid}-${dateCompact}` : baseUid;
    usedUids.add(uid);

    const titlePrefix = event.attempt > 1 ? `[Thi Lần ${event.attempt}]` : '[THI]';

    cal.createEvent({
        id: uid,
        start,
        end,
        summary: `${titlePrefix} ${event.course}`,
        description: buildExamDescription(event),
        location: buildExamLocation(event),
        status: ICalEventStatus.CONFIRMED,
    });
}

// ============================================
// Main Generator
// ============================================

/**
 * Generate ICS content from exam events.
 *
 * @param events - Merged exam events
 * @param calendarName - Display name for the calendar
 * @returns ICS file content string
 */
export function generateExamICS(
    events: ExamEvent[],
    calendarName: string = 'HaUI - Lịch thi'
): string {
    if (events.length === 0) return '';

    const cal = ical({
        name: calendarName,
        prodId: '-//QuanVu//svHaUI Helper//VI',
    });
    cal.method(ICalCalendarMethod.PUBLISH);

    const usedUids = new Set<string>();
    for (const event of events) {
        createExamEvent(cal, event, usedUids);
    }

    return cal.toString();
}

// ============================================
// File Download
// ============================================

/**
 * Download an exam ICS file.
 *
 * @param content - ICS file content
 * @param filename - Suggested filename
 */
export function downloadExamICSFile(content: string, filename: string): void {
    downloadFile(content, filename, 'text/calendar;charset=utf-8');
}
