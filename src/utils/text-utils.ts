/**
 * Text Utilities
 * Các tiện ích xử lý chuỗi văn bản
 */

/**
 * Map combining marks (sau khi NFD) về phím Telex
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
 * Xác định ký tự Telex tương ứng từ chuỗi input
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
 * Loại bỏ dấu tiếng Việt và các diacritics khác
 * Sử dụng Unicode Normalization Form D (NFD) để tách ký tự và dấu,
 * sau đó loại bỏ các combining marks (dấu)
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
 * Chỉ giữ lại ký tự alphanumeric (a-z, A-Z, 0-9)
 */
export function keepAlphanumeric(text: string): string {
    return text.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Normalize text cho captcha input:
 * - Chuyển thành chữ thường
 * - Loại bỏ dấu tiếng Việt
 * - Chỉ giữ lại a-z và 0-9
 */
export function normalizeCaptchaInput(text: string): string {
    return keepAlphanumeric(removeDiacritics(text.toLowerCase()));
}

/**
 * Normalize text cho captcha input + undo Telex:
 * - Chuyển thành chữ thường
 * - Hoàn tác các dấu khi gõ tiếng Việt bằng Telex (ví dụ: "às" → "asf")
 * - Chỉ giữ lại a-z và 0-9
 */
export function normalizeCaptchaInputUndo(text: string): string {
    return keepAlphanumeric(removeDiacritics(text).toLowerCase() + getTelexChar(text));
}
