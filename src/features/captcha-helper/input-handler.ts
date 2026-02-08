/**
 * Captcha Input Handler
 * Manages input events, normalization, and form submission
 */

import { normalizeCaptchaInput, normalizeCaptchaInputUndo } from '@/utils';
import { DEBOUNCE_DELAY_MS, CAPTCHA_LENGTH } from './config';

export interface InputHandlerOptions {
    /** The input element to handle */
    inputEl: HTMLInputElement;
    /** The submit button element */
    submitEl: HTMLElement;
    /** Callback to get current undoTelex setting */
    getUndoTelex: () => boolean;
    /** Logger function for debug messages */
    log: {
        d: (...args: unknown[]) => void;
        i: (...args: unknown[]) => void;
    };
}

/**
 * Handles captcha input events, normalization, and auto-submit
 */
export class CaptchaInputHandler {
    private inputEl: HTMLInputElement;
    private submitEl: HTMLElement;
    private getUndoTelex: () => boolean;
    private log: InputHandlerOptions['log'];

    private normalizeTimer: ReturnType<typeof setTimeout> | null = null;

    // Bound event handlers for proper removal
    private handleInput = this.onInput.bind(this);
    private handleKeyDown = this.onKeyDown.bind(this);
    private handleBlur = this.onBlur.bind(this);

    constructor(options: InputHandlerOptions) {
        this.inputEl = options.inputEl;
        this.submitEl = options.submitEl;
        this.getUndoTelex = options.getUndoTelex;
        this.log = options.log;
    }

    /**
     * Attach event listeners to input
     */
    attach(): void {
        this.inputEl.addEventListener('input', this.handleInput);
        this.inputEl.addEventListener('keydown', this.handleKeyDown);
        this.inputEl.addEventListener('blur', this.handleBlur);
        this.inputEl.focus();
    }

    /**
     * Detach event listeners and cleanup
     */
    detach(): void {
        if (this.normalizeTimer) {
            clearTimeout(this.normalizeTimer);
            this.normalizeTimer = null;
        }

        this.inputEl.removeEventListener('input', this.handleInput);
        this.inputEl.removeEventListener('keydown', this.handleKeyDown);
        this.inputEl.removeEventListener('blur', this.handleBlur);
    }

    /**
     * Handle input event: debounce normalize
     */
    private onInput(): void {
        if (this.normalizeTimer) {
            clearTimeout(this.normalizeTimer);
        }

        this.normalizeTimer = setTimeout(() => {
            this.normalizeInput();
        }, DEBOUNCE_DELAY_MS);
    }

    /**
     * Normalize input value
     */
    private normalizeInput(): void {
        if (this.normalizeTimer) {
            clearTimeout(this.normalizeTimer);
            this.normalizeTimer = null;
        }

        const original = this.inputEl.value;
        const normalized = this.getUndoTelex()
            ? normalizeCaptchaInputUndo(original)
            : normalizeCaptchaInput(original);

        if (original !== normalized) {
            this.inputEl.value = normalized;
            this.inputEl.setSelectionRange(normalized.length, normalized.length);
            this.log.d(`Normalized: "${original}" → "${normalized}"`);
        }
    }

    /**
     * Handle keydown event: submit on Enter/Space/Tab
     */
    private onKeyDown(e: KeyboardEvent): void {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') {
            e.preventDefault();
            this.normalizeInput();
            this.submit();
        }
    }

    /**
     * Handle blur event: normalize and submit when losing focus
     */
    private onBlur(): void {
        this.normalizeInput();

        if (this.inputEl.value.trim()) {
            this.submit();
        }
    }

    /**
     * Submit form if input meets requirements
     */
    private submit(): void {
        const value = this.inputEl.value.trim();

        if (value.length < CAPTCHA_LENGTH) {
            this.log.d(`Need ${CAPTCHA_LENGTH} chars, got ${value.length}`);
            return;
        }

        this.log.i('Submitting...');
        this.submitEl.click();
    }
}
