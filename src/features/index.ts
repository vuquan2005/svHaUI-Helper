/**
 * Features Registry - Register all features here
 * Import and export features for use in main.ts
 */

import { Feature } from '@/core';
import { DynamicTitleFeature } from './dynamic-title';
import { CaptchaHelperFeature } from './captcha-helper';
import { GradeNavigationFeature } from './grade-navigation';
import { SurveyAutofillFeature } from './survey-autofill';
import { RemoveSnowfallFeature } from './misc';
import { ExportTimetableFeature } from './export-timetable';

// Add new features here
export const allFeatures: Feature<any>[] = [
    new DynamicTitleFeature(),
    new CaptchaHelperFeature(),
    new GradeNavigationFeature(),
    new SurveyAutofillFeature(),
    new RemoveSnowfallFeature(),
    new ExportTimetableFeature(),
];
