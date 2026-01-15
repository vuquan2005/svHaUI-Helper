/**
 * Type definitions cho project
 */

import type { LogLevel } from '../core/logger';

// ============================================
// Data Interfaces
// ============================================

/**
 * Cài đặt ứng dụng
 */
export interface AppSettings {
    logLevel: LogLevel;
    features: Record<string, boolean>;
}

/**
 * Thông tin môn học và điểm
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
 * Định nghĩa tất cả keys và types trong GM storage
 * Thêm key mới vào đây để có autocomplete và type safety
 */
export interface StorageSchema {
    app_settings: AppSettings;
    grades: CourseGrade[];
}

// Utility types
export type StorageKey = keyof StorageSchema;
