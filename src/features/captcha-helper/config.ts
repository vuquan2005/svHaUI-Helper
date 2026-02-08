/**
 * Configuration for Captcha Helper Feature
 * URL patterns, page handlers, and constants
 */

import type { MatchPattern } from '@/core';
import type { CaptchaPageHandler } from './types';

// ============================================
// Constants
// ============================================

/** Debounce delay before normalizing input (ms) */
export const DEBOUNCE_DELAY_MS = 30;

/** Required captcha length */
export const CAPTCHA_LENGTH = 5;

// ============================================
// URL Patterns & Handlers
// ============================================

/** URL patterns for matching */
export const URL_PATTERNS: MatchPattern[] = [
    { name: 'sso-login', pattern: '/sso' },
    { name: 'register', pattern: '/register' },
];

/** Handler config for each pattern (keyed by pattern name) */
export const PAGE_HANDLERS: Record<string, CaptchaPageHandler> = {
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
