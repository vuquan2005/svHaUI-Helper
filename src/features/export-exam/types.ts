/**
 * Export Exam Feature - Type Definitions
 */

// ============================================
// Exam Plan Entry (from /student/schedulefees/examplant?code=...)
// ============================================

/**
 * A single exam entry parsed from the Exam Plan detail page.
 * Contains the class code (mã lớp độc lập) which is critical for ICS UID generation.
 */
export interface ExamPlanEntry {
    /** Mã lớp độc lập (e.g., "20251BS101001") — contains year+semester+subject+sequence */
    classCode: string;
    /** Tên học phần */
    course: string;
    /** Ngày thi dự kiến (dd/MM/yyyy) */
    examDate: string;
    /** Giờ bắt đầu thi (H'h'mm, e.g. "7h00") */
    examTime: string;
    /** Lần thi (1, 2...) */
    attempt: number;
    /** Lớp ưu tiên / lớp hành chính */
    priorityClass?: string;
    /** Khoa quản lý */
    department?: string;
}

// ============================================
// Exam Schedule Entry (from /student/schedulefees/transactionmodules)
// ============================================

/**
 * A single exam entry parsed from the Exam Schedule page.
 * Has full logistic details (room, SBD, position) but NO class code.
 */
export interface ExamScheduleEntry {
    /** Tên học phần */
    course: string;
    /** Ngày thi (dd/MM/yyyy) */
    examDate: string;
    /** Ca thi / Giờ bắt đầu (H'h'mm) */
    examTime: string;
    /** Số báo danh */
    sbd: string;
    /** Lần thi (1, 2...) */
    attempt: number;
    /** Vị trí ngồi (e.g. "A12") */
    position: string;
    /** Phòng thi */
    room: string;
    /** Tòa nhà (e.g. "A1") */
    building: string;
    /** Cơ sở (optional, usually not needed) */
    campus?: string;
}

// ============================================
// Merged Exam Event (for ICS generation)
// ============================================

/**
 * Combined exam event merging plan + schedule data.
 * classCode is required (from plan) to generate stable UIDs.
 */
export interface ExamEvent {
    /** Mã lớp độc lập — required for UID */
    classCode: string;
    /** Tên học phần */
    course: string;
    /** Ngày thi (dd/MM/yyyy) */
    examDate: string;
    /** Ca thi (H'h'mm) */
    examTime: string;
    /** Lần thi */
    attempt: number;
    /** Số báo danh (from schedule) */
    sbd?: string;
    /** Vị trí ngồi (from schedule) */
    position?: string;
    /** Phòng thi (from schedule) */
    room?: string;
    /** Tòa nhà (from schedule) */
    building?: string;
    /** Khoa (from plan) */
    department?: string;
}

// ============================================
// Feature Storage
// ============================================

/**
 * Shape of the feature's scoped storage (GM storage).
 */
export interface ExportExamStorage {
    /** Cached exam plan entries from all fetched class codes */
    planEntries?: ExamPlanEntry[];
    /** ISO datetime of last full fetch */
    lastFetchTime?: string;
    /** ISO datetime of last auto-update check */
    lastAutoUpdate?: string;
    [key: string]: unknown;
}
