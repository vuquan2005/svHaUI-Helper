/**
 * Captcha Helper Feature
 * Assists with captcha input: normalize input, auto-submit on blur/Enter
 */

import { Feature, type MatchPattern, type StorageListenerId } from '@/core';
import { normalizeCaptchaInput, normalizeCaptchaInputUndo } from '@/utils';

// ============================================
// Constants
// ============================================

/** Debounce delay before normalizing input (ms) */
const DEBOUNCE_DELAY_MS = 30;

/** Required captcha length */
const CAPTCHA_LENGTH = 5;

// ============================================
// Types & Interfaces
// ============================================

/**
 * Interface for captcha handler - easily extensible for other pages
 */
interface CaptchaPageHandler {
    /** Selector for input field */
    inputSelector: string;
    /** Selector for submit button */
    submitSelector: string;
    /** Optional: selector for captcha image (for future auto-solve) */
    imageSelector?: string;
}

// ============================================
// Page Handlers (keyed by match pattern name)
// ============================================

/** URL patterns for matching */
const URL_PATTERNS: MatchPattern[] = [
    { name: 'sso-login', pattern: '/sso' },
    { name: 'register', pattern: '/register' },
];

/** Handler config for each pattern (keyed by pattern name) */
const HANDLERS: Record<string, CaptchaPageHandler> = {
    'sso-login': {
        inputSelector: '[id^="ctl"][id$="_txtimgcode"]',
        submitSelector: '[id^="ctl"][id$="_butLogin"]',
        imageSelector: '[id^="ctl"][id$="_Image1"]',
    },
    register: {
        inputSelector: '[id^="ctl"][id$="_txtimgcode"]',
        submitSelector: '[id^="ctl"][id$="_btnSubmit"]',
        imageSelector: '[id^="ctl"][id$="_Image1"]',
    },
};

/** Storage schema */
type StorageSchema = {
    undoTelex: boolean;
};

// ============================================
// CaptchaHelper Feature
// ============================================

export class CaptchaHelperFeature extends Feature<StorageSchema> {
    private inputEl: HTMLInputElement | null = null;
    private submitEl: HTMLElement | null = null;
    private currentHandler: CaptchaPageHandler | null = null;

    private isUndoTelex: StorageSchema['undoTelex'] | undefined;
    private undoTelexListenerId: StorageListenerId | null = null;

    // Debounce timer for input normalization
    private normalizeTimer: ReturnType<typeof setTimeout> | null = null;

    // Event listener references for cleanup
    private handleInput = this.onInput.bind(this);
    private handleKeyDown = this.onKeyDown.bind(this);
    private handleBlur = this.onBlur.bind(this);

    constructor() {
        super({
            id: 'captcha-helper',
            name: 'Captcha Helper',
            description:
                'Hỗ trợ nhập captcha: tự động chuyển chữ thường, loại bỏ dấu, submit khi Enter/blur',
            urlMatch: URL_PATTERNS,
        });
    }

    /**
     * Initialize Captcha Helper
     * Find and attach event listeners to captcha input field
     */
    async run(): Promise<void> {
        // Load settings
        this.isUndoTelex = await this.storage.get('undoTelex', false);
        this.undoTelexListenerId = await this.storage.onValueChange(
            'undoTelex',
            (_key, _old, newVal) => {
                this.isUndoTelex = !!newVal;
                this.log.d('Settings updated:', { isUndoTelex: this.isUndoTelex });
            }
        );

        // Lấy handler dựa vào pattern đã match
        const matchName = this.matchResult?.matchName;
        if (!matchName) {
            this.log.w('No match result available');
            return;
        }

        this.currentHandler = HANDLERS[matchName];
        if (!this.currentHandler) {
            this.log.w('No handler found for:', matchName);
            return;
        }

        this.log.d(`Matched pattern: "${matchName}" at ${this.location.path}`);

        // Find elements
        this.inputEl = document.querySelector<HTMLInputElement>(this.currentHandler.inputSelector);
        this.submitEl = document.querySelector<HTMLElement>(this.currentHandler.submitSelector);

        if (!this.inputEl) {
            this.log.w('Captcha input not found:', this.currentHandler.inputSelector);
            return;
        } else this.log.d('Captcha input found:', this.inputEl.getAttribute('id'));

        if (!this.submitEl) {
            this.log.w('Submit button not found:', this.currentHandler.submitSelector);
            return;
        } else this.log.d('Submit button found:', this.submitEl.getAttribute('id'));

        // Attach event listeners to input field
        this.inputEl.addEventListener('input', this.handleInput);
        this.inputEl.addEventListener('keydown', this.handleKeyDown);
        this.inputEl.addEventListener('blur', this.handleBlur);

        // Focus input so user can type immediately
        this.inputEl.focus();
    }

    /**
     * Handle input event: debounce normalize
     */
    private onInput(): void {
        // Clear existing timer
        if (this.normalizeTimer) {
            clearTimeout(this.normalizeTimer);
        }

        // Set new timer - normalize after DEBOUNCE_DELAY_MS
        this.normalizeTimer = setTimeout(() => {
            this.normalizeInput();
        }, DEBOUNCE_DELAY_MS);
    }

    /**
     * Normalize input value
     */
    private normalizeInput(): void {
        if (!this.inputEl) return;

        // Clear timer if exists
        if (this.normalizeTimer) {
            clearTimeout(this.normalizeTimer);
            this.normalizeTimer = null;
        }

        const original = this.inputEl.value;
        const normalized = this.isUndoTelex
            ? normalizeCaptchaInputUndo(original)
            : normalizeCaptchaInput(original);

        if (original !== normalized) {
            this.inputEl.value = normalized;
            // Set cursor to end
            this.inputEl.setSelectionRange(normalized.length, normalized.length);
            this.log.d(`Normalized: "${original}" → "${normalized}"`);
        }
    }

    /**
     * Handle keydown event: submit on Enter
     */
    private onKeyDown(e: KeyboardEvent): void {
        if (e.key === 'Enter') {
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

        // Only submit if input has value
        if (this.inputEl?.value.trim()) {
            this.submit();
        }
    }

    /**
     * Submit form
     */
    private submit(): void {
        const value = this.inputEl?.value.trim() || '';

        if (value.length < CAPTCHA_LENGTH) {
            this.log.d(`Need ${CAPTCHA_LENGTH} chars, got ${value.length}`);
            return;
        }

        if (this.submitEl) {
            this.log.i('Submitting...');
            this.submitEl.click();
        }
    }

    /**
     * Cleanup resources when feature is disabled
     * Remove event listeners and clear timers
     */
    cleanup(): void {
        // Remove storage listener
        if (this.undoTelexListenerId !== null) {
            this.storage.removeValueChangeListener(this.undoTelexListenerId);
            this.undoTelexListenerId = null;
        }

        // Clear timer
        if (this.normalizeTimer) {
            clearTimeout(this.normalizeTimer);
            this.normalizeTimer = null;
        }

        // Cleanup event listeners
        if (this.inputEl) {
            this.inputEl.removeEventListener('input', this.handleInput);
            this.inputEl.removeEventListener('keydown', this.handleKeyDown);
            this.inputEl.removeEventListener('blur', this.handleBlur);
        }

        this.inputEl = null;
        this.submitEl = null;
        this.currentHandler = null;
    }
}
