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
    DEFAULT_NON_CREDIT_RULES_TEXT,
    TARGET_GPA_CONFIGS,
    getAcademicClassification,
} from './config';

export interface RuleMatcher {
    raw: string;
    type: 'regex' | 'glob' | 'prefix';
    regex?: RegExp;
    prefix?: string;
}

export interface ParsedRules {
    excludes: RuleMatcher[];
    includes: RuleMatcher[];
}

/**
 * Compile a single pattern line into a RuleMatcher
 */
export function compileRulePattern(pattern: string): RuleMatcher | null {
    const trimmed = pattern.trim();
    if (!trimmed) return null;

    // Check if regex: e.g. /^FL65(?!82|83)/i or /pattern/flags
    if (trimmed.startsWith('/') && trimmed.lastIndexOf('/') > 0) {
        const lastSlash = trimmed.lastIndexOf('/');
        const patternStr = trimmed.slice(1, lastSlash);
        const flags = trimmed.slice(lastSlash + 1);
        try {
            return {
                raw: trimmed,
                type: 'regex',
                regex: new RegExp(patternStr, flags || 'i'),
            };
        } catch {
            // fallback
        }
    }

    // Check if glob (contains * or ?)
    if (trimmed.includes('*') || trimmed.includes('?')) {
        const escaped = trimmed.replace(/[.+^${}()|[\]\\]/g, '\\$&');
        const regexStr = '^' + escaped.replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
        return {
            raw: trimmed,
            type: 'glob',
            regex: new RegExp(regexStr, 'i'),
        };
    }

    // Default: prefix matching (case-insensitive)
    return {
        raw: trimmed,
        type: 'prefix',
        prefix: trimmed.toUpperCase(),
    };
}

/**
 * Match courseCode against a RuleMatcher
 */
export function matchRule(courseCode: string, matcher: RuleMatcher): boolean {
    const code = courseCode.trim().toUpperCase();
    if (!code) return false;

    if (matcher.type === 'regex' || matcher.type === 'glob') {
        return matcher.regex ? matcher.regex.test(code) : false;
    }

    if (matcher.type === 'prefix' && matcher.prefix) {
        return code.startsWith(matcher.prefix);
    }

    return false;
}

/**
 * Parse multiline rules text into structured excludes and includes matchers
 */
