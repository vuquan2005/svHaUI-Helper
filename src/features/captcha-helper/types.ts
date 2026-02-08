/**
 * Types & Interfaces for Captcha Helper Feature
 */

/**
 * Interface for captcha handler - easily extensible for other pages
 */
export interface CaptchaPageHandler {
    /** Selector for input field */
    inputSelector: string;
    /** Selector for submit button */
    submitSelector: string;
    /** Optional: selector for captcha image (for future auto-solve) */
    imageSelector?: string;
}

/**
 * Storage schema for Captcha Helper settings
 */
export type CaptchaStorageSchema = {
    undoTelex: boolean;
};
