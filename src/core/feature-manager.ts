/**
 * Feature Manager - Manages and coordinates features
 */

import { Feature } from './feature';
import { createLogger } from './logger';

const log = createLogger('FeatureManager');

/**
 * Feature Manager coordinates the lifecycle of all user features.
 * It handles registration, URL matching, and safe execution/cleanup.
 */
export class FeatureManager {
    private features: Map<string, Feature> = new Map();
    private running: Set<string> = new Set();
    private isApplying = false;
    private pendingApply = false;

    /**
     * Register a new feature
     */
    register(feature: Feature): void {
        if (this.features.has(feature.id)) {
            log.w(`Feature "${feature.id}" already registered, skipping.`);
            return;
        }
        this.features.set(feature.id, feature);
        log.d(`Registered: ${feature.name}`);
    }

    /**
     * Register multiple features at once
     */
    registerAll(features: Feature[]): void {
        features.forEach((f) => this.register(f));
    }

    /**
     * Internal method to execute feature start
     */
    private async _executeStart(feature: Feature): Promise<boolean> {
        try {
            log.d(`Starting: ${feature.name}`);
            await feature.run();
            this.running.add(feature.id);
            log.i(`✅ Started: ${feature.name}`);
            return true;
        } catch (error) {
            log.e(`Error starting "${feature.name}":`, error);
            return false;
        }
    }

    /**
     * Internal method to execute feature stop
     */
    private _executeStop(feature: Feature): boolean {
        try {
            feature.cleanup();
            this.running.delete(feature.id);
            log.i(`🛑 Stopped: ${feature.name}`);
            return true;
        } catch (error) {
            log.e(`Error stopping "${feature.name}":`, error);
            return false;
        }
    }

    /**
     * Apply features matching the current page
     * Can be called multiple times (e.g., on SPA route changes)
     */
    async applyFeatures(): Promise<void> {
        if (this.isApplying) {
            log.d('applyFeatures already in progress, queuing...');
            this.pendingApply = true;
            return;
        }

        this.isApplying = true;
        log.d('Applying features...');

        try {
            // Sort by priority descending
            const sortedFeatures = [...this.features.entries()].sort(
                ([, a], [, b]) => b.priority - a.priority
            );

            // Phase 1: Stop features that should no longer run
            for (const [id, feature] of sortedFeatures) {
                if (!this.running.has(id)) continue;

                // const isEnabled = settings.isFeatureEnabled(
                //     feature.id,
                //     feature.name,
                //     feature.description
                // );
                const shouldRun = feature.shouldRun();

                if (/*!isEnabled ||*/ !shouldRun) {
                    const reason = !shouldRun ? 'URL mismatch' : 'Disabled';
                    log.d(`Stopping ${feature.name} (Reason: ${reason})`);
                    this._executeStop(feature);
                }
            }

            // Phase 2: Start features that should run
            for (const [id, feature] of sortedFeatures) {
                if (this.running.has(id)) continue;

                // if (!settings.isFeatureEnabled(feature.id, feature.name, feature.description)) {
                //     continue;
                // }

                if (!feature.shouldRun()) {
                    continue;
                }

                await this._executeStart(feature);
            }

            log.i(`✅ Running ${this.running.size}/${this.features.size} features`);
        } finally {
            this.isApplying = false;

            // If another apply was requested while we were running, run it now
            if (this.pendingApply) {
                this.pendingApply = false;
                log.d('Running pending applyFeatures...');
                await this.applyFeatures();
            }
        }
    }

    /**
     * Get feature by ID
     */
    get(id: string): Feature | undefined {
        return this.features.get(id);
    }

    /**
     * Get all registered features
     */
    getAll(): Feature[] {
        return Array.from(this.features.values());
    }

    /**
     * Check if a feature is currently running
     */
    isRunning(id: string): boolean {
        return this.running.has(id);
    }

    getAllIds(): string[] {
        return Array.from(this.features.keys());
    }

    getAllRunningIds(): string[] {
        return Array.from(this.running.values());
    }

    getAllNotRunningIds(): string[] {
        return Array.from(this.features.keys()).filter((id) => !this.running.has(id));
    }

    /**
     * Start a specific feature by ID
     * @returns true if feature was started, false if not found or already running
     */
    async startFeature(id: string): Promise<boolean> {
        if (this.isApplying) {
            log.w('Cannot manually start feature while features are being applied');
            return false;
        }

        const feature = this.features.get(id);
        if (!feature) {
            log.w(`Feature "${id}" not found`);
            return false;
        }

        if (this.running.has(id)) {
            log.d(`Feature "${feature.name}" is already running`);
            return false;
        }

        return this._executeStart(feature);
    }

    /**
     * Stop a specific feature by ID
     * @returns true if feature was stopped, false if not found or not running
     */
    stopFeature(id: string): boolean {
        if (this.isApplying) {
            log.w('Cannot manually stop feature while features are being applied');
            return false;
        }

        const feature = this.features.get(id);
        if (!feature) {
            log.w(`Feature "${id}" not found`);
            return false;
        }

        if (!this.running.has(id)) {
            log.d(`Feature "${feature.name}" is not running`);
            return false;
        }

        return this._executeStop(feature);
    }
}

export const featureManager = new FeatureManager();
