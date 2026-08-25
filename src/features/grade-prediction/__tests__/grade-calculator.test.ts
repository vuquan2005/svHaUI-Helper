import { describe, it, expect } from 'vitest';
import {
    isNonCreditCourse,
    toggleCourseInRules,
    normalizeGradeInput,
    calculateGPASummary,
    calculateTargets,
} from '../grade-calculator';

describe('Grade Calculator', () => {
    describe('isNonCreditCourse & Rules Syntax', () => {
        it('should identify PE (Thể chất) as non-credit with default rules', () => {
            expect(isNonCreditCourse('PE6001')).toBe(true);
            expect(isNonCreditCourse('pe6012')).toBe(true);
        });

        it('should identify DC (Quốc phòng) as non-credit', () => {
            expect(isNonCreditCourse('DC6001')).toBe(true);
        });

        it('should identify basic IT as non-credit', () => {
            expect(isNonCreditCourse('IC6005')).toBe(true);
            expect(isNonCreditCourse('IC6006')).toBe(true);
        });

        it('should identify FL60xx basic languages as non-credit', () => {
            expect(isNonCreditCourse('FL6091')).toBe(true);
            expect(isNonCreditCourse('FL6092')).toBe(true);
        });

        it('should not mark credit-bearing courses as non-credit', () => {
            expect(isNonCreditCourse('IT6005')).toBe(false);
            expect(isNonCreditCourse('MA6001')).toBe(false);
            expect(isNonCreditCourse('FL682')).toBe(false); // German exempt (!FL682)
            expect(isNonCreditCourse('FL683')).toBe(false); // German exempt (!FL683)
        });

        it('should parse custom simple rules with comments and wildcards', () => {
            const customRules = `
                # My custom exclusions
                CS*
                MATH101
                !CS999 # Exception
            `;
            expect(isNonCreditCourse('CS101', customRules)).toBe(true);
            expect(isNonCreditCourse('CS202', customRules)).toBe(true);
            expect(isNonCreditCourse('CS999', customRules)).toBe(false); // Overridden by !
            expect(isNonCreditCourse('MATH101', customRules)).toBe(true);
            expect(isNonCreditCourse('MATH102', customRules)).toBe(false);
        });
    });

    describe('toggleCourseInRules', () => {
        it('should add !CODE exception when enabling credits for a pattern-matched course', () => {
            const rules = 'PE*\nDC*';
            // PE6001 is non-credit (matches PE*). User clicks to ENABLE credits (currentlyNonCredit = true).
            const updated = toggleCourseInRules(rules, 'PE6001', true);
            expect(isNonCreditCourse('PE6001', updated)).toBe(false);
            expect(isNonCreditCourse('PE6002', updated)).toBe(true); // Other PE remains non-credit
            expect(updated).toContain('!PE6001');
        });

        it('should remove !CODE exception when disabling credits again', () => {
            const rules = 'PE*\nDC*\n!PE6001';
            // PE6001 is currently credit (currentlyNonCredit = false). User clicks to DISABLE credits.
            const updated = toggleCourseInRules(rules, 'PE6001', false);
            expect(isNonCreditCourse('PE6001', updated)).toBe(true);
            expect(updated).not.toContain('!PE6001');
        });

        it('should add explicit CODE when making a normal course non-credit', () => {
            const rules = 'PE*\nDC*';
            // IT6001 is credit (currentlyNonCredit = false). User clicks to DISABLE credits.
            const updated = toggleCourseInRules(rules, 'IT6001', false);
            expect(isNonCreditCourse('IT6001', updated)).toBe(true);
            expect(updated).toContain('IT6001');
        });

        it('should remove explicit CODE when making it credit again', () => {
            const rules = 'PE*\nDC*\nIT6001';
            // IT6001 is currently non-credit. User clicks to ENABLE credits (currentlyNonCredit = true).
            const updated = toggleCourseInRules(rules, 'IT6001', true);
            expect(isNonCreditCourse('IT6001', updated)).toBe(false);
            expect(updated).not.toContain('IT6001');
        });
    });

    describe('normalizeGradeInput', () => {
        it('should normalize letters correctly', () => {
            expect(normalizeGradeInput('a')).toEqual({ grade: 'A', score4: 4.0 });
            expect(normalizeGradeInput('A')).toEqual({ grade: 'A', score4: 4.0 });
            expect(normalizeGradeInput('b+')).toEqual({ grade: 'B+', score4: 3.5 });
            expect(normalizeGradeInput('B+')).toEqual({ grade: 'B+', score4: 3.5 });
            expect(normalizeGradeInput('b')).toEqual({ grade: 'B', score4: 3.0 });
            expect(normalizeGradeInput('c+')).toEqual({ grade: 'C+', score4: 2.5 });
            expect(normalizeGradeInput('c')).toEqual({ grade: 'C', score4: 2.0 });
            expect(normalizeGradeInput('d+')).toEqual({ grade: 'D+', score4: 1.5 });
            expect(normalizeGradeInput('d')).toEqual({ grade: 'D', score4: 1.0 });
            expect(normalizeGradeInput('f')).toEqual({ grade: 'F', score4: 0.0 });
        });

        it('should normalize numeric score4 inputs', () => {
            expect(normalizeGradeInput('4')).toEqual({ grade: 'A', score4: 4.0 });
            expect(normalizeGradeInput('4.0')).toEqual({ grade: 'A', score4: 4.0 });
            expect(normalizeGradeInput('3.5')).toEqual({ grade: 'B+', score4: 3.5 });
            expect(normalizeGradeInput('3.0')).toEqual({ grade: 'B', score4: 3.0 });
            expect(normalizeGradeInput('3')).toEqual({ grade: 'B', score4: 3.0 });
            expect(normalizeGradeInput('2.5')).toEqual({ grade: 'C+', score4: 2.5 });
            expect(normalizeGradeInput('2.0')).toEqual({ grade: 'C', score4: 2.0 });
            expect(normalizeGradeInput('1.5')).toEqual({ grade: 'D+', score4: 1.5 });
            expect(normalizeGradeInput('1.0')).toEqual({ grade: 'D', score4: 1.0 });
            expect(normalizeGradeInput('0')).toEqual({ grade: 'F', score4: 0.0 });
        });

        it('should return null for invalid inputs', () => {
            expect(normalizeGradeInput('xyz')).toBeNull();
            expect(normalizeGradeInput('10')).toBeNull();
            expect(normalizeGradeInput('-1')).toBeNull();
            expect(normalizeGradeInput('')).toBeNull();
        });
    });

    describe('calculateGPASummary', () => {
        it('should calculate weighted GPA correctly', () => {
            const courses = [
                { courseCode: 'IT6001', credits: 3, score4: 4.0, isNonCredit: false }, // 12
                { courseCode: 'IT6002', credits: 2, score4: 3.0, isNonCredit: false }, // 6
                { courseCode: 'PE6001', credits: 2, score4: 4.0, isNonCredit: true }, // Ignored
            ];
            // Total weighted = 18, credits = 5 -> GPA = 3.6
            const result = calculateGPASummary(courses);
            expect(result.gpa).toBe(3.6);
            expect(result.totalAccumulatedCredits).toBe(5);
            expect(result.classification).toBe('Xuất sắc');
            expect(result.courseCount).toBe(2);
        });

        it('should handle retaken courses by taking the highest score', () => {
            const courses = [
                { courseCode: 'IT6001', credits: 3, score4: 1.0, isNonCredit: false }, // Old D
                { courseCode: 'IT6001', credits: 3, score4: 3.5, isNonCredit: false }, // Retake B+
                { courseCode: 'IT6002', credits: 2, score4: 4.0, isNonCredit: false }, // A
            ];
            // Uses B+ (3.5 * 3 = 10.5) + A (4.0 * 2 = 8) -> 18.5 / 5 = 3.7
            const result = calculateGPASummary(courses);
            expect(result.gpa).toBe(3.7);
            expect(result.totalAccumulatedCredits).toBe(5);
            expect(result.courseCount).toBe(2);
        });

        it('should exclude F from accumulated credits but include in GPA', () => {
            const courses = [
                { courseCode: 'IT6001', credits: 3, score4: 4.0, isNonCredit: false }, // 12
                { courseCode: 'IT6002', credits: 3, score4: 0.0, isNonCredit: false }, // 0
            ];
            // Weighted = 12, total gpa credits = 6 -> GPA = 2.0
            // Accumulated passed credits = 3
            const result = calculateGPASummary(courses);
            expect(result.gpa).toBe(2.0);
            expect(result.totalAccumulatedCredits).toBe(3);
            expect(result.classification).toBe('Trung bình');
        });
    });

    describe('calculateTargets', () => {
        it('should compute required average score for target GPA', () => {
            // Student has 3.0 GPA with 100 credits, total required is 140 credits (40 remaining)
            // Target 3.2: (3.2 * 140 - 3.0 * 100) / 40 = (448 - 300) / 40 = 148 / 40 = 3.7
            const targets = [
                { targetGPA: 3.2, label: 'Giỏi' },
                { targetGPA: 3.6, label: 'Xuất sắc' },
            ];

            const results = calculateTargets(3.0, 100, 140, { targets });

            expect(results[0].status).toBe('achievable');
            expect(results[0].requiredAverage).toBe(3.7);

            // Target 3.6: (3.6 * 140 - 300) / 40 = (504 - 300) / 40 = 204 / 40 = 5.1 -> Impossible (> 4.0)
            expect(results[1].status).toBe('impossible');
            expect(results[1].requiredAverage).toBe(5.1);
        });

        it('should mark achievable with 0 when target is already exceeded', () => {
            const targets = [{ targetGPA: 2.5, label: 'Khá' }];
            // 3.8 GPA with 100 credits out of 140:
            // (2.5 * 140 - 380) / 40 = -30 / 40 <= 0 -> Already guaranteed
            const results = calculateTargets(3.8, 100, 140, { targets });
            expect(results[0].status).toBe('achievable');
            expect(results[0].requiredAverage).toBe(0);
        });

        it('should compute customTargetGPA correctly when provided', () => {
            const targets = [{ targetGPA: 3.2, label: 'Giỏi' }];
            // GPA 3.0 with 100/140 credits, custom target 3.5:
            // (3.5 * 140 - 300) / 40 = (490 - 300) / 40 = 190 / 40 = 4.75 -> impossible
            const results = calculateTargets(3.0, 100, 140, { customTargetGPA: 3.5, targets });
            expect(results.length).toBe(2);
            expect(results[1].isCustom).toBe(true);
            expect(results[1].targetGPA).toBe(3.5);
            expect(results[1].status).toBe('impossible');
            expect(results[1].requiredAverage).toBe(4.75);
        });

        it('should handle course list with empty un-graded courses correctly', () => {
            const courses = [
                { courseCode: 'IT6001', credits: 3, score4: 4.0, isNonCredit: false },
                { courseCode: 'IT6002', credits: 2, score4: null, isNonCredit: false }, // Ungraded
            ];
            const result = calculateGPASummary(courses);
            expect(result.gpa).toBe(4.0);
            expect(result.totalAccumulatedCredits).toBe(3);
            expect(result.courseCount).toBe(1);

            // Simulate grade for the empty course
            courses[1].score4 = 3.0;
            const updated = calculateGPASummary(courses);
            expect(updated.gpa).toBe(3.6); // (12 + 6) / 5 = 3.6
            expect(updated.totalAccumulatedCredits).toBe(5);
            expect(updated.courseCount).toBe(2);
        });
    });
});
