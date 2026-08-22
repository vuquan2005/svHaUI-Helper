/**
 * Pure calculation logic for GPA, Course Grading, and Target Projections
 */

import {
    GradeLetter,
    CourseGradeRow,
    GPASummary,
    TargetGPAResult,
    GPAPredictionResult,
} from './types';
import {
    SCORE4_TO_GRADE,
    DEFAULT_NON_CREDIT_PATTERNS,
    TARGET_GPA_CONFIGS,
    getAcademicClassification,
} from './config';

/**
 * Check if a course code belongs to non-credit category (GDTC, GDQP, etc.)
 */
export function isNonCreditCourse(
    courseCode: string,
    patterns: (string | RegExp)[] = DEFAULT_NON_CREDIT_PATTERNS
): boolean {
    const code = courseCode.trim().toUpperCase();
    if (!code) return false;

    for (const pattern of patterns) {
        if (typeof pattern === 'string') {
            if (code.startsWith(pattern.toUpperCase())) {
                return true;
            }
        } else if (pattern instanceof RegExp) {
            if (pattern.test(code)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Normalize arbitrary user grade input (letter, number, diacritics) into a valid GradeLetter and score4
 */
export function normalizeGradeInput(
    rawInput: string
): { grade: GradeLetter; score4: number } | null {
    if (!rawInput) return null;

    let text = rawInput
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/Đ/g, 'D');

    // Handle number inputs (e.g., "4", "4.0", "3.5", "3", "2.5", "2", "1.5", "1", "0")
    const numericMatch = text.match(/^(\d+(?:\.\d+)?)$/);
    if (numericMatch) {
        const num = parseFloat(numericMatch[1]);
        const rounded = Math.round(num * 2) / 2;
        if (rounded in SCORE4_TO_GRADE) {
            const letter = SCORE4_TO_GRADE[rounded];
            return { grade: letter, score4: rounded };
        }
    }

    // Handle letter inputs (e.g., "A", "B+", "B", "C+", "C", "D+", "D", "F")
    text = text.replace(/\s+/g, '');
    if (text.startsWith('A')) return { grade: 'A', score4: 4.0 };
    if (text.startsWith('B+') || text.startsWith('BPLUS') || text === 'B+')
        return { grade: 'B+', score4: 3.5 };
    if (text === 'B') return { grade: 'B', score4: 3.0 };
    if (text.startsWith('C+') || text.startsWith('CPLUS') || text === 'C+')
        return { grade: 'C+', score4: 2.5 };
    if (text === 'C') return { grade: 'C', score4: 2.0 };
    if (text.startsWith('D+') || text.startsWith('DPLUS') || text === 'D+')
        return { grade: 'D+', score4: 1.5 };
    if (text === 'D') return { grade: 'D', score4: 1.0 };
    if (text.startsWith('F')) return { grade: 'F', score4: 0.0 };

    return null;
}

export interface SimplifiedCourseItem {
    courseCode: string;
    credits: number;
    score4: number | null;
    isNonCredit: boolean;
}

/**
 * Calculate GPA Summary from a list of courses.
 * Applies HaUI rule: When a course is retaken/improved (same courseCode), the highest score4 is used.
 */
export function calculateGPASummary(courses: SimplifiedCourseItem[]): GPASummary {
    const bestCourseMap = new Map<string, { credits: number; score4: number }>();

    for (const course of courses) {
        if (course.isNonCredit) continue;
        if (course.score4 === null || isNaN(course.score4)) continue;
        if (isNaN(course.credits) || course.credits <= 0) continue;

        const code = course.courseCode.trim().toUpperCase();
        if (!code) continue;

        const existing = bestCourseMap.get(code);
        if (!existing || course.score4 > existing.score4) {
            bestCourseMap.set(code, {
                credits: course.credits,
                score4: course.score4,
            });
        }
    }

    let sumWeightedScore = 0;
    let sumGPACredits = 0;
    let totalAccumulatedCredits = 0;

    for (const { credits, score4 } of bestCourseMap.values()) {
        sumWeightedScore += score4 * credits;
        sumGPACredits += credits;

        if (score4 >= 1.0) {
            totalAccumulatedCredits += credits;
        }
    }

    const gpa = sumGPACredits > 0 ? Number((sumWeightedScore / sumGPACredits).toFixed(3)) : 0;
    const classification = getAcademicClassification(gpa);

    return {
        gpa,
        totalAccumulatedCredits,
        classification,
        courseCount: bestCourseMap.size,
    };
}

export interface CalculateTargetsOptions {
    customTargetGPA?: number;
    targets?: Array<{ targetGPA: number; label: string }>;
}

/**
 * Calculate required score average for target GPAs in remaining credits (including custom target).
 */
export function calculateTargets(
    currentGPA: number,
    currentAccumulatedCredits: number,
    totalTargetCredits: number,
    options?: CalculateTargetsOptions
): TargetGPAResult[] {
    const remainingCredits = Math.max(0, totalTargetCredits - currentAccumulatedCredits);
    const customTargetGPA = options?.customTargetGPA;
    const baseTargets = options?.targets || TARGET_GPA_CONFIGS;

    const allTargets = [...baseTargets];
    if (customTargetGPA !== undefined && !isNaN(customTargetGPA) && customTargetGPA > 0) {
        allTargets.push({
            targetGPA: customTargetGPA,
            label: `Tùy chỉnh (${customTargetGPA.toFixed(2)})`,
        });
    }

    return allTargets.map(({ targetGPA, label }, index) => {
        const isCustom = customTargetGPA !== undefined && index === allTargets.length - 1;

        if (remainingCredits <= 0) {
            if (currentGPA >= targetGPA) {
                return {
                    targetGPA,
                    label,
                    requiredAverage: null,
                    status: 'achievable',
                    isCustom,
                };
            }
            return {
                targetGPA,
                label,
                requiredAverage: null,
                status: 'no_remaining_credits',
                isCustom,
            };
        }

        const required =
            (targetGPA * totalTargetCredits - currentGPA * currentAccumulatedCredits) /
            remainingCredits;

        if (required <= 0) {
            return {
                targetGPA,
                label,
                requiredAverage: 0,
                status: 'achievable',
                isCustom,
            };
        }

        const rounded = Number(required.toFixed(2));
        if (rounded > 4.0) {
            return {
                targetGPA,
                label,
                requiredAverage: rounded,
                status: 'impossible',
                isCustom,
            };
        }

        return {
            targetGPA,
            label,
            requiredAverage: rounded,
            status: 'achievable',
            isCustom,
        };
    });
}

/**
 * Calculate full prediction comparing original, simulated, edited-only, and selected-only states
 */
export function calculateFullPrediction(
    rows: CourseGradeRow[],
    totalTargetCredits: number,
    customTargetGPA?: number
): GPAPredictionResult {
    const originalCourses: SimplifiedCourseItem[] = rows.map((r) => ({
        courseCode: r.courseCode,
        credits: r.credits,
        score4: r.originalScore4,
        isNonCredit: r.isNonCredit,
    }));

    const simulatedCourses: SimplifiedCourseItem[] = rows.map((r) => ({
        courseCode: r.courseCode,
        credits: r.credits,
        score4: r.currentScore4,
        isNonCredit: r.isNonCredit,
    }));

    const originalSummary = calculateGPASummary(originalCourses);
    const simulatedSummary = calculateGPASummary(simulatedCourses);

    const isEdited = rows.some((r) => r.isEdited);

    // Calculate edited-only summary
    let editedOnlySummary: GPASummary | null = null;
    if (isEdited) {
        const editedCourses: SimplifiedCourseItem[] = rows
            .filter((r) => r.isEdited && !r.isNonCredit && r.currentScore4 !== null)
            .map((r) => ({
                courseCode: r.courseCode,
                credits: r.credits,
                score4: r.currentScore4,
                isNonCredit: false,
            }));
        if (editedCourses.length > 0) {
            editedOnlySummary = calculateGPASummary(editedCourses);
        }
    }

    // Calculate selected-only summary (e.g. for semester / custom selection)
    const selectedRows = rows.filter(
        (r) => r.isSelected && !r.isNonCredit && r.currentScore4 !== null
    );
    const hasSelection = selectedRows.length > 0;
    let selectedOnlySummary: GPASummary | null = null;

    if (hasSelection) {
        const selectedCourses: SimplifiedCourseItem[] = selectedRows.map((r) => ({
            courseCode: r.courseCode,
            credits: r.credits,
            score4: r.currentScore4,
            isNonCredit: false,
        }));
        selectedOnlySummary = calculateGPASummary(selectedCourses);
    }

    const activeSummary = isEdited ? simulatedSummary : originalSummary;

    const remainingCredits = Math.max(
        0,
        totalTargetCredits - activeSummary.totalAccumulatedCredits
    );
    const targets = calculateTargets(
        activeSummary.gpa,
        activeSummary.totalAccumulatedCredits,
        totalTargetCredits,
        { customTargetGPA }
    );

    return {
        originalSummary,
        simulatedSummary,
        editedOnlySummary,
        selectedOnlySummary,
        isEdited,
        hasSelection,
        totalTargetCredits,
        remainingCredits,
        targets,
    };
}
