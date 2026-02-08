/**
 * Captcha Helper Feature
 * Assists with captcha input: normalize input, auto-submit on blur/Enter
 */

import { Feature, type StorageListenerId } from '@/core';
import { URL_PATTERNS, PAGE_HANDLERS } from './config';
import type { CaptchaPageHandler, CaptchaStorageSchema } from './types';
import { CaptchaInputHandler } from './input-handler';
import { CaptchaProcessor } from './captcha-processor';

// ============================================
// CaptchaHelper Feature
// ============================================

export class CaptchaHelperFeature extends Feature<CaptchaStorageSchema> {
    private inputEl: HTMLInputElement | null = null;
    private submitEl: HTMLElement | null = null;
    private imgEl: HTMLImageElement | null = null;

    private currentHandler: CaptchaPageHandler | null = null;
    private inputHandler: CaptchaInputHandler | null = null;
    private captchaProcessor: CaptchaProcessor | null = null;

    private isUndoTelex = false;
    private undoTelexListenerId: StorageListenerId | null = null;

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
        await this.loadSettings();

        if (!this.setupHandler()) return;
        if (!this.findElements()) return;

        this.setupInputHandler();
        this.setupCaptchaProcessor();
    }

    /**
     * Load and watch settings from storage
     */
    private async loadSettings(): Promise<void> {
        this.isUndoTelex = (await this.storage.get('undoTelex')) ?? false;

        if (this.isUndoTelex === undefined) {
            this.isUndoTelex = false;
            await this.storage.set('undoTelex', false);
            this.log.d('Settings initialized:', { isUndoTelex: this.isUndoTelex });
        } else {
            this.log.d('Settings loaded:', { isUndoTelex: this.isUndoTelex });
        }

        this.undoTelexListenerId = await this.storage.onValueChange(
            'undoTelex',
            (_key, _old, newVal) => {
                this.isUndoTelex = !!newVal;
                this.log.d('Settings updated:', { isUndoTelex: this.isUndoTelex });
            }
        );
    }

    /**
     * Setup handler based on matched URL pattern
     */
    private setupHandler(): boolean {
        const matchName = this.matchResult?.matchName;
        if (!matchName) {
            this.log.w('No match result available');
            return false;
        }

        this.currentHandler = PAGE_HANDLERS[matchName];
        if (!this.currentHandler) {
            this.log.w('No handler found for:', matchName);
            return false;
        }

        this.log.d(`Matched pattern: "${matchName}" at ${this.location.path}`);
        return true;
    }

    /**
     * Find required DOM elements
     */
    private findElements(): boolean {
        if (!this.currentHandler) return false;

        // Find input element
        this.inputEl = document.querySelector<HTMLInputElement>(this.currentHandler.inputSelector);
        if (!this.inputEl) {
            this.log.w('Captcha input not found:', this.currentHandler.inputSelector);
            return false;
        }
        this.log.d('Captcha input found:', this.inputEl.getAttribute('id'));

        // Find submit button
        this.submitEl = document.querySelector<HTMLElement>(this.currentHandler.submitSelector);
        if (!this.submitEl) {
            this.log.w('Submit button not found:', this.currentHandler.submitSelector);
            return false;
        }
        this.log.d('Submit button found:', this.submitEl.getAttribute('id'));

        // Find captcha image (optional)
        if (this.currentHandler.imageSelector) {
            this.imgEl = document.querySelector<HTMLImageElement>(
                this.currentHandler.imageSelector
            );
            if (this.imgEl) {
                this.log.d('Captcha image found:', this.imgEl.getAttribute('id'));
            }
        }

        return true;
    }

    /**
     * Setup input handler for captcha input
     */
    private setupInputHandler(): void {
        if (!this.inputEl || !this.submitEl) return;

        this.inputHandler = new CaptchaInputHandler({
            inputEl: this.inputEl,
            submitEl: this.submitEl,
            getUndoTelex: () => this.isUndoTelex,
            log: {
                d: (...args) => this.log.d(...args),
                i: (...args) => this.log.i(...args),
            },
        });

        this.inputHandler.attach();
    }

    /**
     * Setup captcha image processor
     */
    private setupCaptchaProcessor(): void {
        if (!this.imgEl) return;

        this.captchaProcessor = new CaptchaProcessor({
            imgEl: this.imgEl,
            log: {
                d: (...args) => this.log.d(...args),
                e: (...args) => this.log.e(...args),
            },
        });

        this.captchaProcessor.setup();
    }

    /**
     * Cleanup resources when feature is disabled
     */
    cleanup(): void {
        // Remove storage listener
        if (this.undoTelexListenerId !== null) {
            this.storage.removeValueChangeListener(this.undoTelexListenerId);
            this.undoTelexListenerId = null;
        }

        // Cleanup input handler
        if (this.inputHandler) {
            this.inputHandler.detach();
            this.inputHandler = null;
        }

        // Cleanup captcha processor
        if (this.captchaProcessor) {
            this.captchaProcessor.cleanup();
            this.captchaProcessor = null;
        }

        // Clear references
        this.inputEl = null;
        this.submitEl = null;
        this.imgEl = null;
        this.currentHandler = null;
    }
}
