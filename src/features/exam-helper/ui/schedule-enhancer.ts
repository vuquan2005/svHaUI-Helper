/**
 * Exam Helper - Schedule Enhancer Component
 * Enhances the native exam schedule table on /student/schedulefees/transactionmodules:
 * - Inverts row order (reverses school default order so newest/closest exams are on top)
 * - Renumbers STT
 * - Adds countdown badges and visual highlighting
 */

import { getExamCountdown } from '../time-utils';
import { getBadgeClass, getRowClass } from './plan-table-view';
import styles from '../style.module.scss';

const COL_INDEX = 1;
const COL_DATE = 3;
const COL_TIME = 4;

/**
 * Enhance the DOM table on the Exam Schedule page.
 *
 * @param tableEl - The schedule table element
 */
export function enhanceScheduleTable(tableEl: HTMLTableElement): void {
    const tbody = tableEl.querySelector('tbody');
    if (!tbody) return;

    // 1. Invert rows (reverse default order) if not already inverted
    if (tableEl.dataset.examInverted !== 'true') {
        tableEl.dataset.examInverted = 'true';
        const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>('tr')).filter(
            (r) => !r.classList.contains('kTableHeader')
        );
        if (rows.length > 1) {
            rows.reverse().forEach((row, idx) => {
                const sttCell = row.querySelector(`td:nth-child(${COL_INDEX})`);
                if (sttCell) {
                    sttCell.textContent = String(idx + 1);
                }
                tbody.appendChild(row);
            });
        }
    }

    // 2. Add badges and row highlights
    const currentRows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>('tr')).filter(
        (r) => !r.classList.contains('kTableHeader')
    );
    for (const row of currentRows) {
        if (row.dataset.examEnhanced === 'true') continue;
        row.dataset.examEnhanced = 'true';

        const cells = row.querySelectorAll('td');
        if (cells.length < COL_TIME) continue;

        const dateCell = cells[COL_DATE - 1];
        const timeCell = cells[COL_TIME - 1];

        const examDate = dateCell?.textContent?.trim() ?? '';
        const examTime = timeCell?.textContent?.trim() ?? '';

        if (!examDate || !examTime) continue;

        const countdown = getExamCountdown(examDate, examTime);

        // Highlight row
        const rowClass = getRowClass(countdown.urgency);
        if (rowClass) {
            row.classList.add(rowClass);
        }

        // Add badge under date
        const badge = document.createElement('div');
        badge.className = `${styles.badge} ${getBadgeClass(countdown.urgency)}`;
        badge.title = countdown.label;
        badge.textContent = countdown.shortLabel;

        dateCell.appendChild(badge);
    }
}
