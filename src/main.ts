/**
 * SV HaUI Helper - Main Entry Point
 * Nâng cao trải nghiệm cho sinh viên HaUI
 *
 * @author VuQuan
 * @namespace https://github.com/vuquan2005/svHaUI
 */

import { featureManager } from './core';
import { allFeatures } from './features';
import { log } from './utils';

// Version được inject từ package.json qua vite.config.ts
declare const __APP_VERSION__: string;

// Banner console
console.log(
    `%c🎓 SV HaUI Helper %cv${__APP_VERSION__}`,
    'color: #667eea; font-size: 20px; font-weight: bold;',
    'color: #764ba2; font-size: 14px;'
);

async function main(): Promise<void> {
    log.i('Đang khởi tạo...');

    // Đăng ký tất cả features
    featureManager.registerAll(allFeatures);

    // Khởi chạy các features phù hợp
    await featureManager.initAll();

    log.i('✅ Đã sẵn sàng!');
}

// Chạy khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
