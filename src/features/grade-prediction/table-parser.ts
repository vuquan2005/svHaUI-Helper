/**
 * Table Parser - Parses HaUI Exam Results table into CourseGradeRow model
 */

import { CourseGradeRow, GradeLetter } from './types';
import { isNonCreditCourse, normalizeGradeInput } from './grade-calculator';
import { GRADE_TO_SCORE4 } from './config';

interface ColumnIndices {
    codeIndex: number;
    nameIndex: number;
    creditIndex: number;
    score4Index: number;
    gradeIndex: number;
}

/**
 * Standard column indices for HaUI Exam Result table:
 * 0: STT
 * 1: Mã HP (e.g., BS6019)
 * 2: Mã in (e.g., HP7202)
 * 3: Học phần (Tên môn học)
 * 4: Học kỳ
 * 5: Số tín chỉ (e.g., 2.0)
 * 6: TB KTTX L1
 * 7: TB KTTX L2
 * 8: Điểm thi L1
 * 9: Điểm thi L2
 * 10: Điểm phúc khảo
 * 11: TBM Điểm 10
 * 12: TBM Điểm 4 (e.g., 1.5, 4)
 * 13: TBM Điểm chữ (e.g., D+, A)
 * 14: Xếp loại
 * 15: Ghi chú
 * 16: Ý kiến
 */
const DEFAULT_INDICES: ColumnIndices = {
    codeIndex: 1,
    nameIndex: 3,
    creditIndex: 5,
    score4Index: 12,
    gradeIndex: 13,
};

export interface ParseResult {
    rows: CourseGradeRow[];
    gridContainer: HTMLElement | null;
    mainTable: HTMLTableElement | null;
    officialGPA: number | null;
    officialAccumulatedCredits: number | null;
}

/**
 * Parse HaUI grade table in DOM
 */
export function parseGradeTable(
    container: HTMLElement | Document = document,
    rulesText?: string
): ParseResult {
    const gridContainer = (container.querySelector('div.kGrid') ||
        container.querySelector('#frmMain')) as HTMLElement | null;

    if (!gridContainer) {
        return {
            rows: [],
            gridContainer: null,
            mainTable: null,
            officialGPA: null,
            officialAccumulatedCredits: null,
        };
    }

    const tables = Array.from(gridContainer.querySelectorAll('table'));
    if (tables.length === 0) {
        return {
            rows: [],
            gridContainer,
            mainTable: null,
            officialGPA: null,
            officialAccumulatedCredits: null,
        };
    }

    // Filter course rows: must have at least 14 cells (to ensure all score columns are present)
    const allRows = Array.from(
        gridContainer.querySelectorAll('tbody tr, tr.kTableAltRow, tr.kTableRow')
    );
    const rowElements = allRows.filter((tr) => {
        return tr.children.length >= 14 && !tr.closest('thead');
    }) as HTMLTableRowElement[];

    const mainTable = (rowElements[0]?.closest('table') || tables[0]) as HTMLTableElement;
    const rows: CourseGradeRow[] = [];

    rowElements.forEach((row, rowIndex) => {
        const cells = row.children;
        const codeCell = cells[DEFAULT_INDICES.codeIndex] as HTMLTableCellElement;
        const nameCell = cells[DEFAULT_INDICES.nameIndex] as HTMLTableCellElement;
        const creditCell = cells[DEFAULT_INDICES.creditIndex] as HTMLTableCellElement;
        const score4Cell = cells[DEFAULT_INDICES.score4Index] as HTMLTableCellElement;
        const gradeCell = cells[DEFAULT_INDICES.gradeIndex] as HTMLTableCellElement;

        if (!codeCell || !nameCell || !creditCell || !score4Cell || !gradeCell) return;

        const courseCode = codeCell.textContent?.trim() || '';
        const courseName = nameCell.textContent?.trim() || '';

        // Must be a valid course code (e.g., BS6019, ME6052, PE6001)
        if (!courseCode || !/^[A-Z]{2,}\d+/i.test(courseCode)) return;

        const rawCredits = creditCell.textContent?.trim() || '0';
        const credits = parseFloat(rawCredits) || 0;

        const rawGrade = gradeCell.textContent?.trim() || '';
        const rawScore4 = score4Cell.textContent?.trim() || '';

        // Determine grade and score4
        let parsedGrade: GradeLetter | null = null;
        let parsedScore4: number | null = null;

        const gradeNormalized = normalizeGradeInput(rawGrade);
        if (gradeNormalized) {
            parsedGrade = gradeNormalized.grade;
            parsedScore4 = gradeNormalized.score4;
        } else {
            const score4Num = parseFloat(rawScore4);
            if (!isNaN(score4Num) && score4Num >= 0 && score4Num <= 4.0) {
                parsedScore4 = score4Num;
                const rounded = Math.round(score4Num * 2) / 2;
                parsedGrade =
                    (Object.keys(GRADE_TO_SCORE4) as GradeLetter[]).find(
                        (k) => GRADE_TO_SCORE4[k] === rounded
                    ) || null;
            }
        }

        const nonCredit = isNonCreditCourse(courseCode, rulesText);

        const indexCell = cells[0] as HTMLTableCellElement;

        rows.push({
            id: `course-${courseCode}-${rowIndex}`,
            rowIndex,
            courseCode,
            courseName,
            credits,
            originalScore4: parsedScore4,
            originalGrade: parsedGrade,
            currentScore4: parsedScore4,
            currentGrade: parsedGrade,
            isNonCredit: nonCredit,
            isEdited: false,
            isSelected: false,
            element: row,
            indexCell,
            creditCell,
            score4Cell,
            gradeCell,
        });
    });

    // Parse official GPA and accumulated credits from footer summary rows
    let officialGPA: number | null = null;
    let officialAccumulatedCredits: number | null = null;

    try {
        const fullText = gridContainer.textContent || '';

        // Match: "Trung bình chung tích lũy: 2.62"
        const gpaMatch = fullText.match(/Trung bình chung tích lũy:\s*(\d+(?:\.\d+)?)/i);
        if (gpaMatch) {
            officialGPA = parseFloat(gpaMatch[1]);
        }

        // Match: "Tổng số tín chỉ tích lũy: 115.0"
        const credMatch = fullText.match(/Tổng số tín chỉ tích lũy:\s*(\d+(?:\.\d+)?)/i);
        if (credMatch) {
            officialAccumulatedCredits = parseFloat(credMatch[1]);
        }
    } catch {
        // Fallback
    }

    return {
        rows,
        gridContainer,
        mainTable,
        officialGPA,
        officialAccumulatedCredits,
    };
}