export function parseNonCreditRules(rulesText: string): ParsedRules {
    const excludes: RuleMatcher[] = [];
    const includes: RuleMatcher[] = [];

    const lines = rulesText.split('\n');
    for (const rawLine of lines) {
        let cleanLine = rawLine.trim();
        // Strip comments unless it's a regex /.../
        if (!cleanLine.startsWith('/')) {
            cleanLine = cleanLine
                .replace(/#.*$/, '')
                .replace(/\/\/.*$/, '')
                .trim();
        }
        if (!cleanLine) {
            continue;
        }

        if (cleanLine.startsWith('!')) {
            const pat = cleanLine.slice(1).trim();
            const matcher = compileRulePattern(pat);
            if (matcher) includes.push(matcher);
        } else {
            const matcher = compileRulePattern(cleanLine);
            if (matcher) excludes.push(matcher);
        }
    }

    return { excludes, includes };
}

/**
 * Check if a course code belongs to non-credit category based on rules
 */
export function isNonCreditCourse(
    courseCode: string,
    rules: string | ParsedRules = DEFAULT_NON_CREDIT_RULES_TEXT
): boolean {
    const code = courseCode.trim().toUpperCase();
    if (!code) return false;

    const parsed: ParsedRules = typeof rules === 'string' ? parseNonCreditRules(rules) : rules;

    // 1. Check if explicitly included / exception
    for (const inc of parsed.includes) {
        if (matchRule(code, inc)) {
            return false;
        }
    }

    // 2. Check if matches any exclusion
    for (const exc of parsed.excludes) {
        if (matchRule(code, exc)) {
            return true;
        }
    }

    return false;
}

/**
 * Symmetrically toggle a course code in the rules text (remember inclusion or exclusion)
 */
export function toggleCourseInRules(
    rulesText: string,
    courseCode: string,
    currentlyNonCredit: boolean
): string {
    const code = courseCode.trim().toUpperCase();
    if (!code) return rulesText;

    const lines = rulesText.split('\n');

    if (currentlyNonCredit) {
        // User wants to ENABLE credits (turn off non-credit)
        // 1. Remove exact exclusion line for this code
        const filteredLines = lines.filter((line) => {
            const trimmed = line.trim().toUpperCase();
            return trimmed !== code;
        });

        // 2. Check if remaining rules still exclude this course
        const remainingText = filteredLines.join('\n');
        const stillNonCredit = isNonCreditCourse(code, remainingText);

        if (stillNonCredit) {
            const hasInclude = filteredLines.some((l) => l.trim().toUpperCase() === `!${code}`);
            if (!hasInclude) {
                filteredLines.push(`!${code}`);
            }
        }
        return filteredLines.join('\n');
    } else {
        // User wants to DISABLE credits (turn on non-credit)
        // 1. Remove exact exception line for this code
        const filteredLines = lines.filter((line) => {
            const trimmed = line.trim().toUpperCase();
            return trimmed !== `!${code}`;
        });

        // 2. Check if remaining rules already exclude this course
        const remainingText = filteredLines.join('\n');
        const isNonCredit = isNonCreditCourse(code, remainingText);

        if (!isNonCredit) {
            const hasExclude = filteredLines.some((l) => l.trim().toUpperCase() === code);
            if (!hasExclude) {
                filteredLines.push(code);
            }
        }
        return filteredLines.join('\n');
    }
}

/**
 * Normalize arbitrary user grade input (letter, number, diacritics) into a valid GradeLetter and score4.
 * Designed to be lenient and fast for quick typing in the small table cell.
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

    // Strip leading text if user pasted or prefixed anything before the grade letter (e.g. "Điểm: B+" -> "B+")
    text = text.replace(/.+(?=[ABCDF].*)/, '');
    text = text.replace(/\s+/g, '');

    // 1. Handle letter grades: A, B, B+, C, C+, D, D+, F (lenient matching for fast keyboard typing)
    if (/^[ABCDF]/.test(text)) {
        if (text.startsWith('A')) return { grade: 'A', score4: 4.0 };
        if (text === 'B') return { grade: 'B', score4: 3.0 };
        if (text.startsWith('B')) return { grade: 'B+', score4: 3.5 };
        if (text === 'C') return { grade: 'C', score4: 2.0 };
        if (text.startsWith('C')) return { grade: 'C+', score4: 2.5 };
        if (text === 'D' || text === 'DD') return { grade: 'D', score4: 1.0 };
        if (text.startsWith('D')) return { grade: 'D+', score4: 1.5 };
        if (text.startsWith('F')) return { grade: 'F', score4: 0.0 };
    }

    // 2. Handle number inputs (support comma, 2-digit shortcuts e.g. "35" -> 3.5, "40" -> 4.0)
    const normalizedNum = text.replace(',', '.');
    const numericMatch = normalizedNum.match(/^(\d+(?:\.\d+)?)$/);
    if (numericMatch) {
        let num = parseFloat(numericMatch[1]);

        // Shorthand for 2-digit typing without decimal point: 35 -> 3.5, 25 -> 2.5, 15 -> 1.5, 40 -> 4.0, 30 -> 3.0, 20 -> 2.0
        if (num >= 15 && num <= 40 && num % 5 === 0) {
            num = num / 10;
        }

        const rounded = Math.round(num * 2) / 2;
        if (rounded in SCORE4_TO_GRADE) {
            const letter = SCORE4_TO_GRADE[rounded];
            return { grade: letter, score4: rounded };
        }
    }

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

export interface RetakenCourseStatus {
    isSuperseded: boolean;
    isImproved: boolean;
}

export interface RetakenAnalysisItem {
    id: string;
    courseCode: string;
    score4: number | null;
    isNonCredit: boolean;
}

/**
 * Analyze courses to identify retaken/improved attempts:
 * - isSuperseded: An older or lower-scoring attempt whose credits/grade are replaced by another attempt.
 * - isImproved: A winning attempt that improved upon an earlier lower score for the same course.
 */
export function analyzeRetakenCourses(
    courses: RetakenAnalysisItem[]
): Map<string, RetakenCourseStatus> {
    const result = new Map<string, RetakenCourseStatus>();

    // Default all to false
    courses.forEach((c) => {
        result.set(c.id, { isSuperseded: false, isImproved: false });
    });

    // Group eligible credit-bearing courses with courseCode
    const groups = new Map<string, RetakenAnalysisItem[]>();
    for (const c of courses) {
        if (c.isNonCredit) continue;
        const code = c.courseCode.trim().toUpperCase();
        if (!code) continue;

        const group = groups.get(code) || [];
        group.push(c);
        groups.set(code, group);
    }

    for (const group of groups.values()) {
        if (group.length <= 1) continue;

        // Find attempts that have valid score4
        const scoredAttempts = group.filter((item) => item.score4 !== null && !isNaN(item.score4));
        if (scoredAttempts.length <= 1) continue;

        // Find the maximum score among attempts
        let maxScore = -1;
        for (const item of scoredAttempts) {
            if (item.score4! > maxScore) {
                maxScore = item.score4!;
            }
        }

        // Determine winning attempt (consistent with calculateGPASummary: first with maxScore)
        const winningIndex = scoredAttempts.findIndex((item) => item.score4 === maxScore);

        // An attempt is improved if it is the winning attempt AND there was an earlier scored attempt with a lower score
        const hasEarlierLowerScore = scoredAttempts
            .slice(0, winningIndex)
            .some((item) => item.score4! < maxScore);

        for (let i = 0; i < scoredAttempts.length; i++) {
            const item = scoredAttempts[i];
            if (i === winningIndex) {
                if (hasEarlierLowerScore) {
                    result.set(item.id, { isSuperseded: false, isImproved: true });
                }
            } else {
                result.set(item.id, { isSuperseded: true, isImproved: false });
            }
        }
    }

    return result;
}
