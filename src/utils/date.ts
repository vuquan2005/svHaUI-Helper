/**
 * Date Utilities - Utility functions for working with dates and timezones.
 */

// ============================================
// Timezone Constants
// ============================================

/** Vietnam timezone offset in hours (UTC+7) */
export const VN_UTC_OFFSET = 7;

// ============================================
// Formatting & Parsing (VN locale)
// ============================================

/**
 * Format a Date object to a string in dd/MM/yyyy format (Vietnamese common format).
 *
 * @param date - The Date object to format
 * @returns Formatted date string (e.g., "22/02/2026")
 */
export function formatDateVN(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

/**
 * Parses a date string in dd/MM/yyyy format.
 *
 * @param dateStr - The date string to parse
 * @returns Date object or null if invalid
 */
export function parseDateVN(dateStr: string): Date | null {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return null;

    return date;
}

/**
 * Build a UTC Date from a dd/MM/yyyy date string and an HH:mm time string (VN local time).
 * Converts VN time (UTC+7) to UTC automatically.
 *
 * @returns Date in UTC, or null if parsing fails.
 */
export function buildUTCDate(dateStr: string, timeStr: string): Date | null {
    const dateParts = dateStr.split('/');
    if (dateParts.length !== 3) return null;

    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);

    const timeParts = timeStr.split(':');
    if (timeParts.length !== 2) return null;

    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);

    if ([day, month, year, hour, minute].some(isNaN)) return null;

    // Create UTC date by subtracting VN offset (UTC+7)
    return new Date(Date.UTC(year, month - 1, day, hour - VN_UTC_OFFSET, minute));
}

/**
 * Convert a local VN date (midnight) to UTC for RRULE/EXDATE purposes.
 * Subtracts 7 hours from midnight VN time.
 */
export function dateToUTC(date: Date, timeStr: string): Date {
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hour - VN_UTC_OFFSET, minute)
    );
}

/**
 * Format a Date as ICS UTC datetime string (e.g. "20260301T000000Z").
 */
export function formatICSDateTime(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    const h = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    const s = String(date.getUTCSeconds()).padStart(2, '0');
    return `${y}${m}${d}T${h}${min}${s}Z`;
}
