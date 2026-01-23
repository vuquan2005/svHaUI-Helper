/**
 * Feature Base Class - Base class for all features
 * Each feature inherits from this class to ensure consistent structure
 */

import { createLogger, Logger } from './logger';
import { browserLocation } from '../utils/window-location';

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
    /** Priority - higher runs first, default 0 */
    priority?: number;
    /** Regex, string, MatchPattern, or array of MatchPattern to match URL */
    urlMatch?: UrlMatchConfig;
}

// ============================================
// URL Normalization Utilities
// ============================================

export abstract class Feature {
    // ============================================
    // Instance getters for static URL values
    // ============================================

    protected location = browserLocation;

    // ============================================
    // Instance properties
    // ============================================

    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly priority: number;
    readonly urlMatch?: UrlMatchConfig;

    private _log?: Logger;

    /** Logger với prefix tự động từ tên feature (Lazy loaded) */
    protected get log(): Logger {
        return (this._log ??= createLogger(this.name));
    }

    /** Kết quả match sau khi shouldRun() được gọi */
    protected matchResult: MatchResult | null = null;

    constructor(config: FeatureConfig) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.priority = config.priority ?? 0;
        this.urlMatch = config.urlMatch;
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
            return this.location.path === pattern;
        }
        // RegExp = test against path + search
        return pattern.test(this.location.pathAndQuery);
    }

    /**
     * Check if this feature should run on the current URL
     */
    shouldRun(): boolean {
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
     * Run feature - called when feature is loaded
     * Override this method to add logic
     */
    abstract run(): void | Promise<void>;

    /**
     * Cleanup when feature is disabled or unloaded
     * Override if cleanup is needed
     */
    cleanup(): void {
        // Default: do nothing
    }
}
