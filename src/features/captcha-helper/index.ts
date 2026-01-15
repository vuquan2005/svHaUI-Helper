/**
 * Captcha Helper Feature
 * Hỗ trợ nhập captcha: normalize input, auto-submit on blur/Enter
 */

import { Feature } from '../../core';
import { normalizeCaptchaInput } from '../../utils';

// ============================================
// Types & Interfaces (extensibility)
// ============================================

/**
 * Interface cho captcha handler - dễ mở rộng cho trang khác
 */
interface CaptchaPageHandler {
    /** URL pattern để match */
    urlPattern: RegExp;
    /** Selector cho input field */
    inputSelector: string;
    /** Selector cho submit button */
    submitSelector: string;
    /** Optional: selector cho captcha image (for future auto-solve) */
    imageSelector?: string;
}

// ============================================
// Page Handlers
// ============================================

const CAPTCHA_HANDLERS: CaptchaPageHandler[] = [
    // SSO Login page
    {
        urlPattern: /\/sso\?token=/,
        inputSelector: '#ctl00_txtimgcode',
        submitSelector: '#ctl00_butLogin',
        imageSelector: '#ctl00_Image1',
    },
    // Register page (đăng ký học phần)
    {
        urlPattern: /\/register\//,
        inputSelector: '#ctl02_txtimgcode',
        submitSelector: '#ctl02_btnSubmit',
        imageSelector: '#ctl02_Image1',
    },
];

// ============================================
// CaptchaHelper Feature
// ============================================

export class CaptchaHelperFeature extends Feature {
    private inputEl: HTMLInputElement | null = null;
    private submitEl: HTMLElement | null = null;
    private currentHandler: CaptchaPageHandler | null = null;

    // Debounce timer
    private normalizeTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly DEBOUNCE_DELAY = 150; // ms

    // Event listener references for cleanup
    private handleInput = this.onInput.bind(this);
    private handleKeyDown = this.onKeyDown.bind(this);
    private handleBlur = this.onBlur.bind(this);

    constructor() {
        super({
            id: 'captcha-helper',
            name: 'Captcha Helper',
            description: 'Hỗ trợ nhập captcha: tự động chuyển chữ thường, loại bỏ dấu, submit khi Enter/blur',
        });
    }

    /**
     * Override shouldRun để chỉ chạy trên các trang có captcha
     */
    override shouldRun(): boolean {
        if (!super.shouldRun()) return false;

        const url = window.location.pathname + window.location.search;
        return CAPTCHA_HANDLERS.some(h => h.urlPattern.test(url));
    }

    init(): void {
        this.log.i('Initializing...');

        // Tìm handler phù hợp với URL hiện tại
        const url = window.location.pathname + window.location.search;
        this.currentHandler = CAPTCHA_HANDLERS.find(h => h.urlPattern.test(url)) || null;

        if (!this.currentHandler) {
            this.log.w('No matching captcha handler found');
            return;
        }

        // Tìm elements
        this.inputEl = document.querySelector<HTMLInputElement>(this.currentHandler.inputSelector);
        this.submitEl = document.querySelector<HTMLElement>(this.currentHandler.submitSelector);

        if (!this.inputEl) {
            this.log.w('Captcha input not found:', this.currentHandler.inputSelector);
            return;
        }

        if (!this.submitEl) {
            this.log.w('Submit button not found:', this.currentHandler.submitSelector);
        }

        // Attach event listeners
        this.inputEl.addEventListener('input', this.handleInput);
        this.inputEl.addEventListener('keydown', this.handleKeyDown);
        this.inputEl.addEventListener('blur', this.handleBlur);

        // Focus input để người dùng có thể gõ ngay
        this.inputEl.focus();

        this.log.i('Ready! Input:', this.currentHandler.inputSelector);
    }

    /**
     * Xử lý input: debounce normalize
     */
    private onInput(): void {
        // Clear timer cũ
        if (this.normalizeTimer) {
            clearTimeout(this.normalizeTimer);
        }

        // Set timer mới - normalize sau DEBOUNCE_DELAY ms
        this.normalizeTimer = setTimeout(() => {
            this.normalizeInput();
        }, this.DEBOUNCE_DELAY);
    }

    /**
     * Normalize input value
     */
    private normalizeInput(): void {
        if (!this.inputEl) return;

        // Clear timer nếu có
        if (this.normalizeTimer) {
            clearTimeout(this.normalizeTimer);
            this.normalizeTimer = null;
        }

        const original = this.inputEl.value;
        const normalized = normalizeCaptchaInput(original);

        if (original !== normalized) {
            this.inputEl.value = normalized;
            // Đặt cursor ở cuối
            this.inputEl.setSelectionRange(normalized.length, normalized.length);
            this.log.d(`Normalized: "${original}" → "${normalized}"`);
        }
    }

    /**
     * Xử lý keydown: submit khi Enter
     */
    private onKeyDown(e: KeyboardEvent): void {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.normalizeInput();
            this.submit();
        }
    }

    /**
     * Xử lý blur: normalize và submit khi out focus
     */
    private onBlur(): void {
        this.normalizeInput();

        // Chỉ submit nếu có giá trị
        if (this.inputEl?.value.trim()) {
            this.submit();
        }
    }

    /**
     * Submit form
     */
    private submit(): void {
        const value = this.inputEl?.value.trim() || '';
        const CAPTCHA_LENGTH = 5;

        if (value.length < CAPTCHA_LENGTH) {
            this.log.d(`Need ${CAPTCHA_LENGTH} chars, got ${value.length}`);
            return;
        }

        if (this.submitEl) {
            this.log.i('Submitting...');
            this.submitEl.click();
        }
    }

    destroy(): void {
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

