/**
 * Feature Manager - Manages and coordinates features
 */

import { Feature } from './feature';
import { createLogger } from './logger';

const log = createLogger('FeatureManager');

class FeatureManager {
    private features: Map<string, Feature> = new Map();
    private initialized: Set<string> = new Set();

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
     * Initialize all features matching the current page
     */
    async initAll(): Promise<void> {
        log.d('Starting feature initialization...');

        for (const [id, feature] of this.features) {
            if (this.initialized.has(id)) {
                continue;
            }

            if (!feature.shouldRun()) {
                log.d(`Skipping "${feature.name}" (URL mismatch or disabled)`);
                continue;
            }

            try {
                log.d(`Initializing: ${feature.name}`);
                await feature.init();
                this.initialized.add(id);
            } catch (error) {
                log.e(`Error initializing "${feature.name}":`, error);
            }
        }

        log.i(`Initialized ${this.initialized.size}/${this.features.size} features`);
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
     * Check if a feature has been initialized
     */
    isInitialized(id: string): boolean {
        return this.initialized.has(id);
    }
}

export const featureManager = new FeatureManager();
