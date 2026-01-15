/**
 * Features Registry - Đăng ký tất cả features tại đây
 * Import và export các features để sử dụng trong main.ts
 */

import { Feature } from '../core';
import { DynamicTitleFeature } from './dynamic-title';
import { CaptchaHelperFeature } from './captcha-helper';

// Thêm feature mới vào đây
export const allFeatures: Feature[] = [
    new DynamicTitleFeature(),
    new CaptchaHelperFeature(),
    // new HomepageShortcuts(),
    // new NotificationPopup(),
    // new GradeCalculator(),
    // new SettingsMenu(),
];
