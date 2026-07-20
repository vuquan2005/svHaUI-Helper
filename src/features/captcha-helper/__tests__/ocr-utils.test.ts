import { describe, it, expect } from 'vitest';
import { ctcDecode } from '../ocr-utils';

describe('ctcDecode', () => {
    const mockDict = ['0', '1', 'a', 'b']; // 4 classes (idx 1..4 maps to dict 0..3), 0 is blank

    it('should decode non-blank tokens correctly', () => {
        // Logits shape: 3 frames x 5 classes (0: blank, 1: '0', 2: '1', 3: 'a', 4: 'b')
        const logits = new Float32Array([
            // Frame 0: argmax = 1 ('0')
            0, 10, 0, 0, 0,
            // Frame 1: argmax = 3 ('a')
            0, 0, 0, 10, 0,
            // Frame 2: argmax = 4 ('b')
            0, 0, 0, 0, 10,
        ]);

        const result = ctcDecode(logits, 3, 5, mockDict);
        expect(result).toBe('0ab');
    });

    it('should collapse consecutive identical predictions', () => {
        // Frame 0: 'a', Frame 1: 'a', Frame 2: 'b'
        const logits = new Float32Array([0, 0, 0, 10, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 10]);

        const result = ctcDecode(logits, 3, 5, mockDict);
        expect(result).toBe('ab');
    });

    it('should skip CTC blank token (index 0)', () => {
        // Frame 0: 'a', Frame 1: blank (0), Frame 2: 'a'
        const logits = new Float32Array([0, 0, 0, 10, 0, 10, 0, 0, 0, 0, 0, 0, 0, 10, 0]);

        const result = ctcDecode(logits, 3, 5, mockDict);
        expect(result).toBe('aa');
    });

    it('should return empty string for all blank predictions', () => {
        const logits = new Float32Array([10, 0, 0, 0, 0, 10, 0, 0, 0, 0]);

        const result = ctcDecode(logits, 2, 5, mockDict);
        expect(result).toBe('');
    });
});
