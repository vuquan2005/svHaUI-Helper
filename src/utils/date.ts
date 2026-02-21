/**
 * Date Utilities - Utility functions for working with dates
 */

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
