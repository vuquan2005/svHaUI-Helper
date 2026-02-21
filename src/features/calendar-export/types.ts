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
// Export History (persisted to GM Storage)
// ============================================

export interface ExportHistoryEntry {
    /** ISO datetime of export */
    exportedAt: string;
    /** SHA-256 hash of the ICS content */
    sha256: string;
    /** Semester ID (e.g. "ky1", "ky2") */
    semesterId: string;
    /** Date range used for the export */
    dateRange: { start: string; end: string };
    /** Total number of calendar events */
    totalEvents: number;
    /** Raw timetable entries */
    events: TimetableEntry[];
}

/**
 * Shape of the feature's scoped storage
 */
export interface CalendarExportStorage {
    exportHistory: ExportHistoryEntry[];
    [key: string]: unknown;
}
