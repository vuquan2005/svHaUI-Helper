/**
 * Configuration and constants for Grade Prediction Feature
 */

import { GradeLetter, AcademicClassification } from './types';

export const GRADE_TO_SCORE4: Record<GradeLetter, number> = {
    A: 4.0,
    'B+': 3.5,
    B: 3.0,
    'C+': 2.5,
    C: 2.0,
    'D+': 1.5,
    D: 1.0,
    F: 0.0,
};

export const SCORE4_TO_GRADE: Record<number, GradeLetter> = {
    4.0: 'A',
    3.5: 'B+',
    3.0: 'B',
    2.5: 'C+',
    2.0: 'C',
    1.5: 'D+',
    1.0: 'D',
    0.0: 'F',
};

export const DEFAULT_NON_CREDIT_RULES_TEXT = `# --- QUY TẮC MÔN KHÔNG TÍNH GPA (HaUI) ---
# Cú pháp:
# - Nhập tiền tố/mã môn (VD: PE, DC, IC6005)
# - Dùng * để đại diện chuỗi ký tự bất kỳ (VD: PE*, FL60*, FL*OT)
# - Dùng ! ở đầu để thêm NGOẠI LỆ tính điểm (VD: !FL682)
# - Hỗ trợ biểu thức chính quy Regex (VD: /^FL65\\d+/)
# - Dòng có dấu # hoặc // ở đầu là ghi chú

# Giáo dục thể chất
PE*

# Giáo dục quốc phòng
DC*

# Tin học cơ sở & nâng cao
IC6005
IC6006
IC6007

# Ngoại ngữ cơ bản & Ôn tập
FL60*
FL61*
FL62*
FL65*
FL*OT

# Ngoại lệ: Tiếng Đức cơ bản vẫn tính tín chỉ
!FL682
!FL683`;

export const CREDITS_COLORS: Record<string, string> = {
    '5.0': '#d946ef', // 5 tín - Hồng fuchsia
    '5': '#d946ef',
    '4.0': '#ef4444', // 4 tín - Đỏ tươi
    '4': '#ef4444',
    '3.0': '#f59e0b', // 3 tín - Cam hổ phách
    '3': '#f59e0b',
    '2.0': '#06b6d4', // 2 tín - Xanh cyan
    '2': '#06b6d4',
    '1.0': '#10b981', // 1 tín - Xanh lục ngọc
    '1': '#10b981',
};

export const GRADE_COLORS: Record<GradeLetter, { bg: string; text: string }> = {
    A: { bg: '#22c55e', text: '#ffffff' }, // 4.0 - Xanh lá tươi
    'B+': { bg: '#0ea5e9', text: '#ffffff' }, // 3.5 - Xanh dương sáng (Sky)
    B: { bg: '#2563eb', text: '#ffffff' }, // 3.0 - Xanh dương đậm (Blue)
    'C+': { bg: '#eab308', text: '#ffffff' }, // 2.5 - Vàng tươi
    C: { bg: '#f97316', text: '#ffffff' }, // 2.0 - Cam
    'D+': { bg: '#ef4444', text: '#ffffff' }, // 1.5 - Đỏ tươi
    D: { bg: '#b91c1c', text: '#ffffff' }, // 1.0 - Đỏ sẫm
    F: { bg: '#a855f7', text: '#ffffff' }, // 0.0 - Tím
};

export const TARGET_GPA_CONFIGS = [
    { targetGPA: 3.6, label: 'Xuất sắc (3.6)' },
    { targetGPA: 3.2, label: 'Giỏi (3.2)' },
    { targetGPA: 2.5, label: 'Khá (2.5)' },
];

export const DEFAULT_TOTAL_CREDITS = 142;

export function getAcademicClassification(gpa: number): AcademicClassification {
    if (gpa >= 3.6) return 'Xuất sắc';
    if (gpa >= 3.2) return 'Giỏi';
    if (gpa >= 2.5) return 'Khá';
    if (gpa >= 2.0) return 'Trung bình';
    if (gpa >= 1.0) return 'Yếu';
    return 'Kém';
}
