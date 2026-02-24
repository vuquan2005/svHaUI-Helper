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
// Recurrence Types (RRULE pipeline)
// ============================================

/**
 * A group of entries that share the same classCode + periods,
 * representing a recurring series of classes.
 */
export interface SeriesGroup {
    /** Course name */
    course: string;
    /** Class code (e.g. "20251BS6001001") */
    classCode: string;
    /** Period numbers (sorted, e.g. [1, 2, 3]) */
    periods: number[];
    /** All entries belonging to this group */
    entries: TimetableEntry[];
}

/**
 * Result of majority voting for a field value.
 * Used to determine the "default" value for a recurring series.
 */
export interface MajorityVoteResult<T> {
    /** Winning value, undefined if no consensus (< threshold) */
    winner: T | undefined;
    /** Whether the winner met the threshold (>= 60%) */
    isConsensus: boolean;
}

/**
 * Master info derived from majority voting across all entries in a group.
 * These are the "default" values used for the recurring event.
 */
export interface MasterInfo {
    location: MajorityVoteResult<string>;
    lecturer: MajorityVoteResult<string>;
    phone: MajorityVoteResult<string>;
    department: MajorityVoteResult<string>;
}

/** RRULE parameters for a recurring event */
export interface RecurrenceParams {
    /** First occurrence date */
    dtstart: Date;
    /** Last occurrence date (RRULE UNTIL) */
    until: Date;
    /** Days of the week (e.g. ['MO', 'TH']) */
    byDay: string[];
    /** Week interval (1 = weekly, 2 = biweekly) */
    interval: number;
}

/**
 * Exceptions detected by comparing ideal schedule vs actual schedule.
 */
export interface RecurrenceExceptions {
    /** Dates in ideal but not actual — student is off (EXDATE) */
    exdates: Date[];
    /** Dates in actual but not ideal, with same attributes — makeup classes (RDATE) */
    rdates: Date[];
    /** Dates where actual attributes differ from master — overrides (RECURRENCE-ID) */
    overrides: OverrideEvent[];
}

/** An override event for a specific date in the recurring series */
export interface OverrideEvent {
    /** The date being overridden */
    recurrenceId: Date;
    /** The actual entry with different attributes */
    entry: TimetableEntry;
}

/**
 * Complete result for one recurring series, ready for ICS generation.
 */
export interface RecurringSeries {
    group: SeriesGroup;
    masterInfo: MasterInfo;
    rrule: RecurrenceParams;
    exceptions: RecurrenceExceptions;
    /** Unique identifier for this series */
    uid: string;
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
