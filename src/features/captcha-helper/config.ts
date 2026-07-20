/**
 * Configuration for Captcha Helper Feature
 * URL patterns, page handlers, model URLs, and OCR constants
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

/** Default PP-OCRv4 ONNX model URL (hosted on GitHub Releases) */
export const DEFAULT_MODEL_URL =
    'https://github.com/vuquan2005/svHaUI-Helper/releases/download/model-v0.0.2/model_quant.onnx';

/** CDN base URL for ONNX Runtime Web WebAssembly binaries */
export const ORT_WASM_CDN_BASE = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${__ORT_VERSION__}/dist/`;

/**
 * Character dictionary used during PaddleOCR training (34 characters)
 * Index 0 is CTC Blank symbol, indices 1..34 map to CHARACTER_DICT[0..33]
 */
export const CHARACTER_DICT: readonly string[] = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
];

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
        refreshSelector: '.form-group > a[onclick*="recaptcha"]',
    },
    register: {
        inputSelector: '[id^="ctl"][id$="_txtimgcode"]',
        submitSelector: '[id^="ctl"][id$="_btnSubmit"]',
        imageSelector: '[id^="ctl"][id$="_Image1"]',
        refreshSelector: '.form-group > a[onclick*="recaptcha"]',
    },
};
