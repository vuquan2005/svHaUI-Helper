/**
 * Type definitions for project
 */

import type { LogLevel } from '@/core/logger';

// ============================================
// Data Interfaces
// ============================================

/**
 * Application settings
 */
export interface AppSettings {
    logLevel: LogLevel;
    features: Record<string, boolean>;
}

/**
 * Course and grade information
 */
export interface CourseGrade {
    name: string;
    credits: number;
    midterm: number | null;
    final: number | null;
    average: number | null;
    letterGrade: string;
    gradePoint: number;
}

// ============================================
// Storage Schema
// ============================================

/**
 * Define all keys and types in GM storage
 * Add new keys here for autocomplete and type safety
 */
export interface StorageSchema {
    app_settings: AppSettings;
    grades: CourseGrade[];
    captcha_undo_telex: boolean;
}

// Utility types
export type StorageKey = keyof StorageSchema;
