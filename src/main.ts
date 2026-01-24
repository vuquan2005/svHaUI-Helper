/**
 * SV HaUI Helper - Main Entry Point
 * Enhances the experience for HaUI students
 *
 * @author VuQuan
 * @namespace https://github.com/vuquan2005/svHaUI
 */

import './utils/log-banner';
import { featureManager } from './core';
import { allFeatures } from './features';
import { log } from './core/logger';

async function main(): Promise<void> {
    log.i('Initializing...');

    // Register all features
    featureManager.registerAll(allFeatures);

    // Initialize matching features
    await featureManager.applyFeatures();

    log.i('✅ Ready!');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
