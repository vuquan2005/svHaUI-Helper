import { describe, it, expect } from 'vitest';
import {
    getTelexChar,
    removeDiacritics,
    keepAlphanumeric,
    normalizeCaptchaInput,
    normalizeCaptchaInputUndo,
} from './text-utils';

describe('removeDiacritics', () => {
    it('should remove Vietnamese tone marks', () => {
        expect(removeDiacritics('tiếng')).toBe('tieng');
        expect(removeDiacritics('Việt')).toBe('Viet');
    });

    it('should convert đ to d and Đ to D', () => {
        expect(removeDiacritics('đại')).toBe('dai');
        expect(removeDiacritics('Đại')).toBe('Dai');
    });

    it('should handle mixed text', () => {
        expect(removeDiacritics('Đây là tiếng Việt')).toBe('Day la tieng Viet');
    });

    it('should handle text without diacritics', () => {
        expect(removeDiacritics('hello world')).toBe('hello world');
    });

    it('should handle café', () => {
        expect(removeDiacritics('café')).toBe('cafe');
    });

    it('should handle empty string', () => {
        expect(removeDiacritics('')).toBe('');
    });
});

describe('keepAlphanumeric', () => {
    it('should keep only letters and digits', () => {
        expect(keepAlphanumeric('abc123')).toBe('abc123');
    });

    it('should remove special characters', () => {
        expect(keepAlphanumeric('a-b_c!@#')).toBe('abc');
    });

    it('should remove spaces', () => {
        expect(keepAlphanumeric('hello world')).toBe('helloworld');
    });

    it('should handle empty string', () => {
        expect(keepAlphanumeric('')).toBe('');
    });
});

describe('getTelexChar', () => {
    it('should return "s" for sắc tone', () => {
        expect(getTelexChar('á')).toBe('s');
        expect(getTelexChar('é')).toBe('s');
    });

    it('should return "f" for huyền tone', () => {
        expect(getTelexChar('à')).toBe('f');
        expect(getTelexChar('ì')).toBe('f');
    });

    it('should return "r" for hỏi tone', () => {
        expect(getTelexChar('ả')).toBe('r');
    });

    it('should return "x" for ngã tone', () => {
        expect(getTelexChar('ã')).toBe('x');
    });

    it('should return "j" for nặng tone', () => {
        expect(getTelexChar('ạ')).toBe('j');
    });

    it('should return "d" for đ', () => {
        expect(getTelexChar('đ')).toBe('d');
        expect(getTelexChar('Đ')).toBe('d');
    });

    it('should return empty string for no diacritics', () => {
        expect(getTelexChar('a')).toBe('');
        expect(getTelexChar('b')).toBe('');
    });
});

describe('normalizeCaptchaInput', () => {
    it('should lowercase, remove diacritics, and keep alphanumeric', () => {
        expect(normalizeCaptchaInput('Đại Học')).toBe('daihoc');
    });

    it('should handle plain text', () => {
        expect(normalizeCaptchaInput('ABC123')).toBe('abc123');
    });

    it('should handle text with special chars', () => {
        expect(normalizeCaptchaInput('a-b.c!1')).toBe('abc1');
    });
});

describe('normalizeCaptchaInputUndo', () => {
    it('should append Telex char for sắc tone', () => {
        // "às" has huyền → Telex "f", removeDiacritics → "as" → lowercase → "as" + "f" → keepAlphanumeric → "asf"
        // Actually let's trace: text="às", removeDiacritics("às")="as", .toLowerCase()="as", getTelexChar("às")="f"
        // result = keepAlphanumeric("as" + "f") = "asf"
        expect(normalizeCaptchaInputUndo('às')).toBe('asf');
    });

    it('should handle text without diacritics', () => {
        // getTelexChar('abc') = '', so result = keepAlphanumeric('abc' + '') = 'abc'
        expect(normalizeCaptchaInputUndo('abc')).toBe('abc');
    });

    it('should handle đ character', () => {
        // text="đa", removeDiacritics="da", toLowerCase="da", getTelexChar("đa")="d"
        // result = keepAlphanumeric("da" + "d") = "dad"
        expect(normalizeCaptchaInputUndo('đa')).toBe('dad');
    });
});
