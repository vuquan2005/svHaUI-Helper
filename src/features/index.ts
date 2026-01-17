/**
 * Features Registry - Register all features here
 * Import and export features for use in main.ts
 */

import { Feature } from '@/core';
import { DynamicTitleFeature } from './dynamic-title';
import { CaptchaHelperFeature } from './captcha-helper';

// Add new features here
export const allFeatures: Feature[] = [new DynamicTitleFeature(), new CaptchaHelperFeature()];
