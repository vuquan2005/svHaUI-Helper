/**
 * Feature Base Class - Base class for all features
 * Each feature inherits from this class to ensure consistent structure
 */

import { settings } from './settings';
import { createLogger, Logger } from './logger';

export interface FeatureConfig {
    id: string;
    name: string;
    description: string;
    // Regex or string to match URL, if not set runs on all pages
    urlMatch?: RegExp | string;
}

export abstract class Feature {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly urlMatch?: RegExp | string;

    /** Logger tự động có prefix từ tên feature */
    protected readonly log: Logger;

    constructor(config: FeatureConfig) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.urlMatch = config.urlMatch;

        // Auto-create logger with feature name as prefix
        this.log = createLogger(config.name);
    }

    /**
     * Check if this feature should run on the current URL
     */
    shouldRun(): boolean {
        // Check if feature is enabled
        if (!settings.isFeatureEnabled(this.id)) {
            return false;
        }

        // If no urlMatch, run on all pages
        if (!this.urlMatch) {
            return true;
        }

        const currentUrl = window.location.href;

        if (typeof this.urlMatch === 'string') {
            return currentUrl.includes(this.urlMatch);
        }

        return this.urlMatch.test(currentUrl);
    }

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
