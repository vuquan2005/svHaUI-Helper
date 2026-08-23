import { describe, it, expect } from 'vitest';
import { inpaintTelea, rgbToSaturation, otsuThreshold } from '../image-utils';

describe('image-utils', () => {
    it('rgbToSaturation calculates saturation correctly', () => {
        const rgba = new Uint8ClampedArray([255, 0, 0, 255, 128, 128, 128, 255]);
        const sat = rgbToSaturation(rgba, 2, 1);
        expect(sat[0]).toBe(255);
        expect(sat[1]).toBe(0);
    });

    it('otsuThreshold binarizes image', () => {
        const src = new Uint8Array([10, 20, 10, 200, 220, 210]);
        const dst = otsuThreshold(src, 3, 2);
        expect(dst[0]).toBe(0);
        expect(dst[1]).toBe(0);
        expect(dst[2]).toBe(0);
        expect(dst[3]).toBe(255);
        expect(dst[4]).toBe(255);
        expect(dst[5]).toBe(255);
    });

    it('inpaint removes noise accurately', () => {
        const src = new Uint8Array([
            100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 255, 100, 100, 100, 100,
            100, 100, 100, 100, 100, 100, 100, 100,
        ]);
        const mask = new Uint8Array(25);
        mask[12] = 255;

        const result = inpaintTelea(src, mask, 5, 5);
        expect(result[12]).toBe(100);
    });
});
