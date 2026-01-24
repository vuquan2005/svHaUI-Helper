/**
 * Feature Manager - Manages and coordinates features
 */

import { Feature } from './feature';
import { settings } from './settings-manager';
import { createLogger } from './logger';

const log = createLogger('FeatureManager');

class FeatureManager {
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

                const isEnabled = settings.isFeatureEnabled(
                    feature.id,
                    feature.name,
                    feature.description
                );
                const shouldRun = feature.shouldRun();

                if (!isEnabled || !shouldRun) {
                    try {
                        feature.cleanup();
                        this.running.delete(id);
                        log.d(
                            `🛑 Stopped: ${feature.name} (${!isEnabled ? 'Disabled' : 'URL mismatch'})`
                        );
                    } catch (error) {
                        log.e(`Error stopping "${feature.name}":`, error);
                    }
                }
            }

            // Phase 2: Start features that should run
            for (const [id, feature] of sortedFeatures) {
                if (this.running.has(id)) continue;

                if (!settings.isFeatureEnabled(feature.id, feature.name, feature.description)) {
                    continue;
                }

                if (!feature.shouldRun()) {
                    continue;
                }

                try {
                    log.d(`Starting: ${feature.name} (priority: ${feature.priority})`);
                    await feature.run();
                    this.running.add(id);
                    log.d(`✅ Started: ${feature.name}`);
                } catch (error) {
                    log.e(`Error starting "${feature.name}":`, error);
                }
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
        const feature = this.features.get(id);
        if (!feature) {
            log.w(`Feature "${id}" not found`);
            return false;
        }

        if (this.running.has(id)) {
            log.d(`Feature "${feature.name}" is already running`);
            return false;
        }

        try {
            log.d(`Starting feature: ${feature.name}`);
            await feature.run();
            this.running.add(id);
            log.i(`✅ Started: ${feature.name}`);
            return true;
        } catch (error) {
            log.e(`Error starting "${feature.name}":`, error);
            return false;
        }
    }

    /**
     * Stop a specific feature by ID
     * @returns true if feature was stopped, false if not found or not running
     */
    stopFeature(id: string): boolean {
        const feature = this.features.get(id);
        if (!feature) {
            log.w(`Feature "${id}" not found`);
            return false;
        }

        if (!this.running.has(id)) {
            log.d(`Feature "${feature.name}" is not running`);
            return false;
        }

        try {
            log.d(`Stopping feature: ${feature.name}`);
            feature.cleanup();
            this.running.delete(id);
            log.i(`🛑 Stopped: ${feature.name}`);
            return true;
        } catch (error) {
            log.e(`Error stopping "${feature.name}":`, error);
            return false;
        }
    }
}

export const featureManager = new FeatureManager();
