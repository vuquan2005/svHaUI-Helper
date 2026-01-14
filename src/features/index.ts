/**
 * Features Registry - Đăng ký tất cả features tại đây
 * Import và export các features để sử dụng trong main.ts
 */

import { Feature } from '../core';
import { ExampleFeature } from './example';

// Thêm feature mới vào đây
export const allFeatures: Feature[] = [
    new ExampleFeature(),
    // new HomepageShortcuts(),
    // new NotificationPopup(),
    // new GradeCalculator(),
    // new SettingsMenu(),
];
