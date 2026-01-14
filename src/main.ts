/**
 * SV HaUI Helper - Main Entry Point
 * Nâng cao trải nghiệm cho sinh viên HaUI
 *
 * @author VuQuan
 * @namespace https://github.com/vuquan2005/svHaUI
 */

import { featureManager, settings } from './core';
import { allFeatures } from './features';

// Banner console
console.log(
    '%c🎓 SV HaUI Helper %cv1.0.0',
    'color: #667eea; font-size: 20px; font-weight: bold;',
    'color: #764ba2; font-size: 14px;'
);

async function main(): Promise<void> {
    // Kiểm tra nếu script bị tắt
    if (!settings.get('enabled')) {
        console.log('[Main] Script bị tắt trong settings, dừng khởi tạo.');
        return;
    }

    console.log('[Main] Đang khởi tạo SV HaUI Helper...');

    // Đăng ký tất cả features
    featureManager.registerAll(allFeatures);

    // Khởi chạy các features phù hợp
    await featureManager.initAll();

    console.log('[Main] ✅ SV HaUI Helper đã sẵn sàng!');
}

// Chạy khi DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
