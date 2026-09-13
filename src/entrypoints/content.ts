import '@/utils/log-banner';
import { featureManager } from '@/core';
import { allFeatures } from '@/features';
import { log } from '@/core/logger';

export default defineContentScript({
    matches: ['https://sv.haui.edu.vn/*'],
    runAt: 'document_end',
    async main() {
        log.i('Initializing SV HaUI Helper...');

        // Register all features
        featureManager.registerAll(allFeatures);

        // Initialize matching features
        await featureManager.applyFeatures();

        log.i('✅ Ready!');
    },
});
