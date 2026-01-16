/**
 * Text Utilities
 * Text string processing utilities
 */

/**
 * Map combining marks (after NFD) to Telex keys
 */
const COMBINING_TO_TELEX: Record<string, string> = {
    '\u0301': 's', // ́ sắc
    '\u0300': 'f', // ̀ huyền
    '\u0309': 'r', // ̉ hỏi
    '\u0303': 'x', // ̃ ngã
    '\u0323': 'j', // ̣ nặng
    '\u0306': 'w', // ̆ trăng (ă) - thêm 'w'
    '\u031B': 'w', // ̛ móc (ơ, ư) - thêm 'w'
};
/**
 * Determine corresponding Telex character from input string
 */
export function getTelexChar(text: string): string {
    if (text.includes('đ') || text.includes('Đ')) return 'd';

    const chars = text.normalize('NFD').split('');

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        if (COMBINING_TO_TELEX[char]) {
            return COMBINING_TO_TELEX[char];
        }
        if (char === '\u0302') {
            return chars[i - 1]?.toLowerCase() || '';
        }
    }

    return '';
}

/**
 * Remove Vietnamese diacritics and other diacritical marks
 * Uses Unicode Normalization Form D (NFD) to separate characters and marks,
 * then removes the combining marks (diacritics)
 *
 * @example
 * removeDiacritics("Đây là tiếng Việt") // "Đay la tieng Viet"
 * removeDiacritics("café") // "cafe"
 */
export function removeDiacritics(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

/**
 * Keep only alphanumeric characters (a-z, A-Z, 0-9)
 */
export function keepAlphanumeric(text: string): string {
    return text.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Normalize text for captcha input:
 * - Convert to lowercase
 * - Remove Vietnamese diacritics
 * - Keep only a-z and 0-9
 */
export function normalizeCaptchaInput(text: string): string {
    return keepAlphanumeric(removeDiacritics(text.toLowerCase()));
}

/**
 * Normalize text for captcha input + undo Telex:
 * - Convert to lowercase
 * - Undo Vietnamese Telex input (e.g., "às" → "asf")
 * - Keep only a-z and 0-9
 */
export function normalizeCaptchaInputUndo(text: string): string {
    return keepAlphanumeric(removeDiacritics(text).toLowerCase() + getTelexChar(text));
}
