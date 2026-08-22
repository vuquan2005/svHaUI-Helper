import { describe, it, expect } from 'vitest';
import { isElementVisible } from './dom';

describe('isElementVisible', () => {
    it('should return false for null or undefined element', () => {
        expect(isElementVisible(null)).toBe(false);
        expect(isElementVisible(undefined)).toBe(false);
    });

    it('should return false when isConnected is false', () => {
        const mockEl = {
            isConnected: false,
        } as unknown as HTMLElement;

        expect(isElementVisible(mockEl)).toBe(false);
    });

    it('should use checkVisibility when available', () => {
        const visibleEl = {
            isConnected: true,
            checkVisibility: () => true,
        } as unknown as HTMLElement;

        const hiddenEl = {
            isConnected: true,
            checkVisibility: () => false,
        } as unknown as HTMLElement;

        expect(isElementVisible(visibleEl)).toBe(true);
        expect(isElementVisible(hiddenEl)).toBe(false);
    });

    it('should fallback to dimensions when checkVisibility is not a function', () => {
        const visibleEl = {
            isConnected: true,
            offsetWidth: 100,
            offsetHeight: 30,
            getClientRects: () => [{}] as unknown as DOMRectList,
        } as unknown as HTMLElement;

        const hiddenEl = {
            isConnected: true,
            offsetWidth: 0,
            offsetHeight: 0,
            getClientRects: () => [] as unknown as DOMRectList,
        } as unknown as HTMLElement;

        expect(isElementVisible(visibleEl)).toBe(true);
        expect(isElementVisible(hiddenEl)).toBe(false);
    });
});
