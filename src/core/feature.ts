/**
 * Feature Base Class - Base class for all features
 * Each feature inherits from this class to ensure consistent structure
 */

import { settings } from './settings';
import { createLogger, Logger } from './logger';

// ============================================
// URL Matching Interfaces
// ============================================

/**
 * A single URL match pattern with optional name
 */
export interface MatchPattern {
    /** Optional name identifier for this pattern (e.g., "sso-login", "register") */
    name?: string;
    /** Regex or string to match against normalized URL */
    pattern: RegExp | string;
}

/**
 * Result of URL matching after shouldRun() is called
 */
export interface MatchResult {
    /** Whether a pattern matched */
    matched: boolean;
    /** Index of the matched pattern in the array (if urlMatch is array) */
    matchIndex?: number;
    /** Name of the matched pattern (if provided) */
    matchName?: string;
    /** The pattern that matched */
    pattern?: RegExp | string;
}

// ============================================
// Feature Types
// ============================================

/** URL match can be a single pattern or array of patterns */
export type UrlMatchConfig = RegExp | string | MatchPattern | MatchPattern[];

export interface FeatureConfig {
    id: string;
    name: string;
    description: string;
    /** Regex, string, MatchPattern, or array of MatchPattern to match URL */
    urlMatch?: UrlMatchConfig;
}

// ============================================
// URL Normalization Utilities
// ============================================

/**
 * Normalize pathname: remove trailing slashes except for root "/"
 */
function normalizePath(path: string): string {
    if (path === '/') return '/';
    return path.replace(/\/+$/, '');
}

// Pre-compute normalized URL values (computed once when module loads)
const CURRENT_PATH = normalizePath(window.location.pathname);
const CURRENT_URL = CURRENT_PATH + window.location.search;
const CURRENT_HREF = window.location.origin + CURRENT_URL;

// ============================================
// Feature Base Class
// ============================================

export abstract class Feature {
    // ============================================
    // Static: Pre-computed URL values for all features
    // ============================================

    /** Normalized pathname (no trailing slash, except root "/") */
    protected static readonly currentPath: string = CURRENT_PATH;

    /** Normalized URL (pathname + search, no trailing slash on path) */
    protected static readonly currentUrl: string = CURRENT_URL;

    /** Full normalized href (origin + pathname + search) */
    protected static readonly currentHref: string = CURRENT_HREF;

    // ============================================
    // Instance getters for static URL values
    // ============================================

    /** Normalized pathname (no trailing slash, except root "/") */
    protected get currentPath(): string {
        return Feature.currentPath;
    }

    /** Normalized URL (pathname + search, no trailing slash on path) */
    protected get currentUrl(): string {
        return Feature.currentUrl;
    }

    /** Full normalized href (origin + pathname + search) */
    protected get currentHref(): string {
        return Feature.currentHref;
    }

    // ============================================
    // Instance properties
    // ============================================

    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly urlMatch?: UrlMatchConfig;

    /** Logger với prefix tự động từ tên feature */
    protected readonly log: Logger;

    /** Kết quả match sau khi shouldRun() được gọi */
    protected matchResult: MatchResult | null = null;

    constructor(config: FeatureConfig) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.urlMatch = config.urlMatch;

        // Auto-create logger with feature name as prefix
        this.log = createLogger(config.name);
    }

    // ============================================
    // URL Matching Logic
    // ============================================

    /**
     * Normalize urlMatch config to array of MatchPattern
     */
    private normalizePatterns(config: UrlMatchConfig): MatchPattern[] {
        // Already an array
        if (Array.isArray(config)) {
            return config.map((item) => {
                // If item is MatchPattern object
                if (typeof item === 'object' && 'pattern' in item) {
                    return item;
                }
                // If item is RegExp or string, wrap it
                return { pattern: item as RegExp | string };
            });
        }

        // Single MatchPattern object
        if (typeof config === 'object' && 'pattern' in config) {
            return [config];
        }

        // Single RegExp or string
        return [{ pattern: config as RegExp | string }];
    }

    /**
     * Test if a pattern matches the current URL
     * - String patterns: exact match against pathname only (ignores search params)
     * - RegExp patterns: test against pathname + search (full flexibility)
     */
    private testPattern(pattern: RegExp | string): boolean {
        if (typeof pattern === 'string') {
            // String = exact match against pathname only
            return this.currentPath === pattern;
        }
        // RegExp = test against path + search
        return pattern.test(this.currentUrl);
    }

    /**
     * Check if this feature should run on the current URL
     */
    shouldRun(): boolean {
        // Check if feature is enabled in settings
        if (!settings.isFeatureEnabled(this.id)) {
            return false;
        }

        // Reset match result
        this.matchResult = { matched: false };

        // If no urlMatch, run on all pages
        if (!this.urlMatch) {
            this.matchResult.matched = true;
            return true;
        }

        // Normalize to array of patterns
        const patterns = this.normalizePatterns(this.urlMatch);

        // Try each pattern
        for (let i = 0; i < patterns.length; i++) {
            const { name, pattern } = patterns[i];

            if (this.testPattern(pattern)) {
                this.matchResult = {
                    matched: true,
                    matchIndex: i,
                    matchName: name,
                    pattern: pattern,
                };
                return true;
            }
        }

        return false;
    }

    // ============================================
    // Lifecycle Methods
    // ============================================

    /**
     * Initialize feature - called when feature is loaded
     * Override this method to add initialization logic
     */
    abstract init(): void | Promise<void>;

    /**
     * Cleanup when feature is disabled or unloaded
     * Override if cleanup is needed
     */
    destroy(): void {
        // Default: do nothing
    }
}
