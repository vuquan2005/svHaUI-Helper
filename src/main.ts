/**
 * SV HaUI Helper - Main Entry Point
 * Enhances the experience for HaUI students
 *
 * @author VuQuan
 * @namespace https://github.com/vuquan2005/svHaUI
 */

import { featureManager } from './core';
import { allFeatures } from './features';
import { log } from './core/logger';

// Version is injected from package.json via vite.config.ts
declare const __APP_VERSION__: string;

// Banner console
console.log(
    `%c🎓 SV HaUI Helper %cv${__APP_VERSION__}`,
    'color: #667eea; font-size: 20px; font-weight: bold;',
    'color: #764ba2; font-size: 14px;'
);

async function main(): Promise<void> {
    log.i('Initializing...');

    // Register all features
    featureManager.registerAll(allFeatures);

    // Initialize matching features
    await featureManager.initAll();

    log.i('✅ Ready!');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
