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
import { GradePredictionFeature } from './grade-prediction';
import { HomeShortcutsFeature } from './home-shortcuts';
import { ExamHelperFeature } from './exam-helper';

// Add new features here
export const allFeatures: Feature<any>[] = [
    new DynamicTitleFeature(),
    new CaptchaHelperFeature(),
    new GradeNavigationFeature(),
    new GradePredictionFeature(),
    new SurveyAutofillFeature(),
    new RemoveSnowfallFeature(),
    new ExportTimetableFeature(),
    new HomeShortcutsFeature(),
    new ExamHelperFeature(),
];
