/**
 * Grade Store - Single Source of Truth for Grade Prediction state
 */

import { CourseGradeRow, GPAPredictionResult } from './types';
import {
    calculateFullPrediction,
    normalizeGradeInput,
    isNonCreditCourse,
    toggleCourseInRules,
} from './grade-calculator';
import { DEFAULT_TOTAL_CREDITS, DEFAULT_NON_CREDIT_RULES_TEXT } from './config';

export type StoreListener = (store: GradeStore) => void;

export class GradeStore {
    private _rows: CourseGradeRow[] = [];
    private _isEditMode: boolean = false;
    private _totalTargetCredits: number = DEFAULT_TOTAL_CREDITS;
    private _customTargetGPA: number = 3.0;
    private _nonCreditRules: string = DEFAULT_NON_CREDIT_RULES_TEXT;
    private _listeners: Set<StoreListener> = new Set();

    get rows(): readonly CourseGradeRow[] {
        return this._rows;
    }

    get isEditMode(): boolean {
        return this._isEditMode;
    }

    get totalTargetCredits(): number {
        return this._totalTargetCredits;
    }

    get customTargetGPA(): number {
        return this._customTargetGPA;
    }

    get nonCreditRules(): string {
        return this._nonCreditRules;
    }

    get isEdited(): boolean {
        return this._rows.some((r) => r.isEdited);
    }

    get hasSelection(): boolean {
        return this._rows.some((r) => r.isSelected);
    }

    get selectedCount(): number {
        return this._rows.filter((r) => r.isSelected).length;
    }

    /**
     * Subscribe to store changes
     */
    subscribe(listener: StoreListener): () => void {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    private notify(): void {
        this._listeners.forEach((listener) => {
            try {
                listener(this);
            } catch (err) {
                console.error('[GradeStore] Listener error:', err);
            }
        });
    }

    /**
     * Initialize store with parsed rows
     */
    setRows(
        rows: CourseGradeRow[],
        totalTargetCredits?: number,
        customTargetGPA?: number,
        nonCreditRules?: string
    ): void {
        this._rows = rows;
        if (totalTargetCredits && totalTargetCredits > 0) {
            this._totalTargetCredits = totalTargetCredits;
        }
        if (customTargetGPA && customTargetGPA > 0) {
            this._customTargetGPA = Number(customTargetGPA.toFixed(2));
        }
        if (nonCreditRules !== undefined && nonCreditRules.trim() !== '') {
            this._nonCreditRules = nonCreditRules;
            // Apply rules to all rows
            this._rows.forEach((r) => {
                r.isNonCredit = isNonCreditCourse(r.courseCode, this._nonCreditRules);
            });
        }
        this.notify();
    }

    /**
     * Update custom non-credit rules text and re-apply to all rows
     */
    setNonCreditRules(rulesText: string): void {
        this._nonCreditRules = rulesText;
        this._rows.forEach((r) => {
            r.isNonCredit = isNonCreditCourse(r.courseCode, this._nonCreditRules);
        });
        this.notify();
    }

    /**
     * Toggle or set edit mode
     */
    toggleEditMode(enabled?: boolean): void {
        this._isEditMode = enabled !== undefined ? enabled : !this._isEditMode;
        this.notify();
    }

    /**
     * Update target total credits for graduation
     */
    setTotalTargetCredits(credits: number): void {
        if (isNaN(credits) || credits <= 0) return;
        this._totalTargetCredits = Math.round(credits);
        this.notify();
    }

    /**
     * Update custom target GPA
     */
    setCustomTargetGPA(gpa: number): void {
        if (isNaN(gpa) || gpa < 0 || gpa > 4.0) return;
        this._customTargetGPA = Number(gpa.toFixed(2));
        this.notify();
    }

    /**
     * Toggle manual selection of a course row
     */
    toggleCourseSelection(rowId: string): void {
        const row = this._rows.find((r) => r.id === rowId);
        if (!row) return;

        row.isSelected = !row.isSelected;
        this.notify();
    }

    /**
     * Clear all selected courses
     */
    clearSelection(): void {
        this._rows.forEach((r) => {
            r.isSelected = false;
        });
        this.notify();
    }

    /**
     * Update a course grade (handles non-empty grade and empty string)
     */
    updateCourseGrade(rowId: string, rawInput: string): boolean {
        const row = this._rows.find((r) => r.id === rowId);
        if (!row) return false;

        const trimmed = rawInput.trim();

        // If user cleared the grade cell
        if (!trimmed) {
            row.currentGrade = null;
            row.currentScore4 = null;
            row.isEdited = row.originalGrade !== null || row.originalScore4 !== null;
            this.notify();
            return true;
        }

        const normalized = normalizeGradeInput(trimmed);
        if (!normalized) {
            return false;
        }

        row.currentGrade = normalized.grade;
        row.currentScore4 = normalized.score4;
        row.isEdited =
            row.currentGrade !== row.originalGrade || row.currentScore4 !== row.originalScore4;

        this.notify();
        return true;
    }

    /**
     * Toggle a course's non-credit status and automatically remember/sync in rules
     */
    toggleCourseNonCredit(rowId: string): void {
        const row = this._rows.find((r) => r.id === rowId);
        if (!row) return;

        this._nonCreditRules = toggleCourseInRules(
            this._nonCreditRules,
            row.courseCode,
            row.isNonCredit
        );

        // Re-evaluate all rows with the updated rules
        this._rows.forEach((r) => {
            r.isNonCredit = isNonCreditCourse(r.courseCode, this._nonCreditRules);
        });

        this.notify();
    }

    /**
     * Reset all simulated edits back to original state
     */
    resetAllEdits(): void {
        this._rows.forEach((row) => {
            row.currentGrade = row.originalGrade;
            row.currentScore4 = row.originalScore4;
            row.isEdited = false;
        });
        this.notify();
    }

    /**
     * Compute current prediction comparison
     */
    getPrediction(): GPAPredictionResult {
        return calculateFullPrediction(this._rows, this._totalTargetCredits, this._customTargetGPA);
    }
}
