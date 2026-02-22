/**
 * Date Utilities - Utility functions for working with dates and timezones.
 */

// ============================================
// Timezone Constants
// ============================================

/** Vietnam timezone offset in hours (UTC+7) */
export const VN_UTC_OFFSET = 7;

// ============================================
// Date Components
// ============================================

/**
 * A date-time tuple: [year, month, day, hour, minute].
 * Month is 1-indexed (1 = January).
 * Compatible with the `ics` library's DateArray.
 */
export type DateComponents = [number, number, number, number, number];

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
 * Combine a dd/MM/yyyy date string with an HH:mm time string
 * into DateComponents (VN local time).
 *
 * @param dateStr - Date in dd/MM/yyyy format
 * @param timeStr - Time in HH:mm format
 * @returns DateComponents or null if invalid
 */
export function parseDateTimeVN(dateStr: string, timeStr: string): DateComponents | null {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    const timeParts = timeStr.split(':');
    if (timeParts.length !== 2) return null;

    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);

    if ([day, month, year, hour, minute].some(isNaN)) return null;

    return [year, month, day, hour, minute];
}

// ============================================
// Timezone Conversion
// ============================================

/**
 * Convert DateComponents from Vietnam local time (UTC+7) to UTC.
 * Handles day/month/year rollovers automatically.
 *
 * @param components - [year, month, day, hour, minute] in VN time
 * @returns DateComponents in UTC
 *
 * @example
 * vnToUTC([2026, 2, 23, 7, 0])  // → [2026, 2, 23, 0, 0]
 * vnToUTC([2026, 1, 1, 2, 30])  // → [2025, 12, 31, 19, 30] (day rollback)
 */
export function vnToUTC(components: DateComponents): DateComponents {
    return shiftHours(components, -VN_UTC_OFFSET);
}

/**
 * Convert DateComponents from UTC to Vietnam local time (UTC+7).
 * Handles day/month/year rollovers automatically.
 *
 * @param components - [year, month, day, hour, minute] in UTC
 * @returns DateComponents in VN time
 *
 * @example
 * utcToVN([2026, 2, 22, 23, 0]) // → [2026, 2, 23, 6, 0] (day rollforward)
 */
export function utcToVN(components: DateComponents): DateComponents {
    return shiftHours(components, VN_UTC_OFFSET);
}

/**
 * Shift DateComponents by a number of hours.
 * Uses Date object internally to handle all rollovers correctly.
 *
 * @param components - [year, month, day, hour, minute]
 * @param hours - Hours to shift (positive = forward, negative = backward)
 * @returns Shifted DateComponents
 */
export function shiftHours(components: DateComponents, hours: number): DateComponents {
    const [year, month, day, hour, minute] = components;
    // Use Date in UTC mode to avoid local timezone interference
    const d = new Date(Date.UTC(year, month - 1, day, hour + hours, minute));
    return [
        d.getUTCFullYear(),
        d.getUTCMonth() + 1,
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
    ];
}
