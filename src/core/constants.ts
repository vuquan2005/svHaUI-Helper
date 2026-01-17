/**
 * Application Constants - Single source of truth for default settings
 */

// ============================================
// Default Settings
// ============================================

/**
 * Default values for all settings
 */
export const DEFAULT_SETTINGS = {
    /** Default log level */
    logLevel: 'warn' as const,

    /** Auto undo Telex for captcha input */
    captchaUndoTelex: true,

    /** Default feature enabled state */
    featureEnabled: true,
} as const;
