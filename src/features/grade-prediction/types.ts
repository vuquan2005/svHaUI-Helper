/**
 * Types for Grade Prediction & Highlighting Feature
 */

export type GradeLetter = 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';

export type AcademicClassification = 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' | 'Kém';

export interface CourseGradeRow {
    id: string;
    rowIndex: number;
    courseCode: string;
    courseName: string;
    credits: number;
    originalScore4: number | null;
    originalGrade: GradeLetter | null;
    currentScore4: number | null;
    currentGrade: GradeLetter | null;
    isNonCredit: boolean;
    isEdited: boolean;
    isSelected: boolean;
    element: HTMLTableRowElement;
    indexCell: HTMLTableCellElement;
    creditCell: HTMLTableCellElement;
    score4Cell: HTMLTableCellElement;
    gradeCell: HTMLTableCellElement;
}

export interface GPASummary {
    gpa: number;
    totalAccumulatedCredits: number;
    classification: AcademicClassification;
    courseCount: number;
}

export interface TargetGPAResult {
    targetGPA: number;
    label: string;
    requiredAverage: number | null;
    status: 'achievable' | 'exceeded' | 'impossible' | 'no_remaining_credits';
    isCustom?: boolean;
}

export interface GPAPredictionResult {
    originalSummary: GPASummary;
    simulatedSummary: GPASummary;
    editedOnlySummary: GPASummary | null;
    selectedOnlySummary: GPASummary | null;
    isEdited: boolean;
    hasSelection: boolean;
    totalTargetCredits: number;
    remainingCredits: number;
    targets: TargetGPAResult[];
}

export interface GradePredictionStorage extends Record<string, unknown> {
    defaultTotalCredits?: number;
    customTargetGPA?: number;
    customNonCreditRules?: string;
}
