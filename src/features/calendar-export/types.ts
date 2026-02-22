/**
 * Calendar Export Feature - Type Definitions
 */

// ============================================
// Timetable Entry (parsed from DOM)
// ============================================

/**
 * A single class session parsed from the timetable.
 */
export interface TimetableEntry {
    /** Date string in dd/MM/yyyy format */
    date: string;
    /** Period numbers (e.g. [1, 2, 3]) */
    periods: number[];
    /** Course name */
    course: string;
    /** Class code (e.g. "20251BS6001001") - contains year+semester+subject+sequence */
    classCode: string;
    /** Lecturer name */
    lecturer?: string;
    /** Lecturer phone number */
    phone?: string;
    /** Department name */
    department?: string;
    /** Location (room, building, campus) */
    location?: string;
}

// ============================================
// Period Time Slot
// ============================================

export interface PeriodTimeSlot {
    period: number;
    start: string; // HH:mm
    end: string; // HH:mm
}

// ============================================
// Semester Snapshot (for update checking)
// ============================================

/**
 * Snapshot of a semester's timetable data, saved for comparison.
 */
export interface SemesterSnapshot {
    /** Semester ID (e.g. "20252") */
    semesterId: string;
    /** Raw timetable entries */
    entries: TimetableEntry[];
    /** ISO datetime when this snapshot was saved */
    savedAt: string;
    /** Date range used for the fetch */
    dateRange: { start: string; end: string };
}

// ============================================
// Timetable Diff (comparison result)
// ============================================

/**
 * Result of comparing two sets of timetable entries.
 */
export interface TimetableDiff {
    /** Entries present in new but not in old */
    added: TimetableEntry[];
    /** Entries present in old but not in new */
    removed: TimetableEntry[];
    /** Entries with same classCode+date but different details */
    changed: Array<{ old: TimetableEntry; new: TimetableEntry }>;
    /** Number of unchanged entries */
    unchanged: number;
}

// ============================================
// Feature Storage
// ============================================

/**
 * Shape of the feature's scoped storage.
 */
export interface CalendarExportStorage {
    /** Last saved timetable snapshot for the current semester */
    lastSnapshot?: SemesterSnapshot;
    /** ISO datetime of the last update check */
    lastCheckTime?: string;
    [key: string]: unknown;
}
